export interface AnimationScene {
  id: string;
  name: string;
  duration: number; 
  animationType: 'spin' | 'static' | 'custom';
  startView?: CameraView; 
  endView?: CameraView; 
}

export type CameraView = {
  position: [number, number, number];
  target: [number, number, number];
};