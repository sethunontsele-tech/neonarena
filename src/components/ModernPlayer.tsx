import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

// This is a placeholder URL for a high quality character model with Mixamo animations
// In a real project, the user would provide their own GLB file with animations
const MODEL_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb';

export function ModernPlayer() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, group);
  const playerAnimation = useGameStore(state => state.playerAnimation);
  const isSprinting = useGameStore(state => state.isSprinting);

  useEffect(() => {
    // Mapping our store animation states to the GLB animation names
    const animMap: Record<string, string> = {
      idle: 'Idle',
      run: isSprinting ? 'Running' : 'Walking',
      jump: 'Jump',
      dance: 'Dance',
      death: 'Death',
      sitting: 'Sitting',
      standing: 'Standing'
    };

    const targetAction = actions[animMap[playerAnimation] || 'Idle'];
    
    if (targetAction) {
      // Smooth transition between animations
      targetAction.reset().fadeIn(0.2).play();
      return () => {
        targetAction.fadeOut(0.2);
      };
    }
  }, [playerAnimation, isSprinting, actions]);

  // Rotate model to face movement direction
  useFrame((state) => {
    if (group.current) {
      // The store.ts should have playerRotation, but if not we can derive it
      // For this demo, we'll assume the parent component handles the position
      // but we might want to apply slight bobbing or procedural effects here
    }
  });

  return (
    <group ref={group} scale={0.5} position={[0, -1, 0]}>
      <primitive object={scene} />
      {/* Dynamic Lighting from the character for "High Quality" feel */}
      <pointLight position={[0, 1, 1]} intensity={0.5} color="#3b82f6" />
    </group>
  );
}

// Preload the model
useGLTF.preload(MODEL_URL);
