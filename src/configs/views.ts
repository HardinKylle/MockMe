// Defines preset camera views for quick selection in the scene.


export const presetViews = [
  // Basic Views
  { name: 'Front', position: [0, 0, 2], target: [0, 0, 0] },
  { name: 'Top', position: [0, 2, 0], target: [0, 0, 0] },
  { name: 'Side', position: [-2, 0, 0], target: [0, 0, 0] },
  
  { name: 'Perspective Left', position: [-1.5, 1, 1.5], target: [0, 0, 0] },
  { name: 'Perspective Right', position: [1.5, 1, 1.5], target: [0, 0, 0] },
  { name: 'Hero Angle', position: [0, -1, 1.8], target: [0, 0, 0] },
] as const;