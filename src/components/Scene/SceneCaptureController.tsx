'use client';

// Exposes methods for PNG capture, camera view management, and MP4 video recording via WebCodecs.

import { useImperativeHandle, forwardRef, useRef } from 'react';
import { useThree, advance } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneApi } from '@/components/Scene/Scene';
import { OrbitControls } from 'three-stdlib';
import { SceneState } from '@/types/animation';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { useAnimation } from '@/contexts/AnimationContext';

const FPS = 60;
const FRAME_DURATION_US = 1_000_000 / FPS; // microseconds per frame
const FRAME_DURATION_S = 1 / FPS; // seconds per frame
const KEYFRAME_INTERVAL = 150; // keyframe every N frames

export const SceneCaptureController = forwardRef<SceneApi>((props, ref) => {
  const { gl, scene, camera, controls } = useThree();
  const { exportTimeRef, exportVideoRef } = useAnimation();

  const originalSizeRef = useRef(new THREE.Vector2());
  const originalAspectRef = useRef<number>(1);
  const encoderRef = useRef<VideoEncoder | null>(null);
  const cancelledRef = useRef(false);

  useImperativeHandle(ref, () => ({
    // Capture a PNG image of the scene at the specified aspect ratio
    capture: (aspectRatio: string) => {
      if (!(camera instanceof THREE.PerspectiveCamera)) {
        console.error("Capture controller only works with a PerspectiveCamera.");
        return;
      }

      const originalSize = new THREE.Vector2();
      gl.getSize(originalSize);

      const originalAspect = camera.aspect;

      const CAPTURE_WIDTH_BASE = 1920;
      const captureDPR = 2;
      let width, height;

      switch (aspectRatio) {
        case '16:9':
          width = CAPTURE_WIDTH_BASE;
          height = CAPTURE_WIDTH_BASE * (9 / 16);
          break;
        case '9:16':
          width = CAPTURE_WIDTH_BASE * (9 / 16);
          height = CAPTURE_WIDTH_BASE;
          break;
        case '1:1':
          width = CAPTURE_WIDTH_BASE;
          height = CAPTURE_WIDTH_BASE;
          break;
        case '4:3':
          width = CAPTURE_WIDTH_BASE;
          height = CAPTURE_WIDTH_BASE * (3 / 4);
          break;
      }

      if (!width || !height) {
        console.error("Invalid aspect ratio selected:", aspectRatio);
        return;
      }

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      gl.setSize(width * captureDPR, height * captureDPR, false);

      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL('image/png');

      camera.aspect = originalAspect;
      camera.updateProjectionMatrix();
      gl.setSize(originalSize.width, originalSize.height, false);

      return dataUrl;
    },

    // Set camera position and target
    setView: (position: readonly [number, number, number], target: readonly [number, number, number]) => {
      if (!controls) {
        console.error("OrbitControls not found.");
        return;
      }
      const orbitControls = controls as unknown as OrbitControls;
      camera.position.set(...position);
      orbitControls.target.set(...target);
      orbitControls.update();
    },

    // Get current camera and model view state
    getView: (): SceneState | null => {
      if (controls && camera) {
        return {
          position: camera.position.toArray() as [number, number, number],
          target: (controls as OrbitControls).target.toArray() as [number, number, number],
          fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : 50,
          modelPosition: [0, 0, 0],
          modelRotation: [0, 0, 0],
          modelScale: 1,
        };
      }
      return null;
    },

    // Start offline WebCodecs recording and render all frames
    startRecording: async (aspectRatio: string, totalDuration: number, onComplete: () => void) => {
      // Save original canvas size
      gl.getSize(originalSizeRef.current);
      if (camera instanceof THREE.PerspectiveCamera) {
        originalAspectRef.current = camera.aspect;
      }

      let width: number, height: number;
      switch (aspectRatio) {
        case '16:9':
          width = 1920; height = 1080; break;
        case '9:16':
          width = 1080; height = 1920; break;
        case '1:1':
          width = 1080; height = 1080; break;
        case '4:3':
          width = 1440; height = 1080; break;
        default:
          width = 1920; height = 1080;
      }

      // Resize canvas for export
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      gl.setSize(width, height, false);

      // Check WebCodecs support
      if (typeof VideoEncoder === 'undefined') {
        console.error('VideoEncoder not supported in this browser');
        // Restore size
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.aspect = originalAspectRef.current;
          camera.updateProjectionMatrix();
        }
        gl.setSize(originalSizeRef.current.width, originalSizeRef.current.height, false);
        onComplete();
        return;
      }

      cancelledRef.current = false;

      // Setup mp4-muxer
      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width,
          height,
        },
        fastStart: 'in-memory',
      });

      // Setup VideoEncoder
      const encoder = new VideoEncoder({
        output: (chunk, meta) => {
          muxer.addVideoChunk(chunk, meta ?? undefined);
        },
        error: (e) => {
          console.error('VideoEncoder error:', e);
        },
      });

      encoder.configure({
        codec: 'avc1.640028',
        width,
        height,
        bitrate: 25_000_000,
        framerate: FPS,
      });

      encoderRef.current = encoder;

      const canvas = gl.domElement;
      const totalFrames = Math.ceil(totalDuration * FPS);

      // Offline render loop
      for (let frame = 0; frame < totalFrames; frame++) {
        if (cancelledRef.current) {
          encoder.close();
          encoderRef.current = null;
          if (camera instanceof THREE.PerspectiveCamera) {
            camera.aspect = originalAspectRef.current;
            camera.updateProjectionMatrix();
          }
          gl.setSize(originalSizeRef.current.width, originalSizeRef.current.height, false);
          onComplete();
          return;
        }

        const frameTime = frame * FRAME_DURATION_S;
        exportTimeRef.current = frameTime;

        // If there's a video on the phone screen, seek and wait for decode
        const video = exportVideoRef.current;
        if (video) {
          if (!video.paused) video.pause();
          video.currentTime = frameTime;
          await new Promise<void>(resolve => {
            video.addEventListener('seeked', () => resolve(), { once: true });
          });
        }

        // Trigger R3F useFrame callbacks + render
        advance(frameTime * 1000, true);

        // Create VideoFrame and encode
        const videoFrame = new VideoFrame(canvas, {
          timestamp: frame * FRAME_DURATION_US,
        });
        encoder.encode(videoFrame, { keyFrame: frame % KEYFRAME_INTERVAL === 0 });
        videoFrame.close();

        // Yield based on encoder backpressure — only pause when the HW encoder
        // queue is saturated, otherwise keep going at full speed
        if (encoder.encodeQueueSize > 5) {
          await new Promise<void>(resolve => {
            encoder.addEventListener('dequeue', () => resolve(), { once: true });
          });
        } else if (!video && frame % 10 === 0) {
          // No video seek yielded for us, so yield occasionally to keep UI responsive
          await new Promise(r => setTimeout(r, 0));
        }
      }

      // Finalize
      await encoder.flush();
      encoder.close();
      encoderRef.current = null;
      muxer.finalize();

      // Create and download MP4
      const buffer = (muxer.target as ArrayBufferTarget).buffer;
      const blob = new Blob([buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mockme-animation.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);


      // Restore original canvas size
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = originalAspectRef.current;
        camera.updateProjectionMatrix();
      }
      gl.setSize(originalSizeRef.current.width, originalSizeRef.current.height, false);

      onComplete();
    },

    // Cancel an in-progress export
    stopRecording: () => {
      cancelledRef.current = true;
    },
  }));
  SceneCaptureController.displayName = 'SceneCaptureController';

  return null;
});
