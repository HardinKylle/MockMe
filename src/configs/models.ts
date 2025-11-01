// Defines available 3D device models and their screen material/configuration.
export interface ModelData {
  name: string;
  path: string;
  screenMaterial: string; 
  scale: number;
  flipY: boolean; 
  textureRepeat: [number, number]; 
  textureOffset: [number, number]; 
  rotation: [number, number, number];
}

export const models: ModelData[] = [
  {
    name: 'iPhone Air',
    path: '/models/iphone_air_.glb',
    screenMaterial: 'Material.004',
    scale: 1,
    flipY: true, 
    textureRepeat: [1, 1],
    textureOffset: [0, 0],
    rotation: [0, 0, 0]
  },
    {
    name: 'Iphone 17 Pro Max',
    path: '/models/iphone_17_pro_max_.glb',
    screenMaterial: 'BsXHDwLKqtDOfrW',
    scale: 10,
    flipY: false,
    textureRepeat: [1, 1],
    textureOffset: [0, 0],
    rotation: [0, 0, 0]
  },
  {
    name: 'Samsung Galaxy S21 Ultra',
    path: '/models/samsung_galaxy_s21_ultra_.glb',
    screenMaterial: 'Display_ActiveArea', 
    scale: 10, 
    flipY: false, 
    textureRepeat: [2.2, 1], 
    textureOffset: [0, 0],
    rotation: [0, 0, 0]
  },
  {
    name: 'Ipad Mini',
    path: '/models/ipad_mini_.glb',
    screenMaterial: 'Screen',
    scale: 1.7,
    flipY: true,
    textureRepeat: [-1, 1],
    textureOffset: [0, 0],
    rotation: [0, Math.PI, 0]
  }
];