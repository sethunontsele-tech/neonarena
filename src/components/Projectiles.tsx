import { useGameStore } from '../store';
import { useShallow } from 'zustand/react/shallow';

export function Projectiles() {
  const projectiles = useGameStore(state => state.projectiles);

  return (
    <>
      {projectiles.map(p => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial 
            color={p.type === 'grenade' ? '#ff4400' : '#ffaa00'} 
            emissive={p.type === 'grenade' ? '#ff4400' : '#ffaa00'}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </>
  );
}
