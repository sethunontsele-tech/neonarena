import React, { useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import { PlacedMapObject, CustomMapProject } from './types';
import { useGameStore } from '../../store';

interface MapCreatorProps {
  isEditing: boolean;
  placedObjects: PlacedMapObject[];
  onAddObject: (obj: PlacedMapObject) => void;
  onRemoveObject: (id: string) => void;
}

export const MapCreatorRenderer: React.FC<{ placedObjects: PlacedMapObject[] }> = ({ placedObjects }) => {
  return (
    <group name="custom-map-creator-placed-objects">
      {placedObjects.map((obj) => (
        <RigidBody key={obj.id} type="fixed" colliders="cuboid" position={obj.position}>
          <group scale={obj.scale} rotation={obj.rotation}>
            {obj.name === 'Skyscraper Tower' && (
              <mesh castShadow receiveShadow>
                <boxGeometry args={[14, 45, 14]} />
                <meshStandardMaterial color={obj.color || '#0284c7'} roughness={0.2} metalness={0.8} />
              </mesh>
            )}
            {obj.name === 'Military Bunker' && (
              <mesh castShadow receiveShadow>
                <boxGeometry args={[18, 6, 12]} />
                <meshStandardMaterial color={obj.color || '#334155'} roughness={0.8} />
              </mesh>
            )}
            {obj.name === 'Mega Jump Ramp' && (
              <mesh castShadow receiveShadow rotation={[-0.4, 0, 0]}>
                <boxGeometry args={[10, 1, 16]} />
                <meshStandardMaterial color={obj.color || '#eab308'} roughness={0.5} />
              </mesh>
            )}
            {obj.name === 'Stunt Loop Track' && (
              <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[12, 1.5, 16, 32]} />
                <meshStandardMaterial color={obj.color || '#f97316'} />
              </mesh>
            )}
            {obj.name === 'Pine Tree' && (
              <group>
                <mesh position={[0, 2, 0]}>
                  <cylinderGeometry args={[0.4, 0.6, 4, 6]} />
                  <meshStandardMaterial color="#451a03" />
                </mesh>
                <mesh position={[0, 6, 0]}>
                  <coneGeometry args={[3, 7, 6]} />
                  <meshStandardMaterial color="#15803d" />
                </mesh>
              </group>
            )}
            {obj.name === 'Neon Jump Pad' && (
              <group>
                <mesh position={[0, 0.2, 0]}>
                  <cylinderGeometry args={[3, 3, 0.4, 16]} />
                  <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.8} />
                </mesh>
              </group>
            )}
            {obj.name === 'Energy Shield Turret' && (
              <group>
                <mesh position={[0, 1.5, 0]}>
                  <cylinderGeometry args={[0.8, 1.2, 3, 8]} />
                  <meshStandardMaterial color="#64748b" />
                </mesh>
                <mesh position={[0, 3.2, 0]}>
                  <sphereGeometry args={[1, 12, 12]} />
                  <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.6} />
                </mesh>
              </group>
            )}
          </group>
        </RigidBody>
      ))}
    </group>
  );
};
