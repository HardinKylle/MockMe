'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Toggle } from '@/components/ui/Toggle';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { useScene } from '@/contexts/SceneContext';

// Props for CameraControlsPanel
interface CameraControlsPanelProps {
  onReset: () => void; // Callback to reset all controls
}

// Number input for scalar values (e.g. FOV, scale, intensity)
const NumberInput = ({
  label,
  value,
  onChange,
  step = 0.1,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) => (
  <div className="grid grid-cols-3 items-center gap-2">
    <Label className="text-xs text-slate-300 truncate">
      {label}
    </Label>
    <Input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      step={step}
      min={min}
      max={max}
      className="col-span-2 h-8 bg-slate-800/80 border-slate-700/50 text-white"
    />
  </div>
);

// Vector input for 3D values (e.g. position, rotation)
const VectorInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: [number, number, number];
  onChange: (value: [number, number, number]) => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-slate-300">{label}</Label>
    <div className="grid grid-cols-3 gap-1.5">
      {[0, 1, 2].map((index) => (
        <Input
          key={index}
          type="number"
          value={value[index]}
          onChange={(e) => {
            const newValue = [...value] as [number, number, number];
            newValue[index] = parseFloat(e.target.value);
            onChange(newValue);
          }}
          step={0.1}
          className="h-8 bg-slate-800/80 border-slate-700/50 text-white"
          aria-label={`${label} ${['X', 'Y', 'Z'][index]}`}
        />
      ))}
    </div>
  </div>
);

// Main camera controls panel component
export default function CameraControlsPanel({
  onReset,
}: CameraControlsPanelProps) {
  // Panel open/close state
  const [isOpen, setIsOpen] = useState(false);

  // Get scene controls and dispatcher from context
  const { sceneControls, dispatchSceneControls } = useScene();
  const {
    cameraPosition,
    cameraTarget,
    cameraFov,
    modelPosition,
    modelRotation,
    modelScale,
    ambientIntensity,
    directionalIntensity,
    directionalPosition,
    environmentIntensity,
    screenReflection,
  } = sceneControls;

  // Render panel UI
  return (
    <div className="relative">
      {/* Button to open/close panel */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="primary"
        size="default"
        tooltip="Scene Controls"
        tooltipSide="bottom"
        isActive={isOpen}
      >
        <SlidersHorizontal className="h-6 w-6 text-white" />
      </Button>

      {/* Panel content */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-72 h-[75vh] overflow-y-auto overflow-x-hidden rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl z-20 p-4"
          style={{ animation: 'slideUp 0.2s ease-out' }}
        >
          <div className="space-y-4">
            {/* Panel header with reset button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Scene Controls</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset} 
                tooltip="Reset All"
                tooltipSide="bottom"
              >
                <RotateCcw className="h-4 w-4 text-slate-300 hover:text-white" />
              </Button>
            </div>

            {/* Camera controls */}
            <h4 className="text-sm font-medium text-slate-200 border-b border-slate-700/50 pb-1">
              Camera
            </h4>
            <VectorInput
              label="Position"

              value={cameraPosition}
              onChange={(val) =>
                dispatchSceneControls({
                  type: 'UPDATE_RAW',
                  payload: { cameraPosition: val },
                })
              }
            />
            <VectorInput
              label="Target (Look At)"

              value={cameraTarget}
              onChange={(val) =>
                dispatchSceneControls({
                  type: 'UPDATE_RAW',
                  payload: { cameraTarget: val },
                })
              }
            />
            <NumberInput
              label="Field of View"

              value={cameraFov}
              onChange={(val) =>
                dispatchSceneControls({
                  type: 'UPDATE_RAW',
                  payload: { cameraFov: val },
                })
              }
              step={1}
              min={10}
              max={120}
            />

            {/* Model controls */}
            <h4 className="text-sm font-medium text-slate-200 border-b border-slate-700/50 pb-1">
              Model
            </h4>
            <VectorInput
              label="Position"

              value={modelPosition}
              onChange={(val) =>
                dispatchSceneControls({
                  type: 'UPDATE_RAW',
                  payload: { modelPosition: val },
                })
              }
            />
            <VectorInput
              label="Rotation (XYZ)"

              value={modelRotation}
              onChange={(val) =>
                dispatchSceneControls({
                  type: 'UPDATE_RAW',
                  payload: { modelRotation: val },
                })
              }
            />
            <NumberInput
              label="Scale"

              value={modelScale}
              onChange={(val) =>
                dispatchSceneControls({
                  type: 'UPDATE_RAW',
                  payload: { modelScale: val },
                })
              }
              min={0.1}
            />

            {/* Lighting and environment controls */}
            <h4 className="text-sm font-medium text-slate-200 border-b border-slate-700/50 pb-1">
              Lighting & Environment
            </h4>
            <NumberInput
              label="Ambient Light"

              value={ambientIntensity}
              onChange={(val) =>
                dispatchSceneControls({
                  type: 'UPDATE_RAW',
                  payload: { ambientIntensity: val },
                })
              }
              min={0}
              max={2}
            />
            <NumberInput
              label="Directional Light"

              value={directionalIntensity}
              onChange={(val) =>
                dispatchSceneControls({
                  type: 'UPDATE_RAW',
                  payload: { directionalIntensity: val },
                })
              }
              min={0}
              max={2}
            />
            <VectorInput
              label="Light Position"

              value={directionalPosition}
              onChange={(val) =>
                dispatchSceneControls({
                  type: 'UPDATE_RAW',
                  payload: { directionalPosition: val },
                })
              }
            />
            <NumberInput
              label="Environment"

              value={environmentIntensity}
              onChange={(val) =>
                dispatchSceneControls({
                  type: 'UPDATE_RAW',
                  payload: { environmentIntensity: val },
                })
              }
              min={0}
              max={2}
            />
            {/* Toggle for screen reflection */}
            <div className="flex items-center justify-between pt-2">
              <Label
                htmlFor="screen-reflection"
                className="text-xs text-slate-300"
              >
                Screen Reflection
              </Label>
              <Toggle
                id="screen-reflection"
                checked={screenReflection} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  dispatchSceneControls({
                    type: 'UPDATE_RAW',
                    payload: { screenReflection: e.target.checked },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}