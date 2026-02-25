// Renders a phone 3D model with a dynamic screen texture (image or video)

import React, { useLayoutEffect, useRef, useEffect, useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useAnimation } from '@/contexts/AnimationContext';

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
    // Load GLTF model and WebGL context
    const { scene } = useGLTF(modelUrl);
    const { gl } = useThree();
    const screenMaterialRef = useRef<THREE.Material | null>(null);
    const originalMapRef = useRef<THREE.Texture | null>(null);

    // Load image texture or fallback to transparent PNG
    const imageTexture = useTexture(
        uploadedFileType === 'image' && textureUrl
            ? textureUrl
            : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    );

    // Create a VideoTexture if uploaded file is a video
    const videoTexture = useMemo(() => {
        if (uploadedFileType !== 'video' || !textureUrl) {
            return null;
        }
        const video = document.createElement('video');
        video.src = textureUrl;
        video.crossOrigin = 'Anonymous';
        video.loop = true;
        video.muted = true;
        // Timeline controls playback
        return new THREE.VideoTexture(video);
    }, [textureUrl, uploadedFileType]);

    // Control video playback based on isPlaying state
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

    // Sync video currentTime with timeline
    useEffect(() => {
        if (!videoTexture) return;
        const video = videoTexture.image as HTMLVideoElement;
        if (!video) return;
        if (Math.abs(video.currentTime - currentTime) > 0.1) {
            video.currentTime = currentTime;
        }
    }, [currentTime, videoTexture]);

    // Register/unregister the video element so the export loop can seek it
    const { isExportingRef, exportVideoRef } = useAnimation();
    useEffect(() => {
        if (!videoTexture) {
            exportVideoRef.current = null;
            return;
        }
        const video = videoTexture.image as HTMLVideoElement;
        exportVideoRef.current = video || null;
        return () => {
            exportVideoRef.current = null;
        };
    }, [videoTexture, exportVideoRef]);

    // During export, force the video texture to re-upload each frame.
    // VideoTexture relies on requestVideoFrameCallback which doesn't fire
    // for paused+seeking videos, so we bypass it here.
    useFrame(() => {
        if (!isExportingRef.current || !videoTexture) return;
        videoTexture.needsUpdate = true;
    });

    // Choose texture based on file type
    const texture = uploadedFileType === 'video' ? videoTexture : imageTexture;

    // Cleanup video texture on unmount
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

    // Update screen material with texture and properties
    useEffect(() => {
        if (!screenMaterialRef.current) return;
        const mat = screenMaterialRef.current as THREE.MeshStandardMaterial;
        if (textureUrl && texture) {
            texture.flipY = flipY;
            texture.repeat.set(textureRepeat[0], textureRepeat[1]);
            texture.offset.set(textureOffset[0], textureOffset[1]);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.colorSpace = THREE.SRGBColorSpace;
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

    // Center and scale model, apply rotation
    useLayoutEffect(() => {
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        scene.position.sub(center);
        scene.scale.set(scale, scale, scale);
        if (rotation) {
            scene.rotation.set(rotation[0], rotation[1], rotation[2]);
        }
    }, [scene, modelUrl, scale, rotation]);

    // Setup screen material and store original map
    useLayoutEffect(() => {
        const originalMaterials = new Map<THREE.Mesh, THREE.Material>();
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const material = child.material;
                if (material) {
                    if (material.name === screenMaterialName) {
                        originalMaterials.set(child, material);
                        const mat = material as THREE.MeshStandardMaterial;
                        // console.log(`Mesh: "${child.name}", Material: "${child.material.name}"`);
                        originalMapRef.current = mat.map || mat.emissiveMap || null;
                        const physicalMat = new THREE.MeshPhysicalMaterial({
                            color: 0x000000,
                            emissive: 0xffffff,
                            emissiveMap: originalMapRef.current,
                            emissiveIntensity: 1,
                            roughness: 1.0,
                            metalness: 0,
                            toneMapped: false,
                            clearcoat: screenReflection ? 0.5 : 0.0,
                            clearcoatRoughness: 0.3,
                        });
                        if (physicalMat.emissiveMap) physicalMat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                        child.material = physicalMat;
                        screenMaterialRef.current = physicalMat;
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
    }, [scene, screenMaterialName, modelUrl]);

    // Update screen reflection property dynamically
    useEffect(() => {
        if (screenMaterialRef.current) {
            const mat = screenMaterialRef.current as THREE.MeshPhysicalMaterial;
            mat.clearcoat = screenReflection ? 0.5 : 0.0;
        }
    }, [screenReflection]);

    return <primitive object={scene} />;
}

export default PhoneModel;