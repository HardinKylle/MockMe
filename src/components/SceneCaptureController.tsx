'use client';

import { useImperativeHandle, forwardRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneApi } from '@/components/Scene';
import { OrbitControls } from 'three-stdlib';
import { CameraView } from '@/types/animation';

export const SceneCaptureController = forwardRef<SceneApi>((props, ref) => {
  // Get controls from useThree
  const { gl, scene, camera, controls } = useThree();

  useImperativeHandle(ref, () => ({
    capture: (aspectRatio: string) => {

      // Add a type guard to ensure we have the right camera
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

    setView: (position: readonly [number, number, number], target: readonly [number, number, number]) => {
      if (!controls) {
        console.error("OrbitControls not found.");
        return;
      }

      // Cast controls to OrbitControls type
      const orbitControls = controls as unknown as OrbitControls;

      // Set camera position
      camera.position.set(...position);

      // Set controls target
      orbitControls.target.set(...target);

      orbitControls.update();
    },
    
    getView: () => {
      if (!controls) return null;
      
      const position = camera.position.clone().toArray();
      const target = (controls as any).target.clone().toArray();
      
      return { position, target } as CameraView;
    },
  }));

  SceneCaptureController.displayName = 'SceneCaptureController';

  return null;
});