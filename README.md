# 📱 MockMe

**MockMe** is a 3D device mockup web app built with **Next.js**, **React Three Fiber**, and **TypeScript**. It lets you upload an app UI (**image or video**), view it inside a realistic 3D model, animate a full scene sequence, and capture stunning visual assets for design showcases, social media, or portfolios.

---

## 🚀 Features

- 📤 **File Handling:** Upload **Image or Video** content and place it onto the 3D device screen.
- 🎬 **Full Animation Timeline:** Create complex animated sequences by defining, reordering, and editing multiple scenes.
    * Supports custom camera transitions (`startView`/`endView`) and preset animations.
- 🎨 **Modern Dark UI/UX:** All controls, panels, and the timeline feature a consistent, clean, and highly functional dark-themed 'glassy' aesthetic.
- ⚙️ **Granular Controls:** Fine-tune camera position, field of view (FOV), model transformations, and detailed lighting controls (ambient, directional, environment intensity).
- 📸 **High-Quality Capture:** Export high-quality screenshots (PNG) of your final mockups.
- 📱 **Realistic 3D Models:** Utilize Three.js + React Three Fiber for accurate 3D rendering and scene management.

---

## 🧰 Tech Stack

| Technology | Purpose |
|-----------:|:--------|
| **Next.js 14+** | App framework for React |
| **React Three Fiber (R3F)** | 3D rendering and scene management |
| **@react-three/drei** | Useful 3D helpers and presets |
| **TypeScript** | Type safety and better DX |
| **Three.js** | Core 3D engine |
---

## 🛠️ Getting Started

1. Clone the repository
```bash
git clone https://github.com/HardinKylle/MockMe.git
cd mockme
```

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

## 🎯 Intended Users

- 🎨 Designers — create beautiful device mockups of app UIs.  
- 📱 Developers — showcase mobile apps or UI prototypes.  
- 📣 Marketers — produce high-quality visuals for social media.

---

## 🧾 License

This project is open source and available under the MIT License. 