'use client';

// Exposes methods for PNG capture, camera view management, and WebM video recording.

import { useImperativeHandle, forwardRef, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneApi } from '@/components/Scene/Scene';
import { OrbitControls } from 'three-stdlib';
import { SceneState } from '@/types/animation';

export const SceneCaptureController = forwardRef<SceneApi>((props, ref) => {
  // Get controls from useThree
  const { gl, scene, camera, controls } = useThree();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const originalSizeRef = useRef(new THREE.Vector2());
  const originalAspectRef = useRef<number>(1);

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

      // Set output size based on aspect ratio
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

      // Restore original camera and renderer size
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

    // Start recording a WebM video of the scene at the specified aspect ratio
    startRecording: (aspectRatio: string) => {
      gl.getSize(originalSizeRef.current);
      if (camera instanceof THREE.PerspectiveCamera) {
        originalAspectRef.current = camera.aspect;
      }

      let width, height;
      switch (aspectRatio) {
        case '16:9':
          width = 1920;
          height = 1080;
          break;
        case '9:16':
          width = 1080;
          height = 1920;
          break;
        case '1:1':
          width = 1080;
          height = 1080;
          break;
        case '4:3':
          width = 1440;
          height = 1080;
          break;
        default:
          width = 1920;
          height = 1080;
      }

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      gl.setSize(width, height, false);

      const canvas = gl.domElement;
      const stream = canvas.captureStream(60);

      if (!MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
        console.error('video/webm; codecs=vp9 not supported');
      }

      recorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: 25000000,
      });

      recordedChunksRef.current = [];

      recorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorderRef.current.start();
      console.log(`Recording started at ${width}x${height}, 60fps, 15Mbps`);
    },

    // Stop recording and download the video file
    stopRecording: () => {
      if (!recorderRef.current || recorderRef.current.state === 'inactive') {
        return;
      }

      recorderRef.current.onstop = () => {
        console.log('Recording stopped. Compiling video...');
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm',
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mockme-animation.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        recordedChunksRef.current = [];

        // Restore original camera and renderer size
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.aspect = originalAspectRef.current;
          camera.updateProjectionMatrix();
        }
        gl.setSize(
          originalSizeRef.current.width,
          originalSizeRef.current.height,
          false
        );
        console.log('Canvas size restored.');
      };

      recorderRef.current.stop();
    },
  }));
  SceneCaptureController.displayName = 'SceneCaptureController';

  return null;
});