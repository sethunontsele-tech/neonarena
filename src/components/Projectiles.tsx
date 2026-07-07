import { useGameStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { useVisibilityCulling } from '../utils/useFrustumCulling';

function Projectile({ p }: { p: any }) {
  const isVisible = useVisibilityCulling(() => p.position, { radius: 1, maxDistance: 80, checkEvery: 1 });
  
  return (
    <mesh position={p.position} visible={isVisible}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial 
        color={p.type === 'grenade' ? '#ff4400' : '#ffaa00'} 
        emissive={p.type === 'grenade' ? '#ff4400' : '#ffaa00'}
        emissiveIntensity={2}
      />
    </mesh>
  );
}

export function Projectiles() {
  const projectiles = useGameStore(state => state.projectiles);

  return (
    <>
      {projectiles.map(p => (
        <Projectile key={p.id} p={p} />
      ))}
    </>
  );
}
