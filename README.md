# MockMe

MockMe is a 3D device mockup web application built with Next.js, React Three Fiber, and TypeScript. It allows you to upload an app UI as an image or video, view it inside a realistic 3D model, animate a full scene sequence, and capture visual assets for design showcases and portfolios.

## Features

- **File Handling:** Upload image or video content to be placed onto the 3D device screen.
- **Full Animation Timeline:** Create complex animated sequences by defining, reordering, and editing multiple scenes. Supports custom camera transitions and preset animations.
- **Granular Controls:** Fine tune camera position, field of view (FOV), model transformations, and detailed lighting including ambient, directional, and environment light.
- **High Quality Capture:** Export high quality PNG screenshots of your mockups.
- **Realistic 3D Models:** Uses React Three Fiber for accurate 3D rendering and scene management.

## Tech Stack

- Next.js  
- React Three Fiber (R3F)  
- @react-three/drei  
- Three.js  
- TypeScript  

## Getting Started

### Clone the repository

1. bash
git clone https://github.com/HardinKylle/MockMe.git
cd mockme

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# then visit:
# http://localhost:3000
```

---

## Intended Users

- Designers — create beautiful device mockups of app UIs.  
- Developers — showcase mobile apps or UI prototypes.  
- Marketers — produce high-quality visuals for social media.

---

## License

This project is open source and available under the MIT License. The MIT License covers the source code only. The 3D device models in `public/models/` are third-party assets under their own licenses, listed below.

## 3D Model Credits

- [IPad Mini 6 2021](https://sketchfab.com/3d-models/ipad-mini-6-2021-f363c2b1c74a462588db184bd4fb024e) by [DatSketch](https://sketchfab.com/DatSketch), licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)
- [iPhone Air](https://sketchfab.com/3d-models/iphone-air-a33758d3be094f3ebe35fa5a59957858) by [Tim](https://sketchfab.com/melsto), licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)
- [Iphone 14 Pro](https://sketchfab.com/3d-models/iphone-14-pro-5cb0778041a34f09b409a38c687bb1d4) by [mister dude](https://sketchfab.com/misterdude), licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)
- [Samsung Galaxy S21 Ultra (Phantom Titanium)](https://sketchfab.com/3d-models/samsung-galaxy-s21-ultra-phantom-titanium-ea929714733f4204be86089a44873981) by [crumhirnd](https://sketchfab.com/crumhirnd), licensed under [CC BY-NC-ND 4.0](http://creativecommons.org/licenses/by-nc-nd/4.0/)
- [Apple iPhone 17 Pro Max](https://sketchfab.com/3d-models/apple-iphone-17-pro-max-43570bd2d48f48b6aafb8adbb04e346d) by [Apple User](https://sketchfab.com/apple-user), licensed under the [Sketchfab Standard License](https://sketchfab.com/licenses)
 