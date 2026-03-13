import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

interface JumpPadProps {
  position: [number, number, number];
  power: number;
}

export function JumpPad({ position, power }: JumpPadProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
    if (ringRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
      ringRef.current.scale.set(s, 1, s);
      ringRef.current.position.y = 0.1 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Base */}
      <Cylinder args={[1.5, 1.8, 0.2, 32]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Glowing Core */}
      <Cylinder ref={meshRef} args={[1.2, 1.2, 0.1, 6]} position={[0, 0.2, 0]}>
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={2} 
          transparent 
          opacity={0.8}
        />
      </Cylinder>

      {/* Energy Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        <ringGeometry args={[1.3, 1.5, 32]} />
        <meshStandardMaterial 
          color="#ff00ff" 
          emissive="#ff00ff" 
          emissiveIntensity={5} 
          transparent 
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.4}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        JUMP PAD
      </Text>
      
      <pointLight position={[0, 1, 0]} color="#00ffff" intensity={2} distance={5} />
    </group>
  );
}
