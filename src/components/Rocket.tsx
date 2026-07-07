import React, { useMemo, Suspense } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../store';
import { soundService } from '../services/soundService';
import { Text, Float } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { OBJLoader, MTLLoader } from 'three-stdlib';

function RocketModel() {
  const materials = useLoader(MTLLoader, '/rocket/Space Station Scene.mtl');
  const obj = useLoader(OBJLoader, '/rocket/rocket.obj', (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  const clonedObj = useMemo(() => {
    const clone = obj.clone();
    return clone;
  }, [obj]);

  return (
    <primitive 
      object={clonedObj} 
      scale={2.5} 
      position={[0, 0, 0]}
      rotation={[0, 0, 0]} 
    />
  );
}

export const Rocket: React.FC = () => {
  const setDimension = useGameStore(state => state.setDimension);
  
  return (
    <group position={[0, 0, 0]}>
      <RigidBody 
        type="fixed" 
        colliders="cuboid" 
        sensor 
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            setDimension('dimension_71');
            useGameStore.getState().addEvent('🚀 71 NO MANSKY PROTOCOL! BLASTING OFF!');
            soundService.playSFX('dimension_shift');
          }
        }}
      >
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <Suspense fallback={
            <mesh position={[0, 5, 0]}>
              <cylinderGeometry args={[2, 2.5, 12, 16]} />
              <meshStandardMaterial color="#eeeeee" metalness={0.8} roughness={0.2} />
            </mesh>
          }>
            <RocketModel />
          </Suspense>
        </Float>
        
        <Text
          position={[0, 15, 0]}
          fontSize={1.5}
          color="#ffaa00"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
          anchorX="center"
          anchorY="middle"
        >
          71 NO MANSKY ROCKET
        </Text>
      </RigidBody>
    </group>
  );
};
