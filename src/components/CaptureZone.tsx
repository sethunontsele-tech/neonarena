import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useGameStore, ControlPoint, Team } from '../store';

interface CaptureZoneProps {
  data: ControlPoint;
}

export function CaptureZone({ data }: CaptureZoneProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const isTimeWarpActive = useGameStore(state => state.isTimeWarpActive);

  useFrame((state) => {
    const timeWarpFactor = isTimeWarpActive ? 0.2 : 1.0;
    const elapsedTime = state.clock.getElapsedTime();

    if (ringRef.current) {
      ringRef.current.rotation.z = elapsedTime * 0.5 * timeWarpFactor;
    }
    if (beamRef.current) {
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(elapsedTime * 2 * timeWarpFactor) * 0.1;
    }
  });

  const getTeamColor = (team: Team) => {
    if (team === 'amber') return '#f59e0b';
    if (team === 'blue') return '#3b82f6';
    return '#ffffff';
  };

  const ownerColor = getTeamColor(data.owner);
  const capturingColor = getTeamColor(data.capturingTeam);

  return (
    <group position={data.position}>
      {/* Ground Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} ref={ringRef}>
        <ringGeometry args={[data.radius - 0.5, data.radius, 64]} />
        <meshBasicMaterial color={ownerColor} transparent opacity={0.8} />
      </mesh>

      {/* Capture Progress Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[data.radius - 1, data.radius - 0.6, 64, 1, 0, (Math.abs(data.progress) / 100) * Math.PI * 2]} />
        <meshBasicMaterial color={capturingColor} transparent opacity={1} />
      </mesh>

      {/* Vertical Beam */}
      <mesh position={[0, 10, 0]} ref={beamRef}>
        <cylinderGeometry args={[data.radius, data.radius, 20, 32, 1, true]} />
        <meshBasicMaterial color={ownerColor} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 5, 0]}
        fontSize={1.5}
        color={ownerColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
      >
        {data.name}
      </Text>

      {/* Progress Text */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {Math.abs(data.progress)}%
      </Text>
    </group>
  );
}
