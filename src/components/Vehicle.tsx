import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore, VehicleData } from '../store';
import { Float, Sparkles, Trail } from '@react-three/drei';

export const Vehicle: React.FC<{ data: VehicleData }> = ({ data }) => {
  const rb = useRef<any>(null);
  const currentVehicleId = useGameStore(state => state.currentVehicleId);
  const isDriving = currentVehicleId === data.id;
  
  const isReplaying = useGameStore(state => state.isReplaying);
  
  useFrame((state, delta) => {
    if (!rb.current) return;
    
    if (isReplaying) {
      // In replay mode, we manually set the position and rotation from the snapshot
      rb.current.setTranslation(new THREE.Vector3(...data.position), true);
      rb.current.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(...data.rotation)), true);
      return;
    }

    if (!isDriving) return;
    
    // Simple driving physics for demo
    const keys = (state as any).get().keys;
    const forward = keys.w ? 1 : keys.s ? -1 : 0;
    const turn = keys.a ? 1 : keys.d ? -1 : 0;
    
    const impulse = new THREE.Vector3(0, 0, forward * 50);
    const torque = new THREE.Vector3(0, turn * 10, 0);
    
    rb.current.applyImpulse(impulse, true);
    rb.current.applyTorqueImpulse(torque, true);
    
    // Update store with new position
    const pos = rb.current.translation();
    const rot = rb.current.rotation();
    useGameStore.getState().updateVehicle(data.id, {
      position: [pos.x, pos.y, pos.z],
      rotation: [rot.x, rot.y, rot.z],
      speed: rb.current.linvel().length()
    });
  });

  return (
    <RigidBody 
      ref={rb} 
      position={data.position} 
      colliders={false}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <CuboidCollider args={[1.5, 0.8, 2.5]} />
      
      <group rotation={data.rotation}>
        {/* Car Body */}
        {data.type === 'car' && (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.5, 1, 4.5]} />
            <meshStandardMaterial 
              color={data.team === 'amber' ? '#ff4444' : data.team === 'blue' ? '#4444ff' : '#333'} 
              metalness={0.8} 
              roughness={0.2} 
            />
            {/* Windshield */}
            <mesh position={[0, 0.6, 0.5]}>
              <boxGeometry args={[2.2, 0.8, 1.5]} />
              <meshStandardMaterial color="#88ccff" transparent opacity={0.6} />
            </mesh>
            {/* Neon Underglow */}
            <pointLight position={[0, -0.4, 0]} intensity={2} color="#00ffff" distance={5} />
          </mesh>
        )}

        {/* Helicopter Body */}
        {data.type === 'helicopter' && (
          <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.5, 1.5, 4]} />
              <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
              {/* Rotors */}
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[6, 0.1, 0.2]} />
                <meshStandardMaterial color="#222" />
              </mesh>
              {/* Tail */}
              <mesh position={[0, 0.5, -2.5]}>
                <boxGeometry args={[0.2, 0.8, 2]} />
                <meshStandardMaterial color="#444" />
              </mesh>
            </mesh>
          </Float>
        )}

        {/* Motorbike Body */}
        {data.type === 'motorbike' && (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 1.2, 2.5]} />
            <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
            {/* Wheels */}
            <mesh position={[0, -0.4, 1]} rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.4, 0.4, 0.4, 16]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0, -0.4, -1]} rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.4, 0.4, 0.4, 16]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </mesh>
        )}
      </group>
    </RigidBody>
  );
};
