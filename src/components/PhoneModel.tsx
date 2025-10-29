import React, { useLayoutEffect, useRef, useEffect, useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

interface PhoneModelProps {
    modelUrl: string;
    screenMaterialName: string;
    textureUrl: string | null;
    uploadedFileType: 'image' | 'video' | null;
    scale: number;
    flipY: boolean;
    textureRepeat: [number, number];
    textureOffset: [number, number];
    rotation: [number, number, number];
    screenReflection: boolean;
    isPlaying: boolean;
    currentTime: number;
}

const PhoneModel: React.FC<PhoneModelProps> = ({
    modelUrl,
    screenMaterialName,
    textureUrl,
    uploadedFileType,
    scale,
    flipY,
    textureRepeat,
    textureOffset,
    rotation,
    screenReflection,
    isPlaying,
    currentTime
}) => {
    const { scene } = useGLTF(modelUrl);
    const { gl } = useThree();
    const screenMaterialRef = useRef<THREE.Material | null>(null);
    const originalMapRef = useRef<THREE.Texture | null>(null);

    const imageTexture = useTexture(
        uploadedFileType === 'image' && textureUrl
            ? textureUrl
            : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    );

    // 2. Manually create a VideoTexture when the type is 'video'
    const videoTexture = useMemo(() => {
        if (uploadedFileType !== 'video' || !textureUrl) {
            return null;
        }

        // Create a video element
        const video = document.createElement('video');
        video.src = textureUrl;
        video.crossOrigin = 'Anonymous';
        video.loop = true;
        video.muted = true;
        // DON'T auto-play - let the timeline control it

        // Create the texture from the video element
        return new THREE.VideoTexture(video);

    }, [textureUrl, uploadedFileType]);

    // NEW: Control video playback based on isPlaying state
    useEffect(() => {
        if (!videoTexture) return;

        const video = videoTexture.image as HTMLVideoElement;
        if (!video) return;

        if (isPlaying) {
            video.play().catch(err => {
                console.warn('Video play failed:', err);
            });
        } else {
            video.pause();
        }
    }, [isPlaying, videoTexture]);

    // NEW: Sync video currentTime with timeline currentTime
    useEffect(() => {
        if (!videoTexture) return;

        const video = videoTexture.image as HTMLVideoElement;
        if (!video) return;

        // Only update if the difference is significant (avoid micro-adjustments)
        if (Math.abs(video.currentTime - currentTime) > 0.1) {
            video.currentTime = currentTime;
        }
    }, [currentTime, videoTexture]);

    // 3. Decide which texture to use
    const texture = uploadedFileType === 'video' ? videoTexture : imageTexture;

    // 4. Add a cleanup effect for the video texture
    useEffect(() => {
        return () => {
            if (videoTexture) {
                videoTexture.dispose();
                const video = videoTexture.image as HTMLVideoElement;
                if (video) {
                    video.pause();
                    video.src = '';
                    video.load();
                }
            }
        };
    }, [videoTexture]);

    useEffect(() => {
        if (!screenMaterialRef.current) return;

        const mat = screenMaterialRef.current as THREE.MeshStandardMaterial;

        // Check if we have a valid texture (image OR video)
        if (textureUrl && texture) {
            texture.flipY = flipY;
            texture.repeat.set(textureRepeat[0], textureRepeat[1]);
            texture.offset.set(textureOffset[0], textureOffset[1]);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.colorSpace = THREE.SRGBColorSpace;

            // Video textures don't use mipmaps or anisotropy
            if (uploadedFileType === 'image') {
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
                texture.anisotropy = maxAnisotropy;
                texture.generateMipmaps = true;
            }

            texture.needsUpdate = true;

            mat.map = texture;
            mat.emissiveMap = texture;
            mat.needsUpdate = true;
        } else {
            // Revert to original if no file is uploaded
            if (originalMapRef.current) {
                mat.map = originalMapRef.current;
                mat.emissiveMap = originalMapRef.current;
                if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
                if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                mat.needsUpdate = true;
            }
        }
    }, [texture, textureUrl, gl, uploadedFileType, flipY, textureRepeat, textureOffset]);

    useLayoutEffect(() => {
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        // const size = box.getSize(new THREE.Vector3()); // Not used

        scene.position.sub(center);
        scene.scale.set(scale, scale, scale);

        if (rotation) {
            scene.rotation.set(rotation[0], rotation[1], rotation[2]);
        }
    }, [scene, modelUrl, scale, rotation]); // <-- No screenReflection

    // Effect 2: Handle material setup (run once per model)
    // This creates the material and stores a ref to it.
    useLayoutEffect(() => {
        const originalMaterials = new Map<THREE.Mesh, THREE.Material>();

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const material = child.material;
                // console.log(`Mesh: "${child.name}", Material: "${child.material.name}"`);

                if (material) {
                    if (material.name === screenMaterialName) {
                        originalMaterials.set(child, material);

                        const mat = material as THREE.MeshStandardMaterial;
                        originalMapRef.current = mat.map || mat.emissiveMap || null;

                        const physicalMat = new THREE.MeshPhysicalMaterial({
                            color: 0x000000,
                            emissive: 0xffffff,
                            emissiveMap: originalMapRef.current,
                            emissiveIntensity: 1,
                            roughness: 1.0,
                            metalness: 0,
                            toneMapped: false,
                            // Set initial value from prop
                            clearcoat: screenReflection ? 0.5 : 0.0,
                            clearcoatRoughness: 0.3,
                        });

                        if (physicalMat.emissiveMap) physicalMat.emissiveMap.colorSpace = THREE.SRGBColorSpace;

                        child.material = physicalMat;
                        screenMaterialRef.current = physicalMat; // <-- We store the ref
                    }

                    material.depthWrite = true;
                    material.depthTest = true;
                    if (material.transparent) {
                        material.alphaTest = 0.5;
                    }
                    if (material.side === undefined) {
                        material.side = THREE.FrontSide;
                    }
                }
            }
        });

        return () => {
            originalMaterials.forEach((originalMat, mesh) => {
                mesh.material = originalMat;
            });
            screenMaterialRef.current = null;
            originalMapRef.current = null;
        };
        // This effect now only runs when the model itself changes
    }, [scene, screenMaterialName, modelUrl, screenReflection]); // <-- We keep screenReflection here to set the *initial* state correctly

    // Effect 3: Update reflection property dynamically
    // This is small, fast, and only runs when the toggle changes.
    useEffect(() => {
        if (screenMaterialRef.current) {
            // We know this is a MeshPhysicalMaterial because we created it.
            const mat = screenMaterialRef.current as THREE.MeshPhysicalMaterial;
            mat.clearcoat = screenReflection ? 0.5 : 0.0;
            // mat.needsUpdate = true; // Not required for clearcoat
        }
    }, [screenReflection]); // <-- Runs ONLY when reflection changes.

    return <primitive object={scene} />;
}

export default PhoneModel;