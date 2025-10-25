'use client';

import { AnimationScene, CameraView } from '@/types/animation';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select } from './ui/Select';
import { CameraIcon, SunsetIcon } from 'lucide-react';
import { SceneApi } from './Scene';
import React from 'react';



interface SceneEditorPanelProps {
  isVisible: boolean;
  selectedScene: AnimationScene;
  onUpdateScene: (
    sceneId: string,
    updates: Partial<AnimationScene>
  ) => void;
  sceneRef: React.RefObject<SceneApi | null> ;
}


export default function SceneEditorPanel({
  isVisible,
  selectedScene,
  onUpdateScene,
  sceneRef,
}: SceneEditorPanelProps) {
  if (!isVisible) return null;

  const handleSetView = (type: 'startView' | 'endView') => {
    const view = sceneRef.current?.getView();
    if (view) {
      onUpdateScene(selectedScene.id, { [type]: view });
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
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-slate-700/50">
        <h3 className="text-sm font-medium text-slate-100">Edit Scene</h3>
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
            value={selectedScene.duration}
            onChange={(e) =>
              onUpdateScene(selectedScene.id, {
                duration: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        {/* Animation Preset */}
        <div className="space-y-1.5">
          <Label htmlFor="scene-animation">Animation</Label>
          <Select
            id="scene-animation"
            value={selectedScene.animationType}
            onChange={(e) =>
              onUpdateScene(selectedScene.id, {
                animationType: e.target.value as 'static' | 'spin' | 'custom',
              })
            }
          >
            <option value="static">Static</option>
            <option value="spin">Spin</option>
            <option value="custom">Custom View</option>
          </Select>
        </div>

        {/* Start/End Views (Only show for 'custom' type) */}
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
      </div>
    </div>
  );
}