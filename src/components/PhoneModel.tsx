
import React, { useLayoutEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const PhoneModel: React.FC = () => {
    const { scene } = useGLTF('/models/iphone_14_pro.glb');

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

        scene.rotation.y = Math.PI; // Rotate 180 degrees to face the camera

        // Fix material transparency and depth issues
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const material = child.material;

                if (material) {
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

useGLTF.preload('/models/iphone_14_pro.glb');