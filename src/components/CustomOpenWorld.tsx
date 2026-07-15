import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader, MTLLoader } from 'three-stdlib';
import { RigidBody } from '@react-three/rapier';
import { Text, Center } from '@react-three/drei';
import * as THREE from 'three';

function CustomModel() {
  const [mtlExists, setMtlExists] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/open_world/open_world.mtl', { method: 'HEAD' })
      .then(res => setMtlExists(res.ok))
      .catch(() => setMtlExists(false));
  }, []);

  if (mtlExists === null) return null;

  return <CustomModelWithMtl useMtl={mtlExists} />;
}

function CustomModelWithMtl({ useMtl }: { useMtl: boolean }) {
  const materials = useMtl ? useLoader(MTLLoader, '/open_world/open_world.mtl') : null;
  const obj = useLoader(OBJLoader, '/open_world/open_world.obj', (loader) => {
    if (materials) {
      materials.preload();
      loader.setMaterials(materials);
    }
  });

  const clonedObj = useMemo(() => {
    const clone = obj.clone();
    
    // Ensure all children cast/receive shadows and have material values
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#888888',
            roughness: 0.6,
            metalness: 0.2
          });
        }
      }
    });
    return clone;
  }, [obj]);

  return (
    <RigidBody type="fixed" colliders="trimesh" name="custom-open-world">
      <primitive object={clonedObj} scale={1.0} position={[0, 0, 0]} />
    </RigidBody>
  );
}

export const CustomOpenWorld: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<'checking' | 'ready' | 'missing'>('checking');

  useEffect(() => {
    fetch('/open_world/open_world.obj', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setModelStatus('ready');
        } else {
          setModelStatus('missing');
        }
      })
      .catch(() => {
        setModelStatus('missing');
      });
  }, []);

  if (modelStatus === 'checking') {
    return (
      <Center position={[0, 5, 0]}>
        <Text color="#06b6d4" fontSize={0.8} font="monospace">
          SCANNING FOR /open_world/open_world.obj...
        </Text>
      </Center>
    );
  }

  if (modelStatus === 'missing') {
    return (
      <group position={[0, 0, 0]}>
        {/* Help flat ground so players can move around */}
        <RigidBody type="fixed" colliders="cuboid" name="open-world-fallback-floor">
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[100, 1, 100]} />
            <meshStandardMaterial color="#09090b" roughness={0.85} metalness={0.15} />
          </mesh>
          <gridHelper args={[100, 50, '#22d3ee', '#18181b']} position={[0, 0.01, 0]} />
        </RigidBody>

        {/* Floating instruction screens */}
        <group position={[0, 6, -15]}>
          <Text
            color="#f43f5e"
            fontSize={1.5}
            font="monospace"
            anchorX="center"
            anchorY="middle"
            maxWidth={40}
            textAlign="center"
          >
            OPEN WORLD SOURCE OFFLINE
          </Text>
          
          <Text
            position={[0, -1.8, 0]}
            color="#f4f4f5"
            fontSize={0.6}
            font="monospace"
            anchorX="center"
            anchorY="middle"
            maxWidth={32}
            textAlign="center"
          >
            Drag or place your own "open_world.obj" and optional "open_world.mtl" inside the "/public/open_world/" folder.
          </Text>

          <Text
            position={[0, -3.5, 0]}
            color="#22d3ee"
            fontSize={0.45}
            font="monospace"
            anchorX="center"
            anchorY="middle"
            maxWidth={35}
            textAlign="center"
          >
            The engine automatically compiles real-time physics colliders over your custom 3D environment!
          </Text>
        </group>
      </group>
    );
  }

  return (
    <Suspense fallback={
      <group position={[0, 0, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[100, 1, 100]} />
            <meshStandardMaterial color="#09090b" wireframe />
          </mesh>
        </RigidBody>
        <Center position={[0, 5, 0]}>
          <Text color="#22d3ee" fontSize={0.8} font="monospace">
            LOADING CUSTOM GEOMETRY...
          </Text>
        </Center>
      </group>
    }>
      <CustomModel />
    </Suspense>
  );
};
