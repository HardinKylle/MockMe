'use client'

import { useState, RefObject } from 'react';
import { SceneApi } from '@/components/Scene/Scene';
import { useScene } from '@/contexts/SceneContext';
import { presetViews } from '@/configs/views';
import { Button } from '@/components/ui/Button';
import { Crosshair } from 'lucide-react';

interface ViewPresetPanelProps {
    sceneRef: RefObject<SceneApi | null>;
}

export const ViewPresetsPanel = ({ sceneRef }: ViewPresetPanelProps) => {
    const [showViews, setShowViews] = useState(false);
    const { dispatchSceneControls } = useScene();

    //Handles user click on a preset camera view. 
    const handlePresetClick = (view: typeof presetViews[number]) => {
        sceneRef.current?.setView(view.position, view.target);
        dispatchSceneControls({
            type: 'SET_PRESET',
            payload: {
                position: view.position as [number, number, number],
                target: view.target as [number, number, number]
            },
        });
        setShowViews(false);
    };

    return (
        <div className='relative'>
            <Button
                onClick={() => setShowViews(!showViews)}
                variant='primary'
                size='default'
                tooltip='Preset Views'
                tooltipSide='bottom'
                isActive={showViews}
            >
                <Crosshair className='h-6 w-6 text-white' />
            </Button>

            {showViews && (
                <div
                    className="absolute top-full right-0 mt-2 w-48 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl z-20 p-1.5" style={{ animation: 'slideUp 0.2s ease-out' }}
                >
                    <style>{`
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    `}</style>
                    <div className='space-y-1'>
                        {presetViews.map((view) => (
                            <Button
                                key={view.name}
                                onClick={() => handlePresetClick(view)}
                                variant='menu-item'
                                size='menu-item'
                                className='w-full'
                            >
                                {view.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};