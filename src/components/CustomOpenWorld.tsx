import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader, MTLLoader } from 'three-stdlib';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { NeonOpenWorld } from './OpenWorld/NeonOpenWorld';
import { OpenWorldVehiclesFleet, OpenWorldVehicleInstance } from './OpenWorld/OpenWorldVehicles';
import { OpenWorldCreaturesManager } from './OpenWorld/OpenWorldCreatures';
import { WorldEventsManager } from './OpenWorld/WorldEventsSystem';
import { TheGreatFloodMode } from './OpenWorld/TheGreatFloodMode';
import { MapCreatorRenderer } from './OpenWorld/MapCreatorStudio';
import { TitanTransformationAvatar } from './OpenWorld/TitanTransformations';
import { MEGA_VEHICLES } from './OpenWorld/configs';
import { MegaVehicleType, TransformationId, PlacedMapObject } from './OpenWorld/types';
import { useGameStore } from '../store';

function CustomUploadedModel() {
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
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#06b6d4',
            roughness: 0.5,
            metalness: 0.3
          });
        }
      }
    });
    return clone;
  }, [obj]);

  return (
    <RigidBody type="fixed" colliders="trimesh" name="custom-uploaded-open-world">
      <primitive object={clonedObj} scale={1.0} position={[0, 0, 0]} />
    </RigidBody>
  );
}

export interface CustomOpenWorldProps {
  activeTransformation?: TransformationId | null;
  onDeactivateTransformation?: () => void;
  isFloodActive?: boolean;
  spawnedVehicles?: Array<{ id: string; type: MegaVehicleType; pos: [number, number, number] }>;
  placedObjects?: PlacedMapObject[];
}

export const CustomOpenWorld: React.FC<CustomOpenWorldProps> = ({
  activeTransformation = null,
  onDeactivateTransformation = () => {},
  isFloodActive = false,
  spawnedVehicles = [],
  placedObjects = []
}) => {
  const [hasCustomFile, setHasCustomFile] = useState(false);
  const playerPos = useGameStore(state => state.playerPosition);

  useEffect(() => {
    fetch('/open_world/open_world.obj', { method: 'HEAD' })
      .then((res) => setHasCustomFile(res.ok))
      .catch(() => setHasCustomFile(false));
  }, []);

  return (
    <group name="master-open-world-container">
      {/* 1. Procedural Massive Biome Open World */}
      <NeonOpenWorld />

      {/* 2. Full Fleet of Pre-Parked Vehicles Across All Biomes */}
      <OpenWorldVehiclesFleet />

      {/* 3. Dynamically Spawned Vehicles from HUD */}
      {spawnedVehicles.map((v) => {
        const config = MEGA_VEHICLES.find(cfg => cfg.id === v.type) || MEGA_VEHICLES[0];
        return (
          <OpenWorldVehicleInstance
            key={v.id}
            id={v.id}
            config={config}
            initialPosition={v.pos}
          />
        );
      })}

      {/* 4. Creatures, Wildlife & Mounts */}
      <OpenWorldCreaturesManager />

      {/* 5. Dynamic World Events (Airdrops, Food Rain, World Boss) */}
      <WorldEventsManager />

      {/* 6. The Great Flood Mode */}
      <TheGreatFloodMode isActive={isFloodActive} />

      {/* 7. Map Creator Placed Assets */}
      <MapCreatorRenderer placedObjects={placedObjects} />

      {/* 8. Titan & Anime Transformations Avatar */}
      {activeTransformation && (
        <TitanTransformationAvatar
          activeForm={activeTransformation}
          playerPos={playerPos}
          playerRot={0}
          onDeactivate={onDeactivateTransformation}
        />
      )}

      {/* 9. Optional Custom User-Uploaded 3D Model If Available */}
      {hasCustomFile && (
        <Suspense fallback={null}>
          <CustomUploadedModel />
        </Suspense>
      )}
    </group>
  );
};
