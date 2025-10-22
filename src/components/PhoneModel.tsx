
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
}

const PhoneModel: React.FC<PhoneModelProps> = ({
    modelUrl,
    screenMaterialName,
    textureUrl,
    scale,
    flipY, 
    textureRepeat, 
    textureOffset  
}) => {
    const { scene } = useGLTF(modelUrl);
    const { gl } = useThree();
    //create a ref to store the screen material
    const screenMaterialRef = useRef<THREE.Material | null>(null);

    // Refs to store the *original* material properties
    const originalMapRef = useRef<THREE.Texture | null>(null);

    //load the texture from the URL
    const texture = useTexture(textureUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');

    //create an effect to apply the texture
    useEffect(() => {
        if (!screenMaterialRef.current) return;

        const mat = screenMaterialRef.current as THREE.MeshBasicMaterial;

        if (textureUrl) {
            texture.flipY = flipY; // Use the 'flipY' prop here

            texture.repeat.set(textureRepeat[0], textureRepeat[1]);
            // Use the 'textureOffset' prop to set position
            texture.offset.set(textureOffset[0], textureOffset[1]);
            // Tell Three.js to wrap the texture, not clamp it
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;

            const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
            texture.anisotropy = maxAnisotropy;

            // Force texture to generate mipmaps
            texture.generateMipmaps = true;
            texture.needsUpdate = true;

            mat.map = texture;
            mat.needsUpdate = true;
        } else {
            // Restore original GLB texture
            if (originalMapRef.current) {
                mat.map = originalMapRef.current;
                mat.map.colorSpace = THREE.SRGBColorSpace;
                mat.needsUpdate = true;
            }
        }
    }, [texture, textureUrl, gl]);
    useLayoutEffect(() => {

        //Create a bounding box
        const box = new THREE.Box3().setFromObject(scene);

        //Get the center and size
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        scene.position.sub(center);
        scene.scale.set(scale, scale, scale);


        // Fix material transparency and depth issues
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Get the material from the mesh
                const material = child.material;

                if (material) {
                    if (material.name === screenMaterialName) {
                        const mat = material as THREE.MeshStandardMaterial;

                        originalMapRef.current = mat.map || mat.emissiveMap || null;

                        const basicMat = new THREE.MeshBasicMaterial({
                            map: originalMapRef.current,
                            color: 0xffffff,
                            toneMapped: false,
                        });

                        if (basicMat.map) basicMat.map.colorSpace = THREE.SRGBColorSpace;

                        child.material = basicMat;
                        screenMaterialRef.current = basicMat;
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
    }, [scene, screenMaterialName, modelUrl, scale]);

    return <primitive object={scene} />;
}

export default PhoneModel;

// useGLTF.preload('/models/samsung_galaxy_s21_ultra_phantom_titanium.glb');