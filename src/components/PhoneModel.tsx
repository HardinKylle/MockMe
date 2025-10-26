import React, { useLayoutEffect, useRef, useEffect } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

interface PhoneModelProps {
    modelUrl: string;
    screenMaterialName: string;
    textureUrl: string | null;
    scale: number;
    flipY: boolean;
    textureRepeat: [number, number];
    textureOffset: [number, number];
    rotation: [number, number, number];
}

const PhoneModel: React.FC<PhoneModelProps> = ({
    modelUrl,
    screenMaterialName,
    textureUrl,
    scale,
    flipY,
    textureRepeat,
    textureOffset,
    rotation
}) => {
    const { scene } = useGLTF(modelUrl);
    const { gl } = useThree();
    const screenMaterialRef = useRef<THREE.Material | null>(null);
    const originalMapRef = useRef<THREE.Texture | null>(null);

    const texture = useTexture(textureUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');

    useEffect(() => {
        if (!screenMaterialRef.current) return;

        // Cast to MeshStandardMaterial
        const mat = screenMaterialRef.current as THREE.MeshStandardMaterial;

        if (textureUrl) {
            texture.flipY = flipY; 
            texture.repeat.set(textureRepeat[0], textureRepeat[1]);
            texture.offset.set(textureOffset[0], textureOffset[1]);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;

            const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
            texture.anisotropy = maxAnisotropy;

            texture.generateMipmaps = true;
            texture.needsUpdate = true;

            // Apply texture to both map and emissiveMap
            mat.map = texture;
            mat.emissiveMap = texture; 
            mat.needsUpdate = true;
        } else {
            if (originalMapRef.current) {
                mat.map = originalMapRef.current;
                mat.emissiveMap = originalMapRef.current; 
                if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
                if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                mat.needsUpdate = true;
            }
        }
    }, [texture, textureUrl, gl]); 

    useLayoutEffect(() => {
        const originalMaterials = new Map<THREE.Mesh, THREE.Material>();
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        scene.position.sub(center);
        scene.scale.set(scale, scale, scale);

        if (rotation) {
            scene.rotation.set(rotation[0], rotation[1], rotation[2]);
        }

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const material = child.material;
                console.log(`Mesh: "${child.name}", Material: "${child.material.name}"`);

                if (material) {
                  if (material.name === screenMaterialName) {
                            originalMaterials.set(child, material);

                            const mat = material as THREE.MeshStandardMaterial; 
                            originalMapRef.current = mat.map || mat.emissiveMap || null;

                            // Use MeshPhysicalMaterial for clearcoat reflections
                            const physicalMat = new THREE.MeshPhysicalMaterial({
                                // --- Base Layer (The Glowing Screen) ---
                                color: 0x000000,          // Base color is black
                                emissive: 0xffffff,       // Glow color is white
                                emissiveMap: originalMapRef.current, // Texture provides the glow
                                emissiveIntensity: 1,     // Full brightness for the glow
                                roughness: 1.0,           // Make the base layer (the texture) non-reflective
                                metalness: 0,             // Not metallic
                                toneMapped: false,        // CRITICAL: This gives you the bright "unlit" look

                                // --- Top Layer (The Glass Reflection) ---
                                clearcoat: 0.5,           // Add a full-strength clear "glass" coat
                                clearcoatRoughness: 0.3,  // Make the reflection slightly blurry (0=mirror, 1=matte)
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

    }, [scene, screenMaterialName, modelUrl, scale, rotation]); 

    return <primitive object={scene} />;
}

export default PhoneModel;