'use client';
import { useState, useRef, useEffect } from 'react';
import { Sliders, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface CameraControlsProps {
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
  onReset: () => void;
}

export default function CameraControlsPanel({
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
          className="absolute top-full mt-2 right-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-20 border border-gray-100 max-h-[80vh] overflow-y-auto"
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
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Scene Controls</h3>
              <Button
                type="button"
                onClick={onReset}
                variant="ghost"
                size="sm"
              >
                <RotateCcw size={18} />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Camera Section */}
            <section>
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Camera</h4>
              
              {/* Camera Position */}
              <div className="space-y-2 mb-3">
                <Label className="text-gray-700">Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[9px] text-gray-500">X</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraPosition[0]}
                      onChange={(e) =>
                        handleVector3Change(e.target.value, 0, cameraPosition, onCameraPositionChange)
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">Y</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraPosition[1]}
                      onChange={(e) =>
                        handleVector3Change(e.target.value, 1, cameraPosition, onCameraPositionChange)
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">Z</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraPosition[2]}
                      onChange={(e) =>
                        handleVector3Change(e.target.value, 2, cameraPosition, onCameraPositionChange)
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Camera Target */}
              <div className="space-y-2 mb-3">
                <Label className="text-gray-700">Target</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[9px] text-gray-500">X</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraTarget[0]}
                      onChange={(e) =>
                        handleVector3Change(e.target.value, 0, cameraTarget, onCameraTargetChange)
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">Y</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraTarget[1]}
                      onChange={(e) =>
                        handleVector3Change(e.target.value, 1, cameraTarget, onCameraTargetChange)
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">Z</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cameraTarget[2]}
                      onChange={(e) =>
                        handleVector3Change(e.target.value, 2, cameraTarget, onCameraTargetChange)
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* FOV */}
              <div className="space-y-2">
                <Label className="text-gray-700">Field of View</Label>
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
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
            </section>

            {/* Model Transform Section */}
            <section>
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Model Transform</h4>
              
              {/* Model Position */}
              <div className="space-y-2 mb-3">
                <Label className="text-gray-700">Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[9px] text-gray-500">X</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={modelPosition[0]}
                      onChange={(e) =>
                        handleVector3Change(e.target.value, 0, modelPosition, onModelPositionChange)
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">Y</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={modelPosition[1]}
                      onChange={(e) =>
                        handleVector3Change(e.target.value, 1, modelPosition, onModelPositionChange)
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">Z</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={modelPosition[2]}
                      onChange={(e) =>
                        handleVector3Change(e.target.value, 2, modelPosition, onModelPositionChange)
                      }
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Model Rotation */}
              <div className="space-y-2 mb-3">
                <Label className="text-gray-700">Rotation (degrees)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[9px] text-gray-500">X</Label>
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
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">Y</Label>
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
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">Z</Label>
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
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Model Scale */}
              <div className="space-y-2">
                <Label className="text-gray-700">Scale</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={modelScale}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0) onModelScaleChange(val);
                  }}
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
            </section>

            {/* Lighting Section */}
            <section>
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Lighting</h4>
              
              {/* Ambient Light */}
              <div className="space-y-2 mb-3">
                <Label className="text-gray-700">Ambient Intensity</Label>
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
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>

              {/* Directional Light Intensity */}
              <div className="space-y-2 mb-3">
                <Label className="text-gray-700">Directional Intensity</Label>
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
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>

              {/* Directional Light Position */}
              <div className="space-y-2 mb-3">
                <Label className="text-gray-700">Directional Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[9px] text-gray-500">X</Label>
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
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">Y</Label>
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
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">Z</Label>
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
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Environment Intensity */}
              <div className="space-y-2">
                <Label className="text-gray-700">Environment Intensity</Label>
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
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}