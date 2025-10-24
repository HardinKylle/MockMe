export interface AnimationScene {
  id: string;
  name: string;
  duration: number; // in seconds
  animationType: 'spin' | 'static'; 
}