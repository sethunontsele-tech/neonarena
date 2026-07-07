import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';

export function Portal() {
  const portalPosition = useGameStore(state => state.portalPosition);
  const portalMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (portalMeshRef.current) {
      portalMeshRef.current.rotation.y += 0.04;
      portalMeshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2.5) * 0.15;
    }
  });

  if (!portalPosition) return null;

  return (
    <group position={portalPosition}>
      {/* Visual ring/cylinder portal component */}
      <mesh ref={portalMeshRef} position={[0, 2, 0]} castShadow>
        <torusGeometry args={[1.5, 0.25, 16, 100]} />
        <meshBasicMaterial color="#d946ef" toneMapped={false} />
      </mesh>
      
      {/* Pulsing neon center core */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.1, 32]} />
        <meshStandardMaterial 
          color="#a21caf" 
          emissive="#d946ef" 
          emissiveIntensity={3.5} 
          roughness={0.15}
        />
        <pointLight color="#d946ef" intensity={5.0} distance={25} />
      </mesh>

      {/* Ground portal shadow shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.01, 2.5, 32]} />
        <meshBasicMaterial color="#701a75" transparent opacity={0.65} />
      </mesh>

      <Html position={[0, 4.2, 0]} center distanceFactor={15}>
        <div className="bg-black/95 border border-fuchsia-500/50 text-fuchsia-300 font-mono text-[9px] uppercase font-black px-3 py-1.5 rounded-full whitespace-nowrap shadow-[0_0_20px_rgba(217,70,239,0.5)] flex items-center gap-1.5 animate-pulse select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 animate-ping" />
          🌀 SYSTEM PORTAL: DESCEND TO NEXT PROCEDURAL LEVEL
        </div>
      </Html>
    </group>
  );
}
export default Portal;
