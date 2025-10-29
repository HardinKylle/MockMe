'use client';
import { useState, useRef, useEffect } from 'react';
import { Sliders, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Toggle } from '@/components/ui/Toggle'; // <-- Still imported

interface CameraControlsProps {
  // ... all props remain the same
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  cameraFov: number;
  modelPosition: [number, number, number];
  modelRotation: [number, number, number];
  modelScale: number;
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
  environmentIntensity: number;
  screenReflection: boolean;
  onCameraPositionChange: (position: [number, number, number]) => void;
  onCameraTargetChange: (target: [number, number, number]) => void;
  onCameraFovChange: (fov: number) => void;
  onModelPositionChange: (position: [number, number, number]) => void;
  onModelRotationChange: (rotation: [number, number, number]) => void;
  onModelScaleChange: (scale: number) => void;
  onAmbientIntensityChange: (intensity: number) => void;
  onDirectionalIntensityChange: (intensity: number) => void;
  onDirectionalPositionChange: (position: [number, number, number]) => void;
  onEnvironmentIntensityChange: (intensity: number) => void;
  onScreenReflectionChange: (enabled: boolean) => void;
  onReset: () => void;
}

export default function CameraControlsPanel({
  // ... all props remain the same
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
  onCameraPositionChange,
  onCameraTargetChange,
  onCameraFovChange,
  onModelPositionChange,
  onModelRotationChange,
  onModelScaleChange,
  onAmbientIntensityChange,
  onDirectionalIntensityChange,
  onDirectionalPositionChange,
  onEnvironmentIntensityChange,
  onScreenReflectionChange,
  onReset,
}: CameraControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleVector3Change = (
    value: string,
    index: number,
    currentVec: [number, number, number],
    setter: (vec: [number, number, number]) => void
  ) => {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      const newVec: [number, number, number] = [...currentVec];
      newVec[index] = parsed;
      setter(newVec);
    }
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        size="default"
        tooltip="Transforms Control"
        tooltipSide="bottom"
        isActive={isOpen}
      >
        <Sliders size={24} />
      </Button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute top-full mt-2 right-0 w-80 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl z-20 max-h-[75vh] overflow-y-auto"
          style={{ animation: 'slideUp 0.2s ease-out' }}
        >
          <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          {/* Header */}
          <div className="px-4 pt-3 pb-3 border-b border-slate-700/50 sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-100">
                Transforms Controls
              </h3>
              <Button
                type="button"
                onClick={onReset}
                variant="ghost"
                size="sm"
                tooltip="Reset All"
                tooltipSide="left"
              >
                <RotateCcw size={16} />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Camera Section */}
            <section>
              <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Camera
              </h4>

              {/* Camera Position */}
              <div className="space-y-2 mb-3">
                <Label className="text-xs">Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px]">X</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraPosition[0]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          0,
                          cameraPosition,
                          onCameraPositionChange
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Y</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraPosition[1]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          1,
                          cameraPosition,
                          onCameraPositionChange
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Z</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraPosition[2]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          2,
                          cameraPosition,
                          onCameraPositionChange
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Camera Target */}
              <div className="space-y-2 mb-3">
                <Label className="text-xs">Target</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px]">X</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraTarget[0]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          0,
                          cameraTarget,
                          onCameraTargetChange
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Y</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraTarget[1]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          1,
                          cameraTarget,
                          onCameraTargetChange
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Z</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraTarget[2]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          2,
                          cameraTarget,
                          onCameraTargetChange
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* FOV */}
              <div className="space-y-2">
                <Label className="text-xs">Field of View</Label>
                <Input
                  type="number"
                  step="1"
                  min="10"
                  max="120"
                  value={cameraFov}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onCameraFovChange(val);
                  }}
                />
              </div>
            </section>

            {/* Model Transform Section */}
            <section>
              <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Model Transform
              </h4>

              {/* Model Position */}
              <div className="space-y-2 mb-3">
                <Label className="text-xs">Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px]">X</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={modelPosition[0]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          0,
                          modelPosition,
                          onModelPositionChange
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Y</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={modelPosition[1]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          1,
                          modelPosition,
                          onModelPositionChange
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Z</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={modelPosition[2]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          2,
                          modelPosition,
                          onModelPositionChange
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Model Rotation */}
              <div className="space-y-2 mb-3">
                <Label className="text-xs">Rotation (degrees)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px]">X</Label>
                    <Input
                      type="number"
                      step="1"
                      value={Math.round((modelRotation[0] * 180) / Math.PI)}
                      onChange={(e) => {
                        const degrees = parseFloat(e.target.value);
                        if (!isNaN(degrees)) {
                          const radians = (degrees * Math.PI) / 180;
                          handleVector3Change(
                            radians.toString(),
                            0,
                            modelRotation,
                            onModelRotationChange
                          );
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Y</Label>
                    <Input
                      type="number"
                      step="1"
                      value={Math.round((modelRotation[1] * 180) / Math.PI)}
                      onChange={(e) => {
                        const degrees = parseFloat(e.target.value);
                        if (!isNaN(degrees)) {
                          const radians = (degrees * Math.PI) / 180;
                          handleVector3Change(
                            radians.toString(),
                            1,
                            modelRotation,
                            onModelRotationChange
                          );
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Z</Label>
                    <Input
                      type="number"
                      step="1"
                      value={Math.round((modelRotation[2] * 180) / Math.PI)}
                      onChange={(e) => {
                        const degrees = parseFloat(e.target.value);
                        if (!isNaN(degrees)) {
                          const radians = (degrees * Math.PI) / 180;
                          handleVector3Change(
                            radians.toString(),
                            2,
                            modelRotation,
                            onModelRotationChange
                          );
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Model Scale */}
              <div className="space-y-2">
                <Label className="text-xs">Scale</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={modelScale}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0) onModelScaleChange(val);
                  }}
                />
              </div>
            </section>

            {/* Lighting Section */}
            <section>
              <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Lighting
              </h4>

              {/* Ambient Light */}
              <div className="space-y-2 mb-3">
                <Label className="text-xs">Ambient Intensity</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={ambientIntensity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onAmbientIntensityChange(val);
                  }}
                />
              </div>

              {/* Directional Light Intensity */}
              <div className="space-y-2 mb-3">
                <Label className="text-xs">Directional Intensity</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={directionalIntensity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onDirectionalIntensityChange(val);
                  }}
                />
              </div>

              {/* Directional Light Position */}
              <div className="space-y-2 mb-3">
                <Label className="text-xs">Directional Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px]">X</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={directionalPosition[0]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          0,
                          directionalPosition,
                          onDirectionalPositionChange
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Y</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={directionalPosition[1]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          1,
                          directionalPosition,
                          onDirectionalPositionChange
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Z</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={directionalPosition[2]}
                      onChange={(e) =>
                        handleVector3Change(
                          e.target.value,
                          2,
                          directionalPosition,
                          onDirectionalPositionChange
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Environment Intensity */}
              <div className="space-y-2">
                <Label className="text-xs">Environment Intensity</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={environmentIntensity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onEnvironmentIntensityChange(val);
                  }}
                />
              </div>

              {/* --- MODIFIED: Use Toggle component's built-in label --- */}
              <div className="pt-4">
                <Toggle
                  id="screen-reflection"
                  label="Screen Reflection" // Pass the label text here
                  checked={screenReflection}
                  onChange={(e) => onScreenReflectionChange(e.target.checked)}
                />
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}