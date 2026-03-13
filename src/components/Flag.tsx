import { useMemo } from 'react';
import { useGameStore } from '../store';
import { Text } from '@react-three/drei';

export function Flags() {
  const flags = useGameStore(state => state.flags);
  const selectedMode = useGameStore(state => state.selectedMode);

  if (selectedMode !== 'ctf') return null;

  return (
    <>
      {flags.map((flag) => (
        <group key={flag.team} position={flag.position}>
          {/* Flag Pole */}
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          
          {/* Flag Fabric */}
          <mesh position={[0.4, 2.5, 0]}>
            <boxGeometry args={[0.8, 0.6, 0.05]} />
            <meshStandardMaterial 
              color={flag.team === 'amber' ? '#f59e0b' : '#3b82f6'} 
              emissive={flag.team === 'amber' ? '#f59e0b' : '#3b82f6'}
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Glow at base */}
          {!flag.carrierId && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <ringGeometry args={[0.8, 1, 32]} />
              <meshBasicMaterial 
                color={flag.team === 'amber' ? '#f59e0b' : '#3b82f6'} 
                transparent 
                opacity={0.5} 
              />
            </mesh>
          )}

          <Text
            position={[0, 3.5, 0]}
            fontSize={0.4}
            color={flag.team === 'amber' ? '#f59e0b' : '#3b82f6'}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {flag.team.toUpperCase()} FLAG
          </Text>
        </group>
      ))}
    </>
  );
}
