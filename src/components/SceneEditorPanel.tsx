'use client';

import {
  AnimationScene,
  CameraView,
  AnimationType,
  CustomAnimationType,
  PresetAnimationType,
} from '@/types/animation';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select } from './ui/Select';
import {
  CameraIcon,
  SunsetIcon,
  ViewIcon,
  CheckIcon,
  Trash2Icon,
  ArrowLeft,
  ArrowRight,
  CameraOff,
} from 'lucide-react';
import { SceneApi } from './Scene';
import React, { useState, useEffect } from 'react';

const MIN_DURATION = 0.1;

// --- Helper Types for Animation Dropdowns ---
const customAnimationTypes: CustomAnimationType[] = ['hold', 'custom'];
const presetAnimationTypes: PresetAnimationType[] = [
  'spin',
  'dolly-pan-up',
  'reveal-from-top',
];

const isCustomAnim = (
  type: AnimationType
): type is CustomAnimationType =>
  customAnimationTypes.includes(type as CustomAnimationType);

const isPresetAnim = (
  type: AnimationType
): type is PresetAnimationType =>
  presetAnimationTypes.includes(type as PresetAnimationType);
// --- End Helper Types ---

// --- *** MODIFIED: formatView now shows Position and Target *** ---
const formatView = (view: CameraView | undefined | null) => {
  if (!view) return 'Not Set';
  // Show both position and target
  const pos = `P:[${view.position.map((p) => p.toFixed(1)).join(', ')}]`;
  const target = `T:[${view.target.map((t) => t.toFixed(1)).join(', ')}]`;
  return `${pos} ${target}`;
};
// --- *** END MODIFICATION *** ---

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

  const activeCategory = isCustomAnim(selectedScene.animationType)
    ? 'custom'
    : isPresetAnim(selectedScene.animationType)
    ? 'preset'
    : 'custom';

  useEffect(() => {
    setDurationInput(selectedScene.duration.toString());
  }, [selectedScene.duration]);

  if (!isVisible) return null;

  const handleMove = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
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
      setTimeout(() => {
        setShowSavedMessage(false);
      }, 1500);
    }
  };

  const handleClearView = (viewType: 'startView' | 'endView') => {
    onUpdateScene(selectedScene.id, { [viewType]: undefined });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDurationInput(val);
    const parsedVal = parseFloat(val);
    if (!isNaN(parsedVal) && parsedVal > 0) {
      onUpdateScene(selectedScene.id, { duration: parsedVal });
    }
  };

  const handleDurationBlur = () => {
    const parsedVal = parseFloat(durationInput);
    if (isNaN(parsedVal) || parsedVal < MIN_DURATION) {
      onUpdateScene(selectedScene.id, { duration: MIN_DURATION });
    } else {
      onUpdateScene(selectedScene.id, { duration: parsedVal });
    }
  };

  return (
    <div
      className={`z-20 w-60 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl transition-all duration-300 ease-out ${
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
          variant="danger"
          size="sm"
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
          <Label htmlFor="scene-name" className="text-xs">
            Name
          </Label>
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
                  onUpdateScene(selectedScene.id, {
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
                  onUpdateScene(selectedScene.id, {
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

        {/* Custom Animations Dropdown (Conditional) */}
        {activeCategory === 'custom' && (
          <div className="space-y-1.5 animate-in fade-in-0 duration-200">
            <Label htmlFor="scene-custom-animation" className="text-xs">
              Custom Type
            </Label>
            <Select
              id="scene-custom-animation"
              value={selectedScene.animationType}
              onChange={(e) => {
                onUpdateScene(selectedScene.id, {
                  animationType: e.target.value as CustomAnimationType,
                });
              }}
            >
              <option value="hold">Hold View</option>
              <option value="custom">Custom View</option>
            </Select>
          </div>
        )}

        {/* Preset Animations Dropdown (Conditional) */}
        {activeCategory === 'preset' && (
          <div className="space-y-1.5 animate-in fade-in-0 duration-200">
            <Label htmlFor="scene-preset-animation" className="text-xs">
              Preset Type
            </Label>
            <Select
              id="scene-preset-animation"
              value={selectedScene.animationType}
              onChange={(e) => {
                onUpdateScene(selectedScene.id, {
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

        {/* 'hold' section */}
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
            {/* Coordinate Display (P and T) */}
            <p className="text-[10px] text-slate-400 leading-tight break-words">
              {formatView(selectedScene.startView)}
            </p>
          </div>
        )}

        {/* 'custom' section */}
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
              {/* Coordinate Display (P and T) */}
              <p className="text-[10px] text-slate-400 leading-tight break-words">
                {formatView(selectedScene.startView)}
              </p>
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
              {/* Coordinate Display (P and T) */}
              <p className="text-[10px] text-slate-400 leading-tight break-words">
                {formatView(selectedScene.endView)}
              </p>
            </div>
          </div>
        )}

        {/* Reorder Section */}
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
              disabled={currentIndex === scenes.length - 1}
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