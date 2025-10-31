"use client";

import React, { useEffect, useRef } from "react";
import { useScene } from "@/contexts/SceneContext";
import { useAnimation } from "@/contexts/AnimationContext";
import { SceneState, AnimationScene } from "@/types/animation";

export const useSceneSync = (isResetting: React.RefObject<boolean>) => {
  const { dispatchSceneControls } = useScene();
  const { selectedSceneId, animationScenes, isPlaying, isScrubbing } =
    useAnimation();

  const selectedScene = animationScenes.find((s) => s.id === selectedSceneId);

  //Sync selected scene to the camera controls
  useEffect(() => {
    if (
      selectedScene &&
      selectedScene.startView &&
      !isPlaying &&
      !isScrubbing
    ) {
      dispatchSceneControls({
        type: "SET_VIEW",
        payload: selectedScene.startView,
      });
    }
  }, [selectedScene, isPlaying, isScrubbing, dispatchSceneControls]);

  //Sync live camera changes from 3d view
  const throttledUpdateRef = useRef<NodeJS.Timeout | null>(null);

  const handleLiveCameraChange = (newState: SceneState) => {
    if (isResetting.current) return;

    if (throttledUpdateRef.current) {
      clearTimeout(throttledUpdateRef.current);
    }

    //Schedule update, throttled
    throttledUpdateRef.current = setTimeout(() => {
      dispatchSceneControls({ type: "SET_VIEW", payload: newState });
      throttledUpdateRef.current = null;
    }, 16);
  };

  //Cleanup throttle timer on unmount
  useEffect(() => {
    return () => {
      if (throttledUpdateRef.current) {
        clearTimeout(throttledUpdateRef.current);
      }
    };
  }, []);

  return {
    selectedScene,
    handleLiveCameraChange,
  };
};
