
import React, { useLayoutEffect, useRef, useEffect, use } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface PhoneModelProps {
    textureUrl: string | null;
}

const PhoneModel: React.FC<PhoneModelProps> = ({ textureUrl }) => {
    const { scene } = useGLTF('/models/iphone_air_.glb');

    //create a ref to store the screen material
    const screenMaterialRef = useRef<THREE.Material | null>(null);

    // Refs to store the *original* material properties
    const originalMapRef = useRef<THREE.Texture | null>(null);
    const originalEmissiveMapRef = useRef<THREE.Texture | null>(null);
    const originalEmissiveColorRef = useRef<THREE.Color | null>(null);

    //load the texture from the URL
    const texture = useTexture(textureUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');

    //create an effect to apply the texture
    useEffect(() => {
        if (!screenMaterialRef.current) return;

        const mat = screenMaterialRef.current as THREE.MeshBasicMaterial;

        if (textureUrl) {
            texture.flipY = false;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 16;

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
    }, [texture, textureUrl]);
    useLayoutEffect(() => {

        //Create a bounding box
        const box = new THREE.Box3().setFromObject(scene);

        //Get the center and size
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        //Calculate the scale
        const maxDim = Math.max(size.x, size.y, size.z);
        //Desired size
        const scale = 2.0 / maxDim;

        //Apply the transformations
        scene.position.sub(center);

        scene.scale.set(scale, scale, scale);


        // Fix material transparency and depth issues
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {

                // Get the material from the mesh
                const material = child.material;

                if (material) {
                    if (material.name === 'Material.004') {
                        const mat = material as THREE.MeshStandardMaterial;

                        // Save original maps
                        originalMapRef.current = mat.map || mat.emissiveMap || null;

                        // Create MeshBasicMaterial starting with the original texture
                        const basicMat = new THREE.MeshBasicMaterial({
                            map: originalMapRef.current,
                            color: 0xffffff,
                            toneMapped: false,
                        });

                        // Ensure correct color space
                        if (basicMat.map) basicMat.map.colorSpace = THREE.SRGBColorSpace;

                        child.material = basicMat;
                        screenMaterialRef.current = basicMat;
                    }
                    // Enable depth write and test
                    material.depthWrite = true;
                    material.depthTest = true;

                    // If material is transparent, fix the rendering
                    if (material.transparent) {
                        material.alphaTest = 0.5;
                    }

                    // Ensure proper side rendering
                    if (material.side === undefined) {
                        material.side = THREE.FrontSide;
                    }
                }
            }
        });
    }, [scene]);

    return <primitive object={scene} />;
}

export default PhoneModel;

useGLTF.preload('/models/iphone_air_.glb');