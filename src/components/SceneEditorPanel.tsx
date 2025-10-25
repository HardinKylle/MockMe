'use client';

import { AnimationScene, CameraView, AnimationType, CustomAnimationType, PresetAnimationType } from '@/types/animation';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select } from './ui/Select';
import { CameraIcon, SunsetIcon, ViewIcon, CheckIcon, Trash2Icon, ArrowLeft, ArrowRight } from 'lucide-react';
import { SceneApi } from './Scene';
import React, { useState, useEffect } from 'react';

const MIN_DURATION = 1;

// --- Helper Types for Animation Dropdowns ---
// Explicitly list the types for our new dropdowns
const customAnimationTypes: CustomAnimationType[] = ['hold', 'custom'];
const presetAnimationTypes: PresetAnimationType[] = ['spin', 'dolly-pan-up', 'reveal-from-top'];

// Type guard functions to check which category is active
const isCustomAnim = (
  type: AnimationType
): type is CustomAnimationType =>
  customAnimationTypes.includes(type as CustomAnimationType);

const isPresetAnim = (
  type: AnimationType
): type is PresetAnimationType =>
  presetAnimationTypes.includes(type as PresetAnimationType);
// --- End Helper Types ---


interface SceneEditorPanelProps {
  isVisible: boolean;
  selectedScene: AnimationScene;
  onUpdateScene: (
    sceneId: string,
    updates: Partial<AnimationScene>
  ) => void;
  sceneRef: React.RefObject<SceneApi | null>;
  onDeleteScene: (sceneId: string) => void;
  sceneCount: number;
  scenes: AnimationScene[];
  onReorderScenes: (scenes: AnimationScene[]) => void;

}

// Helper function to reorder array
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}


export default function SceneEditorPanel({
  isVisible,
  selectedScene,
  onUpdateScene,
  sceneRef,
  onDeleteScene,
  sceneCount,
  scenes,              
  onReorderScenes,
}: SceneEditorPanelProps) {
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [durationInput, setDurationInput] = useState(
    selectedScene.duration.toString()
  );
  const currentIndex = scenes.findIndex((s) => s.id === selectedScene.id);

  useEffect(() => {
    setDurationInput(selectedScene.duration.toString());
  }, [selectedScene.duration]);

  if (!isVisible) return null;

  const handleMove = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= scenes.length) {
      return;
    }

    const newScenes = reorder(scenes, currentIndex, newIndex);
    onReorderScenes(newScenes);
  };

  const handleSetView = (type: 'startView' | 'endView') => {
    const view = sceneRef.current?.getView();
    if (view) {
      onUpdateScene(selectedScene.id, { [type]: view });

      setShowSavedMessage(true);
      // Automatically hide it after 1.5 seconds
      setTimeout(() => {
        setShowSavedMessage(false);
      }, 1500);
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDurationInput(val); // Allow user to type empty string, "1.", etc.

    const parsedVal = parseFloat(val);
    // If it's a valid number, update the parent state immediately
    if (!isNaN(parsedVal) && parsedVal > 0) {
      onUpdateScene(selectedScene.id, { duration: parsedVal });
    }
  };

  const handleDurationBlur = () => {
    const parsedVal = parseFloat(durationInput);
    // If the value is invalid or empty when user clicks away,
    // reset it to the minimum duration.
    if (isNaN(parsedVal) || parsedVal < MIN_DURATION) {
      onUpdateScene(selectedScene.id, { duration: MIN_DURATION });
    } else {
      // Otherwise, just make sure the parent is set
      onUpdateScene(selectedScene.id, { duration: parsedVal });
    }
  };

return (
    <div
      className={`fixed bottom-4 left-4 z-20 w-60 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-100">Edit Scene</h3>
          <div
            className={`flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 transition-all duration-300 ${
              showSavedMessage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <CheckIcon className="h-3 w-3 text-green-400" />
            <span className="text-[10px] font-medium text-green-300">
              Saved
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          onClick={() => onDeleteScene(selectedScene.id)}
          disabled={sceneCount <= 1}
          tooltip="Delete Scene"
          tooltipSide="bottom"
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Form */}
      <div className="p-3 space-y-3">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="scene-name">Name</Label>
          <Input
            id="scene-name"
            value={selectedScene.name}
            onChange={(e) =>
              onUpdateScene(selectedScene.id, { name: e.target.value })
            }
          />
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <Label htmlFor="scene-duration">Duration (s)</Label>
          <Input
            id="scene-duration"
            type="number"
            step="0.1"
            min={MIN_DURATION} // Set min
            value={durationInput} // Use local string state
            onChange={handleDurationChange} // Use new handler
            onBlur={handleDurationBlur} // Add blur handler
          />
        </div>


        {/* Custom Animations */}
        <div className="space-y-1.5">
          <Label htmlFor="scene-custom-animation">Custom Animations</Label>
          <Select
            id="scene-custom-animation"
            value={
              isCustomAnim(selectedScene.animationType)
                ? selectedScene.animationType
                : ''
            }
            onChange={(e) => {
              if (e.target.value) {
                onUpdateScene(selectedScene.id, {
                  animationType: e.target.value as CustomAnimationType,
                });
              }
            }}
          >
            <option value="" disabled>
              Select custom...
            </option>
            <option value="hold">Hold View</option>
            <option value="custom">Custom View</option>
          </Select>
        </div>

        {/* Preset Animations */}
        <div className="space-y-1.5">
          <Label htmlFor="scene-preset-animation">Preset Animations</Label>
          <Select
            id="scene-preset-animation"
            value={
              isPresetAnim(selectedScene.animationType)
                ? selectedScene.animationType
                : ''
            }
            onChange={(e) => {
              if (e.target.value) {
                onUpdateScene(selectedScene.id, {
                  animationType: e.target.value as PresetAnimationType,
                });
              }
            }}
          >
            <option value="" disabled>
              Select preset animations
            </option>
            <option value="spin">Spin</option>
            <option value="dolly-pan-up">Dolly Pan Up</option>
            <option value="reveal-from-top">Reveal From Top</option>
          </Select>
        </div>


        {selectedScene.animationType === 'hold' && (
          <div className="space-y-2 pt-2 border-t border-slate-700/50">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleSetView('startView')}
            >
              <ViewIcon className="h-4 w-4 mr-2" />
              Set View
            </Button>
          </div>
        )}

        {/* This conditional logic also still works perfectly! */}
        {selectedScene.animationType === 'custom' && (
          <div className="space-y-2 pt-2 border-t border-slate-700/50">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleSetView('startView')}
            >
              <CameraIcon className="h-4 w-4 mr-2" />
              Set Start View
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleSetView('endView')}
            >
              <SunsetIcon className="h-4 w-4 mr-2" />
              Set End View
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <Label>Reorder</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7"
              onClick={() => handleMove('left')}
              disabled={currentIndex === 0} // Disable if first
              tooltip="Move Left"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7"
              onClick={() => handleMove('right')}
              disabled={currentIndex === scenes.length - 1} // Disable if last
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