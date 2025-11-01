'use client';

// Panel for editing a single animation scene (name, duration, type, camera/model views, reorder, delete)

import { AnimationScene, SceneState, AnimationType, CustomAnimationType, PresetAnimationType } from '@/types/animation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { CameraIcon, SunsetIcon, ViewIcon, CheckIcon, Trash2Icon, ArrowLeft, ArrowRight, CameraOff } from 'lucide-react';
import { SceneApi } from '@/components/Scene/Scene';
import React, { useState, useEffect } from 'react';
import { useScene } from '@/contexts/SceneContext';
import { useAnimation } from '@/contexts/AnimationContext'

// Minimum duration for each scene
const MIN_DURATION = 0.1;

// Animation type lists
const customAnimationTypes: CustomAnimationType[] = ['hold', 'custom'];
const presetAnimationTypes: PresetAnimationType[] = [
  'spin',
  'dolly-pan-up',
  'reveal-from-top',
];

// Type guards for animation types
const isCustomAnim = (
  type: AnimationType
): type is CustomAnimationType =>
  customAnimationTypes.includes(type as CustomAnimationType);

const isPresetAnim = (
  type: AnimationType
): type is PresetAnimationType =>
  presetAnimationTypes.includes(type as PresetAnimationType);

// Format camera/model view for display
const formatView = (view: SceneState | undefined | null): React.ReactNode => {
  if (!view) {
    return <span className="text-slate-500">Not Set</span>;
  }
  const formatArray = (arr: number[]) => `[${arr.map((n) => n.toFixed(1)).join(', ')}]`;
  return (
    <div className="flex space-x-2">
      {/* Camera Stats */}
      <div className="w-1/2 space-y-0.5">
        <div className="font-medium text-slate-400">Camera</div>
        <div className="pl-1">P: {formatArray(view.position)}</div>
        <div className="pl-1">T: {formatArray(view.target)}</div>
        <div className="pl-1">Fov: {view.fov.toFixed(0)}</div>
      </div>
      {/* Model Stats */}
      <div className="w-1/2 space-y-0.5">
        <div className="font-medium text-slate-400">Model</div>
        <div className="pl-1">Pos: {formatArray(view.modelPosition)}</div>
        <div className="pl-1">Rot: {formatArray(view.modelRotation)}</div>
        <div className="pl-1">Scl: {view.modelScale.toFixed(2)}</div>
      </div>
    </div>
  );
};

// Props for SceneEditorPanel
interface SceneEditorPanelProps {
  isVisible: boolean;
  sceneRef: React.RefObject<SceneApi | null>;
}

