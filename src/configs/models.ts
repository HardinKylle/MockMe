export interface ModelData {
  name: string;
  path: string;
  screenMaterial: string; 
  scale: number;
  flipY: boolean; 
  textureRepeat: [number, number]; 
  textureOffset: [number, number]; 
}

export const models: ModelData[] = [
  {
    name: 'iPhone Air',
    path: '/models/iphone_air_.glb',
    screenMaterial: 'Material.004',
    scale: 1,
    flipY: true, 
    textureRepeat: [1, 1],
    textureOffset: [0, 0]
  },
  {
    name: 'Samsung Galaxy S21 Ultra',
    path: '/models/samsung_galaxy_s21_ultra_.glb',
    screenMaterial: 'Display_ActiveArea', 
    scale: 10, 
    flipY: false, 
    textureRepeat: [2.2, 1], 
    textureOffset: [0, 0]
  }
];