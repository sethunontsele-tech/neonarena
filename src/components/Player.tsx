/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, useRapier, CapsuleCollider } from '@react-three/rapier';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, WEAPONS } from '../store';
import { PlayerModel } from './PlayerModel';
import { BLOCK_COLORS } from './Arena';

const SPEED = 12;
const MAX_LASER_DIST = 100;

export function Player() {
  const body = useRef<RapierRigidBody>(null);
  const { camera, gl } = useThree();
  const { rapier, world } = useRapier();
  
  const playerState = useGameStore(state => state.playerState);
  const gameState = useGameStore(state => state.gameState);
  const addLaser = useGameStore(state => state.addLaser);
  const hitEnemy = useGameStore(state => state.hitEnemy);
  const addParticles = useGameStore(state => state.addParticles);

  const recordShot = useGameStore(state => state.recordShot);
  const recordHit = useGameStore(state => state.recordHit);
  const mobileControls = useGameStore(state => state.mobileControls);
  const isMobile = useGameStore(state => state.isMobile);

  const keys = useRef({ w: false, a: false, s: false, d: false, space: false });
  const lastEmitTime = useRef(0);
  const isGrounded = useRef(false);

  const gunGroupRef = useRef<THREE.Group>(null);
  const gunVisualRef = useRef<THREE.Group>(null);
  const gunBarrelRef = useRef<THREE.Group>(null);

  const selectedSkin = useGameStore(state => state.selectedSkin);
  const selectedColor = useGameStore(state => state.selectedColor);
  const selectedPattern = useGameStore(state => state.selectedPattern);
  const selectedAccessories = useGameStore(state => state.selectedAccessories);
  const isThirdPerson = useGameStore(state => state.isThirdPerson);
  const toggleThirdPerson = useGameStore(state => state.toggleThirdPerson);
  const inventory = useGameStore(state => state.inventory);
  const currentWeaponIndex = useGameStore(state => state.currentWeaponIndex);
  const switchWeapon = useGameStore(state => state.switchWeapon);
  const isInventoryOpen = useGameStore(state => state.isInventoryOpen);
  const setInventoryOpen = useGameStore(state => state.setInventoryOpen);
  const isBuildMode = useGameStore(state => state.isBuildMode);
  const selectedBlock = useGameStore(state => state.selectedBlock);
  const placeBlock = useGameStore(state => state.placeBlock);
  const breakBlock = useGameStore(state => state.breakBlock);
  const team = useGameStore(state => state.team);
  const health = useGameStore(state => state.health);
  const jumpHeight = useGameStore(state => state.jumpHeight);
  const gravity = useGameStore(state => state.gravity);
  const mouseSensitivity = useGameStore(state => state.mouseSensitivity);
  const fov = useGameStore(state => state.fov);
  const cameraShake = useGameStore(state => state.cameraShake);
  const sprintSpeed = useGameStore(state => state.sprintSpeed);
  const setPlayerPosition = useGameStore(state => state.setPlayerPosition);
  const fireProjectile = useGameStore(state => state.fireProjectile);
  const recoilRef = useRef(0);

  const currentAmmo = useGameStore(state => state.currentAmmo);
  const consumeAmmo = useGameStore(state => state.consumeAmmo);
  const reload = useGameStore(state => state.reload);

  const currentWeapon = WEAPONS[inventory[currentWeaponIndex]];
  const lastFireTime = useRef(0);
  const lastMobileFireTime = useRef(0);
  const lastBuildTime = useRef(0);
  const previewRef = useRef<THREE.Mesh>(null);

  const triggerFire = () => {
    if (gameState !== 'playing' || playerState !== 'active' || isInventoryOpen) return;

    if (isBuildMode) {
      // Build mode: Left click to break
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const rayStart = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(0.1));
      const ray = new rapier.Ray(rayStart, raycaster.ray.direction);
      const hit = world.castRay(ray, 5, true);

      if (hit) {
        const collider = hit.collider;
        const rb = collider.parent();
        if (rb && rb.userData) {
          const userData = rb.userData as { name?: string };
          if (userData.name && userData.name.startsWith('block-')) {
            const blockId = userData.name.replace('block-', '');
            breakBlock(blockId);
            addParticles([rayStart.x + raycaster.ray.direction.x * hit.timeOfImpact, rayStart.y + raycaster.ray.direction.y * hit.timeOfImpact, rayStart.z + raycaster.ray.direction.z * hit.timeOfImpact], '#ffffff');
          }
        }
      }
      return;
    }

    const now = Date.now();
    if (now - lastFireTime.current < currentWeapon.fireRate) return;
    
    // Check ammo
    if (!currentWeapon.isMelee && currentAmmo[currentWeapon.id] <= 0) {
      useGameStore.getState().addEvent('OUT OF AMMO! PRESS R TO RELOAD');
      return;
    }
    
    lastFireTime.current = now;
    if (!currentWeapon.isMelee) {
      consumeAmmo();
      recordShot();
    }

    // Self-healing for medkit
    if (currentWeapon.id === 'medkit') {
      useGameStore.getState().hitEnemy('player', currentWeapon.damage);
      addParticles(camera.position.toArray() as [number, number, number], '#00ff00');
      return;
    }

    // Recoil
    if (gunVisualRef.current) {
      gunVisualRef.current.position.z += 0.2;
      gunVisualRef.current.rotation.x -= 0.1;
      recoilRef.current = 0.5;
    }

    // Raycast from camera
    const raycaster = new THREE.Raycaster();
    
    // Handle multiple pellets for shotgun
    for (let i = 0; i < currentWeapon.pellets; i++) {
      const spread = currentWeapon.spread;
      const spreadVec = new THREE.Vector2(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      );
      
      raycaster.setFromCamera(spreadVec, camera);

      const startPosVec = new THREE.Vector3();
      if (gunBarrelRef.current) {
        gunBarrelRef.current.getWorldPosition(startPosVec);
      } else {
        startPosVec.copy(camera.position);
      }
      const startPos: [number, number, number] = [startPosVec.x, startPosVec.y, startPosVec.z];

      // Special handling for projectile weapons
      if (currentWeapon.id === 'grenade_launcher') {
        const direction = raycaster.ray.direction.clone();
        const speed = 25;
        const velocity: [number, number, number] = [
          direction.x * speed,
          direction.y * speed + 5, // Add some upward arc
          direction.z * speed
        ];
        
        fireProjectile({
          type: 'grenade',
          position: startPos,
          velocity,
          damage: currentWeapon.damage,
          radius: 5
        });
        return;
      }

      // Start raycast slightly ahead
      const rayStart = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(0.8));
      const ray = new rapier.Ray(rayStart, raycaster.ray.direction);
      const hit = world.castRay(ray, currentWeapon.range, true);

      // Apply recoil
      if (gunVisualRef.current) {
        gunVisualRef.current.position.z = -0.4;
        gunVisualRef.current.rotation.x = 0.1;
      }

      let endPos: [number, number, number];

      if (hit) {
        const hitPoint = ray.pointAt(hit.timeOfImpact);
        endPos = [hitPoint.x, hitPoint.y, hitPoint.z];
        
        if (currentWeapon.isExplosive) {
          // RPG Explosion logic
          addParticles(endPos, '#ff4400');
        }

        const collider = hit.collider;
        const rb = collider.parent();
        if (rb && rb.userData) {
          const userData = rb.userData as { name?: string };
          if (userData.name && userData.name.startsWith('bot-')) {
            hitEnemy(userData.name, currentWeapon.damage);
            recordHit();
          } else if (userData.name && userData.name !== 'player' && !userData.name.startsWith('obstacle') && !userData.name.startsWith('wall') && userData.name !== 'floor' && userData.name !== 'ceiling') {
            hitEnemy(userData.name, currentWeapon.damage);
            recordHit();
          }
        }
        
        addParticles(endPos, '#00ffff');
      } else {
        endPos = [
          camera.position.x + raycaster.ray.direction.x * currentWeapon.range,
          camera.position.y + raycaster.ray.direction.y * currentWeapon.range,
          camera.position.z + raycaster.ray.direction.z * currentWeapon.range
        ];
      }

      addLaser(startPos, endPos, '#00ffff');
    }
  };

  const triggerBuild = () => {
    if (gameState !== 'playing' || playerState !== 'active' || isInventoryOpen || !isBuildMode) return;

    const now = Date.now();
    if (now - lastBuildTime.current < 200) return;
    lastBuildTime.current = now;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const rayStart = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(0.1));
    const ray = new rapier.Ray(rayStart, raycaster.ray.direction);
    const hit = world.castRay(ray, 5, true);

    if (hit) {
      const hitPoint = ray.pointAt(hit.timeOfImpact);
      const pos = [
        Math.round(hitPoint.x),
        Math.round(hitPoint.y),
        Math.round(hitPoint.z)
      ];

      // Offset based on which side was hit
      const dx = Math.abs(hitPoint.x - pos[0]);
      const dy = Math.abs(hitPoint.y - pos[1]);
      const dz = Math.abs(hitPoint.z - pos[2]);

      if (dx > dy && dx > dz) pos[0] += hitPoint.x > pos[0] ? 1 : -1;
      else if (dy > dx && dy > dz) pos[1] += hitPoint.y > pos[1] ? 1 : -1;
      else pos[2] += hitPoint.z > pos[2] ? 1 : -1;

      placeBlock(pos as [number, number, number]);
    } else {
      const pos = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(4));
      placeBlock([Math.round(pos.x), Math.round(pos.y), Math.round(pos.z)]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === ' ') keys.current.space = true;
      if (key in keys.current) keys.current[key as keyof typeof keys.current] = true;
      
      if (key === 'v') toggleThirdPerson();
      if (key === 'e') setInventoryOpen(!useGameStore.getState().isInventoryOpen);
      if (key === 'r') reload();
      
      if (key === 'b') useGameStore.getState().setBuildMode(!useGameStore.getState().isBuildMode);
      
      // Hotbar keys
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (isBuildMode) {
          const blocks = ['stone', 'cobblestone', 'dirt', 'grass', 'sand', 'gravel', 'clay', 'bedrock', 'oak_log', 'oak_planks', 'leaves', 'furnace', 'crafting_table', 'chest', 'barrel', 'anvil', 'enchanting_table', 'coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore', 'emerald_ore', 'redstone_ore', 'lapis_ore', 'bricks', 'quartz', 'concrete', 'terracotta'] as const;
          if (idx < blocks.length) useGameStore.getState().setSelectedBlock(blocks[idx]);
        } else {
          if (idx < inventory.length) switchWeapon(idx);
        }
      }

      // Emotes (moved to 5-8 or similar if needed, but let's keep them accessible)
      if (e.key === 'F1') useGameStore.getState().triggerEmote('GG!');
      if (e.key === '2') useGameStore.getState().triggerEmote('Nice shot!');
      if (e.key === '3') useGameStore.getState().triggerEmote('LOL');
      if (e.key === '4') useGameStore.getState().triggerEmote('REVENGE!');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === ' ') keys.current.space = false;
      if (key in keys.current) keys.current[key as keyof typeof keys.current] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const updatePlayerPosition = useGameStore(state => state.updatePlayerPosition);
  const jumpPads = useGameStore(state => state.jumpPads);

  useFrame((_, delta) => {
    if (!body.current || gameState !== 'playing') return;

    const pos = body.current.translation();
    setPlayerPosition([pos.x, pos.y, pos.z]);
    const velocity = body.current.linvel();
    
    // Jump Pad Check
    jumpPads.forEach(pad => {
      const dist = Math.sqrt(
        Math.pow(pos.x - pad.position[0], 2) + 
        Math.pow(pos.z - pad.position[2], 2)
      );
      if (dist < 1.5 && Math.abs(pos.y - pad.position[1]) < 1) {
        body.current?.setLinvel({ x: velocity.x, y: pad.power, z: velocity.z }, true);
        useGameStore.getState().addEvent('JUMP PAD ACTIVATED!');
      }
    });

    // Movement
    const k = keys.current;
    
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();

    const moveZ = (k.w ? 1 : 0) - (k.s ? 1 : 0) + (isMobile ? mobileControls.move.y : 0);
    const moveX = (k.d ? 1 : 0) - (k.a ? 1 : 0) + (isMobile ? mobileControls.move.x : 0);

    const direction = new THREE.Vector3();
    direction.addScaledVector(forward, moveZ);
    direction.addScaledVector(right, moveX);
    
    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(SPEED);
    }

    // Mobile Look
    if (isMobile && (mobileControls.look.x !== 0 || mobileControls.look.y !== 0)) {
      const lookSpeed = 0.05;
      camera.rotation.y -= mobileControls.look.x * lookSpeed * delta;
      camera.rotation.x -= mobileControls.look.y * lookSpeed * delta;
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    }

    // Update camera position
    if (isThirdPerson) {
      // Third Person Camera
      const cameraOffset = new THREE.Vector3(0, 2, 5); // Behind and above
      cameraOffset.applyQuaternion(camera.quaternion);
      cameraOffset.y = 2; // Keep height relatively stable
      
      const targetCameraPos = new THREE.Vector3(pos.x, pos.y, pos.z).add(cameraOffset);
      camera.position.lerp(targetCameraPos, 0.2);
      
      // Gun should still be visible but maybe positioned differently? 
      // Actually, in many 3rd person shooters, the gun is on the model.
      // For now, let's just keep the gun group synced but maybe hide it or move it.
    } else {
      // First Person Camera
      camera.position.set(pos.x, pos.y + 0.8, pos.z); // Eye level
    }

    // Ground check
    const rayStart = new THREE.Vector3(pos.x, pos.y + 0.1, pos.z);
    const rayDir = new THREE.Vector3(0, -1, 0);
    const ray = new rapier.Ray(rayStart, rayDir);
    const hit = world.castRay(ray, 0.5, true);
    isGrounded.current = !!hit;

    // Jump
    let jumpVel = velocity.y;
    if ((k.space || (isMobile && mobileControls.jump)) && isGrounded.current) {
      jumpVel = Math.sqrt(jumpHeight * 2 * gravity);
    }

    body.current.setLinvel({ x: direction.x, y: jumpVel, z: direction.z }, true);

    // Camera FOV and Shake
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = fov;
      camera.updateProjectionMatrix();
    }

    if (cameraShake > 0 && health < 50) {
      const shake = (1 - health / 50) * cameraShake * 0.05;
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake;
    }

    // Sync gun to camera
    if (gunGroupRef.current) {
      gunGroupRef.current.position.copy(camera.position);
      gunGroupRef.current.quaternion.copy(camera.quaternion);
    }
    
    // Recover recoil
    if (gunVisualRef.current) {
      gunVisualRef.current.position.z = THREE.MathUtils.lerp(gunVisualRef.current.position.z, -0.6, delta * 15);
      gunVisualRef.current.rotation.x = THREE.MathUtils.lerp(gunVisualRef.current.rotation.x, 0, delta * 15);
    }

    // Build Preview
    if (isBuildMode && previewRef.current) {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const rayStart = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(0.1));
      const ray = new rapier.Ray(rayStart, raycaster.ray.direction);
      const hit = world.castRay(ray, 5, true);

      if (hit) {
        const hitPoint = ray.pointAt(hit.timeOfImpact);
        const pos = [Math.round(hitPoint.x), Math.round(hitPoint.y), Math.round(hitPoint.z)];
        const dx = Math.abs(hitPoint.x - pos[0]);
        const dy = Math.abs(hitPoint.y - pos[1]);
        const dz = Math.abs(hitPoint.z - pos[2]);

        if (dx > dy && dx > dz) pos[0] += hitPoint.x > pos[0] ? 1 : -1;
        else if (dy > dx && dy > dz) pos[1] += hitPoint.y > pos[1] ? 1 : -1;
        else pos[2] += hitPoint.z > pos[2] ? 1 : -1;

        previewRef.current.position.set(pos[0], pos[1], pos[2]);
        previewRef.current.visible = true;
      } else {
        const pos = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(4));
        previewRef.current.position.set(Math.round(pos.x), Math.round(pos.y), Math.round(pos.z));
        previewRef.current.visible = true;
      }
    } else if (previewRef.current) {
      previewRef.current.visible = false;
    }

    // Mobile Fire
    if (isMobile && mobileControls.fire && gameState === 'playing' && playerState === 'active' && !isInventoryOpen) {
      const now = Date.now();
      if (now - lastMobileFireTime.current > currentWeapon.fireRate) {
        // Check ammo
        if (currentWeapon.isMelee || currentAmmo[currentWeapon.id] > 0) {
          lastMobileFireTime.current = now;
          triggerFire();
        } else {
          if (now - lastMobileFireTime.current > 2000) {
            useGameStore.getState().addEvent('OUT OF AMMO! PRESS R TO RELOAD');
            lastMobileFireTime.current = now;
          }
        }
      }
    }

    // Emit position to server
    const now = Date.now();
    if (now - lastEmitTime.current > 50) {
      updatePlayerPosition([pos.x, pos.y, pos.z], camera.rotation.y);
      lastEmitTime.current = now;
    }
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button === 0) {
        triggerFire();
      } else if (e.button === 2) {
        triggerBuild();
      }
    };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gameState, playerState, camera, world, rapier, hitEnemy, addParticles, addLaser, currentWeapon, gl, isInventoryOpen, isBuildMode, selectedBlock]);

  const color = playerState === 'disabled' ? '#444' : (team === 'amber' ? '#f59e0b' : (team === 'blue' ? '#3b82f6' : '#f59e0b'));

  const armMaterial = (
    <meshStandardMaterial 
      color={
        selectedSkin === 'gold' ? '#ffd700' : 
        selectedSkin === 'ruby' ? '#ff0000' :
        selectedSkin === 'emerald' ? '#00ff44' :
        selectedSkin === 'diamond' ? '#b9f2ff' :
        selectedSkin === 'void' ? '#000000' :
        color
      } 
      roughness={
        selectedSkin === 'gold' ? 0.1 : 
        selectedSkin === 'diamond' ? 0.05 :
        selectedSkin === 'void' ? 1 :
        0.3
      } 
      metalness={
        selectedSkin === 'gold' ? 1 : 
        selectedSkin === 'ruby' ? 0.8 :
        selectedSkin === 'emerald' ? 0.6 :
        selectedSkin === 'diamond' ? 0.9 :
        selectedSkin === 'void' ? 0 :
        0.8
      } 
      emissive={
        selectedSkin === 'gold' ? '#ffd700' : 
        selectedSkin === 'ruby' ? '#660000' :
        selectedSkin === 'emerald' ? '#00ff44' :
        selectedSkin === 'diamond' ? '#ffffff' :
        selectedSkin === 'void' ? '#000000' :
        color
      }
      emissiveIntensity={
        playerState === 'disabled' ? 0 : 
        (selectedSkin === 'neon' ? 0.8 : 
         selectedSkin === 'emerald' ? 1.2 :
         selectedSkin === 'void' ? 0 :
         0.4)
      }
      transparent={selectedSkin === 'stealth' || selectedSkin === 'diamond'}
      opacity={selectedSkin === 'stealth' ? 0.4 : selectedSkin === 'diamond' ? 0.6 : 1}
    />
  );

  return (
    <>
      {!isMobile && <PointerLockControls />}
      <RigidBody
        ref={body}
        colliders={false}
        mass={1}
        type="dynamic"
        position={[0, 2, 0]}
        enabledRotations={[false, false, false]}
        userData={{ name: 'player' }}
        friction={0}
      >
        <CapsuleCollider args={[0.5, 0.2]} position={[0, 0.7, 0]} friction={0} />
        
        {/* Player Model (Visible in Third Person) */}
        {isThirdPerson && (
          <group rotation={[0, camera.rotation.y + Math.PI, 0]} position={[0, 0, 0]}>
            <PlayerModel 
              skin={selectedSkin} 
              color={selectedColor} 
              pattern={selectedPattern} 
              accessories={selectedAccessories} 
              state={playerState} 
              isMe 
            />
          </group>
        )}
      </RigidBody>

      {/* Build Preview */}
      {isBuildMode && (
        <mesh ref={previewRef}>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
        </mesh>
      )}

      {/* First Person Arms & Block (Build Mode) */}
      {!isThirdPerson && isBuildMode && (
        <group ref={gunGroupRef}>
          <group position={[0.6, -0.4, -0.8]} scale={0.6}>
            <mesh castShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={BLOCK_COLORS[selectedBlock] || '#ffffff'} />
            </mesh>
          </group>
        </group>
      )}

      {/* First Person Arms & Gun */}
      {!isThirdPerson && !isBuildMode && (
        <group ref={gunGroupRef}>
          {/* Left Arm */}
          <group position={[-0.4, -0.4, -0.4]} rotation={[0.4, 0.2, 0.1]}>
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.12, 0.6]} />
              {armMaterial}
            </mesh>
            {/* Hand */}
            <mesh position={[0, 0, -0.35]}>
              <boxGeometry args={[0.15, 0.15, 0.15]} />
              {armMaterial}
            </mesh>
          </group>
          {/* Right Arm */}
          <group position={[0.4, -0.4, -0.4]} rotation={[0.4, -0.2, -0.1]}>
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.12, 0.6]} />
              {armMaterial}
            </mesh>
            {/* Hand */}
            <mesh position={[0, 0, -0.35]}>
              <boxGeometry args={[0.15, 0.15, 0.15]} />
              {armMaterial}
            </mesh>
          </group>

          <group ref={gunVisualRef} position={[0.6, -0.4, -0.8]} scale={1.5}>
            {currentWeapon.id === 'sword' || currentWeapon.id === 'axe' || currentWeapon.id === 'scythe' ? (
              <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[currentWeapon.id === 'sword' ? 0.05 : 0.1, 1.2, 0.1]} />
                  <meshStandardMaterial 
                    color={currentWeapon.id === 'sword' ? "#fff" : "#888"} 
                    emissive={currentWeapon.id === 'sword' ? "#00ffff" : "#ff0000"} 
                    emissiveIntensity={1} 
                  />
                </mesh>
                {currentWeapon.id === 'axe' && (
                  <mesh position={[0, 0.4, 0.1]} castShadow>
                    <boxGeometry args={[0.4, 0.3, 0.05]} />
                    <meshStandardMaterial color="#666" />
                  </mesh>
                )}
                {currentWeapon.id === 'scythe' && (
                  <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
                    <boxGeometry args={[0.6, 0.1, 0.05]} />
                    <meshStandardMaterial color="#333" />
                  </mesh>
                )}
                <mesh position={[0, -0.6, 0]}>
                  <boxGeometry args={[0.1, 0.3, 0.15]} />
                  <meshStandardMaterial color="#222" />
                </mesh>
              </group>
            ) : currentWeapon.id === 'minigun' || currentWeapon.id === 'flamethrower' ? (
              <group>
                <mesh castShadow>
                  <boxGeometry args={[0.2, 0.2, 0.6]} />
                  <meshStandardMaterial color={currentWeapon.id === 'flamethrower' ? "#442200" : "#333"} />
                </mesh>
                <mesh position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.1, 0.1, 0.4, 12]} />
                  <meshStandardMaterial color={currentWeapon.id === 'flamethrower' ? "#ff4400" : "#111"} />
                </mesh>
                {currentWeapon.id === 'minigun' && (
                  <group rotation={[0, 0, Date.now() * 0.01]}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 0.06, Math.sin(i * Math.PI / 3) * 0.06, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
                        <meshStandardMaterial color="#222" />
                      </mesh>
                    ))}
                  </group>
                )}
              </group>
            ) : currentWeapon.id === 'rpg' || currentWeapon.id === 'grenade_launcher' ? (
              <group>
                <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
                  <meshStandardMaterial color="#2a2a2a" />
                </mesh>
                {currentWeapon.id === 'grenade_launcher' && (
                  <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.2, 0.2, 0.25, 12]} />
                    <meshStandardMaterial color="#1a1a1a" />
                  </mesh>
                )}
                <mesh position={[0, -0.15, 0.1]}>
                  <boxGeometry args={[0.08, 0.3, 0.1]} />
                  <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.14, 0.12, 0.1, 16]} />
                  <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={0.5} />
                </mesh>
              </group>
            ) : currentWeapon.id === 'medkit' ? (
              <group>
                <mesh castShadow>
                  <boxGeometry args={[0.4, 0.3, 0.2]} />
                  <meshStandardMaterial color="#fff" />
                </mesh>
                <mesh position={[0, 0, 0.11]}>
                  <boxGeometry args={[0.05, 0.2, 0.01]} />
                  <meshBasicMaterial color="#ff0000" />
                </mesh>
                <mesh position={[0, 0, 0.11]}>
                  <boxGeometry args={[0.2, 0.05, 0.01]} />
                  <meshBasicMaterial color="#ff0000" />
                </mesh>
              </group>
            ) : (
              <>
                {/* Main body */}
                <mesh position={[0, 0, 0.2]} castShadow>
                  <boxGeometry args={[
                    currentWeapon.id === 'sniper' ? 0.08 : (currentWeapon.id === 'revolver' ? 0.12 : 0.1), 
                    currentWeapon.id === 'sniper' ? 0.1 : (currentWeapon.id === 'revolver' ? 0.2 : 0.15), 
                    currentWeapon.id === 'sniper' ? 0.6 : (currentWeapon.id === 'revolver' ? 0.3 : 0.4)
                  ]} />
                  <meshStandardMaterial 
                    color={selectedSkin === 'gold' ? '#ffd700' : (selectedSkin === 'stealth' ? '#111' : '#222')} 
                    metalness={selectedSkin === 'gold' ? 1 : 0.8} 
                    roughness={selectedSkin === 'gold' ? 0.1 : 0.2} 
                  />
                </mesh>
                {/* Barrel */}
                <mesh position={[0, 0.05, -0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[
                    currentWeapon.id === 'sniper' ? 0.02 : (currentWeapon.id === 'shotgun' || currentWeapon.id === 'double_barrel' ? 0.05 : 0.03), 
                    currentWeapon.id === 'double_barrel' ? 0.05 : 0.03, 
                    currentWeapon.id === 'sniper' ? 0.8 : (currentWeapon.id === 'revolver' ? 0.4 : 0.3), 
                    8
                  ]} />
                  <meshStandardMaterial 
                    color={selectedSkin === 'gold' ? '#fff' : (selectedSkin === 'stealth' ? '#000' : '#111')} 
                    metalness={0.9} 
                    roughness={0.1} 
                  />
                </mesh>
                {currentWeapon.id === 'double_barrel' && (
                   <mesh position={[0.06, 0.05, -0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.05, 0.03, 0.3, 8]} />
                    <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                  </mesh>
                )}
                {/* Neon accents */}
                <mesh position={[0, 0.08, 0.1]}>
                  <boxGeometry args={[0.11, 0.02, 0.2]} />
                  <meshBasicMaterial color={selectedSkin === 'gold' ? '#fff' : (selectedSkin === 'neon' ? '#f59e0b' : '#3b82f6')} toneMapped={false} />
                </mesh>
              </>
            )}
            {/* Barrel Tip Reference */}
            <group 
              ref={gunBarrelRef} 
              position={[
                0, 
                0.05, 
                currentWeapon.id === 'sword' ? 0 : 
                (currentWeapon.id === 'sniper' ? -0.9 : 
                (currentWeapon.id === 'rpg' ? -0.7 : -0.3))
              ]} 
            />
          </group>
        </group>
      )}
    </>
  );
}