// Helper to reorder scenes in array
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function SceneEditorPanel({
  isVisible,
  sceneRef,
}: SceneEditorPanelProps) {
  // Animation context values
  const {
    animationScenes,
    setAnimationScenes,
    selectedSceneId,
    setSelectedSceneId,
  } = useAnimation();

  // Scene context values
  const { sceneControls } = useScene();

  // Find selected scene and current state
  const selectedScene = animationScenes.find((s) => s.id === selectedSceneId);
  const currentState = sceneControls;

  // Local state hooks
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [durationInput, setDurationInput] = useState(
    selectedScene ? selectedScene.duration.toString() : '0.1'
  );

  // Sync duration input with selected scene
  useEffect(() => {
    if (selectedScene) {
      setDurationInput(selectedScene.duration.toString());
    }
  }, [selectedScene?.duration]);

  // Hide panel if not visible or no scene selected
  if (!isVisible || !selectedScene) return null;

  const currentIndex = animationScenes.findIndex((s) => s.id === selectedScene.id);

  // Update scene with new values
  const handleUpdateScene = (
    sceneId: string,
    updates: Partial<AnimationScene>
  ) => {
    setAnimationScenes((currentScenes) =>
      currentScenes.map((scene) =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      )
    );
  };

  // Delete scene and select next/previous if needed
  const handleDeleteScene = (sceneId: string) => {
    if (animationScenes.length <= 1) return;

    const deletedIndex = animationScenes.findIndex((s) => s.id === sceneId);

    setAnimationScenes((currentScenes) =>
      currentScenes.filter((scene) => scene.id !== sceneId)
    );

    if (selectedSceneId === sceneId) {
      if (deletedIndex === 0 && animationScenes.length > 1) {
        setSelectedSceneId(animationScenes[1].id);
      } else if (deletedIndex > 0) {
        setSelectedSceneId(animationScenes[deletedIndex - 1].id);
      } else {
        setSelectedSceneId(null);
      }
    }
  };

  // Reorder scenes handler
  const handleReorderScenes = (newScenes: AnimationScene[]) => {
    setAnimationScenes(newScenes);
  };

  // Determine active animation category
  const activeCategory = isCustomAnim(selectedScene.animationType)
    ? 'custom'
    : isPresetAnim(selectedScene.animationType)
      ? 'preset'
      : 'custom';

  // Move scene left/right in timeline
  const handleMove = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= animationScenes.length) {
      return;
    }
    const newScenes = reorder(animationScenes, currentIndex, newIndex);
    handleReorderScenes(newScenes);
  };

  // Set camera/model view for start/end
  const handleSetView = (type: 'startView' | 'endView') => {
    if (currentState) {
      const newView: SceneState = {
        position: currentState.cameraPosition,
        target: currentState.cameraTarget,
        fov: currentState.cameraFov,
        modelPosition: currentState.modelPosition,
        modelRotation: currentState.modelRotation,
        modelScale: currentState.modelScale,
      };
      handleUpdateScene(selectedScene.id, { [type]: newView });
      setShowSavedMessage(true);
      setTimeout(() => {
        setShowSavedMessage(false);
      }, 1500);
    }
  };

  // Clear camera/model view
  const handleClearView = (viewType: 'startView' | 'endView') => {
    handleUpdateScene(selectedScene.id, { [viewType]: undefined });
  };

  // Handle duration input change
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDurationInput(val);
    const parsedVal = parseFloat(val);
    if (!isNaN(parsedVal) && parsedVal > 0) {
      handleUpdateScene(selectedScene.id, { duration: parsedVal });
    }
  };

  // Validate duration on blur
  const handleDurationBlur = () => {
    const parsedVal = parseFloat(durationInput);
    if (isNaN(parsedVal) || parsedVal < MIN_DURATION) {
      handleUpdateScene(selectedScene.id, { duration: MIN_DURATION });
    } else {
      handleUpdateScene(selectedScene.id, { duration: parsedVal });
    }
  };

  return (
    <div
      className={`z-20 w-60 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl transition-all duration-300 ease-out ${isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-10 pointer-events-none'
        } flex flex-col max-h-[75h]`}
    >
      {/* Header with title and delete button */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-100">Edit Scene</h3>
          {/* Saved message */}
          <div
            className={`flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 transition-all duration-300 ${showSavedMessage ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <CheckIcon className="h-3 w-3 text-green-400" />
            <span className="text-[10px] font-medium text-green-300">
              Saved
            </span>
          </div>
        </div>
        {/* Delete scene button */}
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDeleteScene(selectedScene.id)}
          disabled={animationScenes.length <= 1}
          tooltip="Delete Scene"
          tooltipSide="bottom"
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Scene edit form */}
      <div className="p-3 space-y-3 ">
        {/* Scene name input */}
        <div className="space-y-1.5">
          <Label htmlFor="scene-name" className="text-xs">
            Name
          </Label>
          <Input
            id="scene-name"
            value={selectedScene.name}
            onChange={(e) =>
              handleUpdateScene(selectedScene.id, { name: e.target.value })
            }
          />
        </div>

        {/* Duration input */}
        <div className="space-y-1.5">
          <Label htmlFor="scene-duration" className="text-xs">
            Duration (s)
          </Label>
          <Input
            id="scene-duration"
            type="number"
            step="0.1"
            min={MIN_DURATION}
            value={durationInput}
            onChange={handleDurationChange}
            onBlur={handleDurationBlur}
          />
        </div>

        {/* Animation Type Toggle */}
        <div className="space-y-1.5">
          <Label className="text-xs">Animation Type</Label>
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant={activeCategory === 'custom' ? 'secondary' : 'ghost'}
              size="md"
              onClick={() => {
                if (!isCustomAnim(selectedScene.animationType)) {
                  handleUpdateScene(selectedScene.id, {
                    animationType: customAnimationTypes[0],
                  });
                }
              }}
              className="w-full"
            >
              Custom
            </Button>
            <Button
              variant={activeCategory === 'preset' ? 'secondary' : 'ghost'}
              size="md"
              onClick={() => {
                if (!isPresetAnim(selectedScene.animationType)) {
                  handleUpdateScene(selectedScene.id, {
                    animationType: presetAnimationTypes[0],
                  });
                }
              }}
              className="w-full"
            >
              Preset
            </Button>
          </div>
        </div>

        {/* Custom animation type dropdown */}
        {activeCategory === 'custom' && (
          <div className="space-y-1.5 animate-in fade-in-0 duration-200">
            <Label htmlFor="scene-custom-animation" className="text-xs">
              Custom Type
            </Label>
            <Select
              id="scene-custom-animation"
              value={selectedScene.animationType}
              onChange={(e) => {
                handleUpdateScene(selectedScene.id, {
                  animationType: e.target.value as CustomAnimationType,
                });
              }}
            >
              <option value="hold">Hold View</option>
              <option value="custom">Custom View</option>
            </Select>
          </div>
        )}

        {/* Preset animation type dropdown */}
        {activeCategory === 'preset' && (
          <div className="space-y-1.5 animate-in fade-in-0 duration-200">
            <Label htmlFor="scene-preset-animation" className="text-xs">
              Preset Type
            </Label>
            <Select
              id="scene-preset-animation"
              value={selectedScene.animationType}
              onChange={(e) => {
                handleUpdateScene(selectedScene.id, {
                  animationType: e.target.value as PresetAnimationType,
                });
              }}
            >
              <option value="spin">Spin</option>
              <option value="dolly-pan-up">Dolly Pan Up</option>
              <option value="reveal-from-top">Reveal From Top</option>
            </Select>
          </div>
        )}

        {/* Hold animation view controls */}
        {selectedScene.animationType === 'hold' && (
          <div className="space-y-2 pt-2 border-t border-slate-700/50 animate-in fade-in-0 duration-200">
            <Label className="text-xs">Camera View</Label>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => handleSetView('startView')}
              >
                <ViewIcon className="h-4 w-4 mr-2" />
                Set View
              </Button>
              {selectedScene.startView && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleClearView('startView')}
                  tooltip="Clear View"
                  tooltipSide="right"
                >
                  <CameraOff className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {/* Display camera/model coordinates */}
            <div className="text-[10px] text-slate-300 leading-tight wrap-break-words pt-1">
              {formatView(selectedScene.startView)}
            </div>
          </div>
        )}

        {/* Custom animation start/end view controls */}
        {selectedScene.animationType === 'custom' && (
          <div className="space-y-3 pt-2 border-t border-slate-700/50 animate-in fade-in-0 duration-200">
            {/* Start View */}
            <div className="space-y-1.5">
              <Label className="text-xs">Start View</Label>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={() => handleSetView('startView')}
                >
                  <CameraIcon className="h-4 w-4 mr-2" />
                  Set Start
                </Button>
                {selectedScene.startView && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleClearView('startView')}
                    tooltip="Clear Start View"
                    tooltipSide="right"
                  >
                    <CameraOff className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              {/* Display start view coordinates */}
              <div className="text-[10px] text-slate-300 leading-tight wrap-break-words pt-1">
                {formatView(selectedScene.startView)}
              </div>
            </div>

            {/* End View */}
            <div className="space-y-1.5">
              <Label className="text-xs">End View</Label>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={() => handleSetView('endView')}
                >
                  <SunsetIcon className="h-4 w-4 mr-2" />
                  Set End
                </Button>
                {selectedScene.endView && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleClearView('endView')}
                    tooltip="Clear End View"
                    tooltipSide="right"
                  >
                    <CameraOff className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              {/* Display end view coordinates */}
              <div className="text-[10px] text-slate-300 leading-tight wrap-break-words pt-1">
                {formatView(selectedScene.endView)}
              </div>
            </div>
          </div>
        )}

        {/* Reorder scene controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <Label className="text-xs">Reorder</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMove('left')}
              disabled={currentIndex === 0}
              tooltip="Move Left"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMove('right')}
              disabled={currentIndex === animationScenes.length - 1}
              tooltip="Move Right"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}