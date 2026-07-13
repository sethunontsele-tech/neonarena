/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, useRapier, CapsuleCollider } from '@react-three/rapier';
import { PointerLockControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, WEAPONS, DIMENSIONS } from '../store';
import { soundService } from '../services/soundService';
import { PlayerModel } from './PlayerModel';
import { BLOCK_COLORS } from './Arena';

const SPEED = 12;
const MAX_LASER_DIST = 100;

export function Player() {
  const body = useRef<RapierRigidBody>(null);
  const { camera, gl } = useThree();
  useEffect(() => {
    (window as any).camera = camera;
  }, [camera]);
  const { rapier, world } = useRapier();
  
  const playerState = useGameStore(state => state.playerState);
  const gameState = useGameStore(state => state.gameState);
  const addLaser = useGameStore(state => state.addLaser);
  const hitEnemy = useGameStore(state => state.hitEnemy);
  const infectPlayer = useGameStore(state => state.infectPlayer);
  const addParticles = useGameStore(state => state.addParticles);

  const recordShot = useGameStore(state => state.recordShot);
  const recordHit = useGameStore(state => state.recordHit);
  const mobileControls = useGameStore(state => state.mobileControls);
  const isMobile = useGameStore(state => state.isMobile);

  const energy = useGameStore(state => state.energy);
  const focus = useGameStore(state => state.focus);
  const overload = useGameStore(state => state.overload);
  const isFlashlightActive = useGameStore(state => state.isFlashlightActive);
  const instability = useGameStore(state => state.instability);
  const portalPosition = useGameStore(state => state.portalPosition);
  const mapSeed = useGameStore(state => state.mapSeed);
  const updateStats = useGameStore(state => state.updateStats);
  const arenaState = useGameStore(state => state.arenaState);
  const isWallRunningStore = useGameStore(state => state.isWallRunning);
  const wallRunSideStore = useGameStore(state => state.wallRunSide);
  const setWallRunning = useGameStore(state => state.setWallRunning);

  const keys = useRef({ w: false, a: false, s: false, d: false, space: false, shift: false, c: false });
  const lastEmitTime = useRef(0);
  const isGrounded = useRef(false);
  const jumpCount = useRef(0);
  const lastJumpTime = useRef(0);
  const lastDashTime = useRef(0);
  const lastHailDamageTime = useRef(0);
  const isSliding = useRef(false);
  const slideTime = useRef(0);

  const gunGroupRef = useRef<THREE.Group>(null);
  const gunVisualRef = useRef<THREE.Group>(null);
  const gunBarrelRef = useRef<THREE.Group>(null);

  const inspectAudioPhases = useRef({ start: false, mid: false, end: false });
  const playInspectSound = (phase: 'start' | 'mid' | 'end') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      if (phase === 'start') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (phase === 'mid') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(600, now + 0.05);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (phase === 'end') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedSkin = useGameStore(state => state.selectedSkin);
  const selectedColor = useGameStore(state => state.selectedColor);
  const selectedPattern = useGameStore(state => state.selectedPattern);
  const selectedAccessories = useGameStore(state => state.selectedAccessories);
  const isThirdPerson = useGameStore(state => state.isThirdPerson);
  const toggleThirdPerson = useGameStore(state => state.toggleThirdPerson);
  const hotbar = useGameStore(state => state.hotbar);
  const currentWeaponIndex = useGameStore(state => state.currentWeaponIndex);
  const switchWeapon = useGameStore(state => state.switchWeapon);
  const isInventoryOpen = useGameStore(state => state.isInventoryOpen);
  const setInventoryOpen = useGameStore(state => state.setInventoryOpen);
  const isBuildMode = useGameStore(state => state.isBuildMode);
  const selectedBlock = useGameStore(state => state.selectedBlock);
  const placeBlock = useGameStore(state => state.placeBlock);
  const breakBlock = useGameStore(state => state.breakBlock);
  const team = useGameStore(state => state.team);
  const playerClass = useGameStore(state => state.playerClass);
  const health = useGameStore(state => state.health);
  const jumpHeight = useGameStore(state => state.jumpHeight);
  const gravity = useGameStore(state => state.gravity);
  const mouseSensitivity = useGameStore(state => state.mouseSensitivity);
  const fov = useGameStore(state => state.fov);
  const cameraShake = useGameStore(state => state.cameraShake);
  const sprintSpeed = useGameStore(state => state.sprintSpeed);
  const setPlayerPosition = useGameStore(state => state.setPlayerPosition);
  const fireProjectile = useGameStore(state => state.fireProjectile);
  const meleeAttack = useGameStore(state => state.meleeAttack);
  const isGlitch = useGameStore(state => state.isGlitch);
  const infectionLevel = useGameStore(state => state.infectionLevel);
  const activeStreakPower = useGameStore(state => state.activeStreakPower);
  const isTimeWarpActive = useGameStore(state => state.isTimeWarpActive);
  const isAttacking = useGameStore(state => state.isAttacking);
  const currentDimension = useGameStore(state => state.currentDimension);
  const dimStats = DIMENSIONS[currentDimension] || DIMENSIONS.core;
  const moddedSpeedMultiplier = useGameStore(state => state.moddedSpeedMultiplier);
  const moddedGravityMultiplier = useGameStore(state => state.moddedGravityMultiplier);
  
  const recoilRef = useRef(0);

  const currentAmmo = useGameStore(state => state.currentAmmo);
  const consumeAmmo = useGameStore(state => state.consumeAmmo);
  const reload = useGameStore(state => state.reload);

  const currentWeapon = WEAPONS[hotbar[currentWeaponIndex]];
  const lastFireTime = useRef(0);
  const lastMobileFireTime = useRef(0);
  const lastBuildTime = useRef(0);
  const previewRef = useRef<THREE.Mesh>(null);
  
  // Spotlight / Flashlight Refs
  const flashlightGroupRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const spotlightTargetRef = useRef<THREE.Object3D | null>(null);
  const isFlickeringRef = useRef(false);

  useEffect(() => {
    const targetObj = new THREE.Object3D();
    targetObj.position.set(0, 0, -10);
    spotlightTargetRef.current = targetObj;
  }, []);
  
  // Gamepad State
  const gamepadRef = useRef<{ axes: number[], buttons: boolean[] }>({ axes: [0, 0, 0, 0], buttons: [] });

  const addReplaySnapshot = useGameStore(state => state.addReplaySnapshot);
  const isRecording = useGameStore(state => state.isRecording);
  const terminalVelocity = useGameStore(state => state.terminalVelocity);
  const movementWeight = useGameStore(state => state.movementWeight);

  const triggerFire = () => {
    if (gameState !== 'playing' || playerState !== 'active' || isInventoryOpen) return;

    if (useGameStore.getState().isInspecting) {
      useGameStore.setState({ isInspecting: false });
    }

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
    useGameStore.setState({ lastFireTime: now });
    if (!currentWeapon.isMelee) {
      consumeAmmo();
      recordShot();
    } else {
      meleeAttack();
    }

    // Self-healing for medkit
    if (currentWeapon.id === 'medkit') {
      useGameStore.getState().hitEnemy('player', currentWeapon.damage);
      addParticles(camera.position.toArray() as [number, number, number], '#00ff00');
      return;
    }

    // Recoil and Screen Shake
    if (gunVisualRef.current) {
      gunVisualRef.current.position.z += 0.2;
      gunVisualRef.current.rotation.x -= 0.1;
      recoilRef.current = 0.5;
    }
    
    // Apply camera kick
    camera.rotation.x += 0.02 * (currentWeapon.recoil || 1);
    camera.rotation.y += (Math.random() - 0.5) * 0.01 * (currentWeapon.recoil || 1);

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

  const triggerPing = (type: 'danger' | 'loot' | 'generic' = 'generic') => {
    if (gameState !== 'playing' || playerState !== 'active') return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const rayStart = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(0.1));
    const ray = new rapier.Ray(rayStart, raycaster.ray.direction);
    const hit = world.castRay(ray, 200, true);

    let pingPos: [number, number, number];
    let label = 'TARGET POINT';
    
    if (hit) {
      const hitPoint = ray.pointAt(hit.timeOfImpact);
      pingPos = [hitPoint.x, hitPoint.y, hitPoint.z];

      const collider = hit.collider;
      const rb = collider.parent();
      if (rb && rb.userData) {
        const userData = rb.userData as { name?: string };
        if (userData.name) {
          if (userData.name.startsWith('bot-')) {
            type = 'danger';
            label = `HOSTILE SPOTTED (${userData.name.toUpperCase()})`;
          } else if (userData.name.startsWith('block-')) {
            label = 'MARKED POSITION';
          } else {
            label = `OBJECT MARKER (${userData.name.toUpperCase()})`;
          }
        }
      }
    } else {
      const forwardVec = new THREE.Vector3();
      camera.getWorldDirection(forwardVec);
      const airPoint = camera.position.clone().add(forwardVec.multiplyScalar(40));
      pingPos = [airPoint.x, airPoint.y, airPoint.z];
      label = 'SECTOR MARKER';
    }

    useGameStore.getState().addPing(pingPos, type, label);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!(window as any).keys) (window as any).keys = {};
      (window as any).keys[key] = true;

      if (key === ' ') keys.current.space = true;
      if (key === 'shift') keys.current.shift = true;
      if (key === 'c') toggleThirdPerson();
      if (key === 'v') useGameStore.getState().setVehicleMenuOpen(true);
      if (key === 'control') keys.current.c = true;
      if (key in keys.current) keys.current[key as keyof typeof keys.current] = true;
      if (key === 'e') setInventoryOpen(!useGameStore.getState().isInventoryOpen);
      if (key === 'f') {
        useGameStore.getState().toggleFlashlight();
        try {
          soundService.playSFX('ui_click');
        } catch (err) {}
      }
      if (key === 'r') {
        useGameStore.setState({ isInspecting: false });
        reload();
      }
      
      if (key === 'b') useGameStore.getState().setBuildMode(!useGameStore.getState().isBuildMode);
      
      // Weapon Inspect
      if (key === 'x' || key === 'i') {
        const currentlyInspecting = useGameStore.getState().isInspecting;
        useGameStore.setState({ 
          isInspecting: !currentlyInspecting, 
          inspectStartTime: currentlyInspecting ? 0 : Date.now() 
        });
        try {
          soundService.playSFX('ui_click');
        } catch (err) {}
      }

      // Tactical Ping
      if (key === 'p' || key === 'g') {
        triggerPing();
      }
      
      // Hotbar keys
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        useGameStore.setState({ isInspecting: false });
        if (isBuildMode) {
          const blocks = ['stone', 'cobblestone', 'dirt', 'grass', 'sand', 'gravel', 'clay', 'bedrock', 'oak_log'] as const;
          if (idx < blocks.length) useGameStore.getState().setSelectedBlock(blocks[idx]);
        } else {
          if (idx < hotbar.length) switchWeapon(idx);
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
      if ((window as any).keys) (window as any).keys[key] = false;

      if (key === ' ') keys.current.space = false;
      if (key === 'shift') keys.current.shift = false;
      if (key === 'c' || key === 'control') keys.current.c = false;
      if (key in keys.current) keys.current[key as keyof typeof keys.current] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, playerState, camera, world, rapier, hitEnemy, addParticles, addLaser, currentWeapon, gl, isInventoryOpen, isBuildMode, selectedBlock]);

  const updatePlayerPosition = useGameStore(state => state.updatePlayerPosition);
  const jumpPads = useGameStore(state => state.jumpPads);

  const swayRef = useRef(new THREE.Vector3());
  const vaultTime = useRef(0);
  const isVaulting = useRef(false);

  useFrame((state, delta) => {
    if (!body.current || gameState !== 'playing') return;

    // Gamepad Handling
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];
    let gpX = 0;
    let gpZ = 0;
    let gpLookX = 0;
    let gpLookY = 0;
    let gpJump = false;
    let gpFire = false;
    let gpSprint = false;

    // Load custom calibration values from physical local storage
    const customSensitivity = typeof window !== 'undefined' ? (parseFloat(localStorage.getItem('neon_gamepad_sensitivity') || '1.5')) : 1.5;
    const customDeadzone = typeof window !== 'undefined' ? (parseFloat(localStorage.getItem('neon_gamepad_deadzone') || '0.15')) : 0.15;

    if (gp) {
      gpX = Math.abs(gp.axes[0]) > customDeadzone ? gp.axes[0] : 0;
      gpZ = Math.abs(gp.axes[1]) > customDeadzone ? -gp.axes[1] : 0;
      gpLookX = Math.abs(gp.axes[2]) > customDeadzone ? gp.axes[2] : 0;
      gpLookY = Math.abs(gp.axes[3]) > customDeadzone ? gp.axes[3] : 0;
      gpJump = gp.buttons[0].pressed; // A
      gpFire = gp.buttons[7].pressed; // RT
      gpSprint = gp.buttons[10].pressed; // L3

      if (gpFire) triggerFire();
      if (gp.buttons[4].pressed) { // L1
         const nextIdx = (currentWeaponIndex - 1 + hotbar.length) % hotbar.length;
         switchWeapon(nextIdx);
      }
      if (gp.buttons[5].pressed) { // R1
         const nextIdx = (currentWeaponIndex + 1) % hotbar.length;
         switchWeapon(nextIdx);
      }
    }

    const pos = body.current.translation();
    const rot = camera.rotation.y;
    setPlayerPosition([pos.x, pos.y, pos.z]);
    useGameStore.setState({ playerRotation: rot });

    // Draining flashlight/spotlight energy when active
    if (isFlashlightActive && gameState === 'playing' && playerState === 'active') {
      const drainAmount = 8 * delta; // 8 units per second
      if (energy <= 0) {
        if (useGameStore.getState().isFlashlightActive) {
          useGameStore.getState().toggleFlashlight();
          useGameStore.getState().addEvent('🔋 FLASHLIGHT OUT OF BATTERY ENERGY!');
        }
      } else {
        updateStats({ energy: Math.max(0, energy - drainAmount) });
      }
    }

    // Portal distance check and next level transition trigger
    if (portalPosition && gameState === 'playing' && playerState === 'active') {
      const dist = Math.hypot(pos.x - portalPosition[0], pos.z - portalPosition[2]);
      if (dist < 2.5) {
        useGameStore.getState().nextLevel();
      }
    }

    // Recording Logic
    if (isRecording) {
      addReplaySnapshot({
        timestamp: Date.now(),
        players: {
          ['me']: {
            position: [pos.x, pos.y, pos.z],
            rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z],
            animation: useGameStore.getState().playerAnimation,
            health: health,
            weaponIndex: currentWeaponIndex
          }
        },
        enemies: [],
        vehicles: {},
        environment: useGameStore.getState().environment,
        events: []
      });
    }

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

    const moveZ = (k.w ? 1 : 0) - (k.s ? 1 : 0) + (isMobile ? mobileControls.move.y : gpZ);
    const moveX = (k.d ? 1 : 0) - (k.a ? 1 : 0) + (isMobile ? mobileControls.move.x : gpX);

    // Look Handling (Gamepad)
    if (gp) {
      const sensitivity = 2.0 * mouseSensitivity * customSensitivity;
      camera.rotation.y -= gpLookX * sensitivity * delta;
      camera.rotation.x -= gpLookY * sensitivity * delta;
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    }

    // Energy consumption
    const isSprinting = (isMobile && mobileControls.sprint) || gpSprint || (!isMobile && keys.current.w && keys.current.shift && energy > 0);
    if (isSprinting && (Math.abs(moveX) > 0.1 || Math.abs(moveZ) > 0.1)) {
      updateStats({ energy: Math.max(0, energy - 15 * delta) });
    }

    // Class modifiers
    const classSpeedMod = playerClass === 'spellblade' ? 1.2 : (playerClass === 'alchemist' ? 1.1 : 1.0);
    const streakSpeedMod = activeStreakPower === 'OVERCLOCKED' ? 1.4 : 1.0;
    const timeWarpMod = isTimeWarpActive ? 1.2 : 1.0; // Player is faster during time warp
    const glitchMod = isGlitch ? 1.15 : 1.0;

    const isSprintingActual = isSprinting && energy > 0;
    const currentSpeed = (isSprintingActual ? sprintSpeed : SPEED) * classSpeedMod * streakSpeedMod * timeWarpMod * glitchMod * dimStats.speedMultiplier * moddedSpeedMultiplier;

    const targetVelocity = new THREE.Vector3();
    targetVelocity.addScaledVector(forward, moveZ);
    targetVelocity.addScaledVector(right, moveX);
    
    if (targetVelocity.lengthSq() > 0) {
      targetVelocity.normalize().multiplyScalar(currentSpeed);
    }

    // Advanced Physics: Acceleration/Deceleration (Controller A Alpha logic)
    const currentVel = new THREE.Vector3(velocity.x, 0, velocity.z);
    
    // Controller A Alpha: Higher air control and momentum preservation
    const airControl = isGrounded.current ? 1.0 : 0.4;
    const accelSpeed = isGrounded.current ? movementWeight : 0.15;
    
    currentVel.lerp(targetVelocity, accelSpeed * airControl);

    // Lean logic for "Alpha" feel
    if (gunGroupRef.current) {
      const targetLean = moveX * -0.1;
      const targetTilt = moveZ * 0.05;
      gunGroupRef.current.rotation.z = THREE.MathUtils.lerp(gunGroupRef.current.rotation.z, targetLean, 0.1);
      gunGroupRef.current.rotation.x = THREE.MathUtils.lerp(gunGroupRef.current.rotation.x, targetTilt, 0.1);
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
    } else {
      // First Person Camera
      camera.position.set(pos.x, pos.y + 0.8, pos.z); // Eye level
    }

    // Character Animations (Procedural)
    const isMoving = Math.abs(moveX) > 0.1 || Math.abs(moveZ) > 0.1;
    const currentIsPlayerMoving = isMoving || !isGrounded.current;
    if (useGameStore.getState().isPlayerMoving !== currentIsPlayerMoving) {
      useGameStore.setState({ isPlayerMoving: currentIsPlayerMoving });
    }
    if (!isGrounded.current) {
      useGameStore.getState().setPlayerAnimation('jump');
    } else if (isMoving) {
      useGameStore.getState().setPlayerAnimation('run');
    } else {
      useGameStore.getState().setPlayerAnimation('idle');
    }

    // Apply bobbing to gunGroupRef
    if (gunGroupRef.current) {
      const t = state.clock.elapsedTime * 10;
      if (useGameStore.getState().playerAnimation === 'run') {
        gunGroupRef.current.position.y = -0.1 + Math.sin(t) * 0.05;
        gunGroupRef.current.position.x = 0.3 + Math.cos(t * 0.5) * 0.02;
      } else {
        gunGroupRef.current.position.y = -0.1 + Math.sin(t * 0.2) * 0.01;
      }
    }

    // Ground check
    const rayStart = new THREE.Vector3(pos.x, pos.y + 0.1, pos.z);
    const rayDir = new THREE.Vector3(0, -1, 0);
    const ray = new rapier.Ray(rayStart, rayDir);
    const hit = world.castRay(ray, 0.5, true);
    const wasGrounded = isGrounded.current;
    isGrounded.current = !!hit;
    
    if (isGrounded.current) {
      jumpCount.current = 0;
    }

    const gravityValue = dimStats.gravity * moddedGravityMultiplier;
    
    // Jump / Double Jump
    let jumpVel = velocity.y;
    const now = Date.now();
    if ((k.space || (isMobile && mobileControls.jump) || gpJump) && now - lastJumpTime.current > 250 && energy >= 10) {
      if (isGrounded.current) {
        const classJumpMod = playerClass === 'mage' ? 1.2 : 1.0;
        jumpVel = Math.sqrt(jumpHeight * classJumpMod * 2 * Math.abs(gravityValue));
        jumpCount.current = 1;
        lastJumpTime.current = now;
        updateStats({ energy: energy - 10 });
        soundService.playSFX('jump');
      } else if (jumpCount.current === 1) {
        // Double Jump
        jumpVel = Math.sqrt(jumpHeight * 1.5 * 2 * Math.abs(gravityValue));
        jumpCount.current = 2;
        lastJumpTime.current = now;
        updateStats({ energy: energy - 15 });
        addParticles([pos.x, pos.y, pos.z], '#ffffff');
        soundService.playSFX('jump');
      }
    }

    // Advanced Gravity Logic: Apply custom acceleration and terminal velocity
    if (!isGrounded.current) {
      jumpVel += gravityValue * delta;
      if (jumpVel < -terminalVelocity) jumpVel = -terminalVelocity;
    }

    // Vaulting
    if (!isGrounded.current && !isVaulting.current && k.w && energy >= 20) {
      const vaultRay = new rapier.Ray(new THREE.Vector3(pos.x, pos.y + 0.2, pos.z), forward);
      const vaultHit = world.castRay(vaultRay, 1.0, true);
      
      if (vaultHit) {
        // Check if there's space above
        const clearRay = new rapier.Ray(new THREE.Vector3(pos.x, pos.y + 1.5, pos.z), forward);
        const clearHit = world.castRay(clearRay, 1.0, true);
        
        if (!clearHit) {
          isVaulting.current = true;
          vaultTime.current = Date.now();
          body.current.setLinvel({ x: velocity.x, y: 8, z: velocity.z }, true);
          updateStats({ energy: energy - 20 });
          soundService.playSFX('jump');
          useGameStore.getState().addEvent('VAULTING!');
        }
      }
    }
    
    if (isVaulting.current && Date.now() - vaultTime.current > 500) {
      isVaulting.current = false;
    }

    // Wall Running
    let isWallRunning = false;
    let wallSide: 'left' | 'right' | null = null;

    if (!isGrounded.current && k.w && energy > 0) {
      const leftRay = new rapier.Ray(new THREE.Vector3(pos.x, pos.y + 0.5, pos.z), right.clone().multiplyScalar(-1));
      const rightRay = new rapier.Ray(new THREE.Vector3(pos.x, pos.y + 0.5, pos.z), right);
      
      const leftHit = world.castRay(leftRay, 0.8, true);
      const rightHit = world.castRay(rightRay, 0.8, true);

      if (leftHit) {
        isWallRunning = true;
        wallSide = 'left';
      } else if (rightHit) {
        isWallRunning = true;
        wallSide = 'right';
      }
    }

    if (isWallRunning !== isWallRunningStore || wallSide !== wallRunSideStore) {
      setWallRunning(isWallRunning, wallSide);
    }

    // Stamina/Energy & Overload Recovery
    if (!k.shift && energy < 100) {
      updateStats({ energy: energy + delta * 5 });
    }
    if (overload > 0) {
      updateStats({ overload: Math.max(0, overload - delta * 3) });
    }

    if (isWallRunning) {
      jumpVel = Math.max(jumpVel, 0.5); // Counter gravity slightly
      currentVel.multiplyScalar(1.3); // Speed boost
      updateStats({ energy: Math.max(0, energy - 10 * delta) });
      
      // Tilt camera
      const targetTilt = wallSide === 'left' ? -0.15 : 0.15;
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetTilt, delta * 10);
    } else {
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, delta * 10);
    }

    // Sliding Logic
    if (k.c && isGrounded.current && !isSliding.current && k.shift && (Math.abs(moveX) > 0.1 || Math.abs(moveZ) > 0.1)) {
      isSliding.current = true;
      slideTime.current = now;
      // soundService.playSFX('slide'); // Slide SFX not implemented yet, using jump for now or skipping
    }
    
    if (isSliding.current) {
      const elapsed = now - slideTime.current;
      if (elapsed > 800 || !isGrounded.current) {
        isSliding.current = false;
      } else {
        const slideFactor = 1.0 - (elapsed / 800);
        currentVel.multiplyScalar(1.5 + slideFactor);
        camera.position.y -= 0.5; // Lower camera
      }
    }

    // Dash - V.I.J.O ENERGY DASH
    if (k.shift && (energy >= 20 || overload > 85) && now - lastDashTime.current > 1000) {
      const dashDir = new THREE.Vector3();
      dashDir.addScaledVector(forward, moveZ);
      dashDir.addScaledVector(right, moveX);
      if (dashDir.lengthSq() === 0) dashDir.copy(forward);
      dashDir.normalize().multiplyScalar(35);
      
      body.current!.setLinvel({ x: dashDir.x, y: velocity.y, z: dashDir.z }, true);
      lastDashTime.current = now;
      updateStats({ energy: Math.max(0, energy - 20), overload: Math.min(100, overload + 15) });
      addParticles([pos.x, pos.y, pos.z], overload > 85 ? '#ffffff' : '#00ffcc', 30);
      soundService.playSFX('dash_vijo');
    } else {
      body.current!.setLinvel({ x: currentVel.x, y: jumpVel, z: currentVel.z }, true);
    }

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

    // ============== PORT ELIZABETH WEATHER SYMPTOMS ==============
    const peWeather = useGameStore.getState().environment.peWeather;
    if (peWeather && playerState === 'active') {
      const cond = peWeather.condition;
      
      // 1. HOT -> screen is wiggly (ambient sin wave wobbly offsets)
      if (cond === 'hot') {
        const t = state.clock.elapsedTime * 4.5;
        camera.position.x += Math.sin(t) * 0.045;
        camera.position.y += Math.cos(t * 1.5) * 0.035;
      }
      
      // 2. COLD -> shiver (high frequency screen vibrating shakes)
      if (cond === 'cold') {
        const shiverFactor = Math.sin(state.clock.elapsedTime * 65.0) * 0.015;
        camera.position.x += shiverFactor;
        camera.position.y += shiverFactor;
      }
      
      // 3. RAINY -> forces you to look down (gently slide pitch/rotation downwards)
      if (cond === 'rainy') {
        // We look down gently to protect eyes
        if (camera.rotation.x > -0.6) {
          camera.rotation.x -= 0.0035;
        }
      }
      
      // 4. HAIL -> Find shelter or take ticking damage!
      if (cond === 'hail') {
        // Cast ray straight up from player's head position (pos.y + 1)
        const currentPos = body.current!.translation();
        const rayStart = new rapier.Ray(
          { x: currentPos.x, y: currentPos.y + 1.2, z: currentPos.z },
          { x: 0, y: 1, z: 0 }
        );
        // Cast up with max dist 150
        const hit = world.castRay(rayStart, 150, true);
        const isSheltered = hit !== null && hit.timeOfImpact < 50;

        if (!isSheltered) {
          const currentTime = Date.now();
          if (currentTime - lastHailDamageTime.current > 1400) {
            lastHailDamageTime.current = currentTime;
            useGameStore.getState().takeDamage(3);
            useGameStore.getState().addEvent('⚠️ HAILSTORM BLASTING IN PE: TAKE SHELTER UNDER ROOFS!');
            soundService.playSFX('hit');
          }
        }
      }
    }
    // =============================================================

    // Weapon Sway
    const swayAmount = 0.05;
    const swaySpeed = 2;
    const targetSway = new THREE.Vector3(
      Math.sin(state.clock.elapsedTime * swaySpeed) * swayAmount * (velocity.x / SPEED),
      Math.cos(state.clock.elapsedTime * swaySpeed * 2) * swayAmount * (velocity.z / SPEED),
      0
    );
    swayRef.current.lerp(targetSway, 0.1);

    // Sync gun to camera
    if (gunGroupRef.current) {
      gunGroupRef.current.position.copy(camera.position).add(swayRef.current.clone().applyQuaternion(camera.quaternion));
      gunGroupRef.current.quaternion.copy(camera.quaternion);
    }

    // Sync flashlight/spotlight to camera
    if (flashlightGroupRef.current) {
      flashlightGroupRef.current.position.copy(camera.position);
      flashlightGroupRef.current.quaternion.copy(camera.quaternion);
    }

    // Handle spotlight flickering based on instability
    if (isFlashlightActive && instability > 15) {
      const flickerChance = (instability / 100) * 0.22;
      isFlickeringRef.current = Math.random() < flickerChance;
    } else {
      isFlickeringRef.current = false;
    }

    if (spotlightRef.current) {
      spotlightRef.current.intensity = isFlickeringRef.current ? 0.3 : 11.5;
    }
    
    // Recover recoil and inspect animations
    if (gunVisualRef.current) {
      const isInspecting = useGameStore.getState().isInspecting;
      const inspectStartTime = useGameStore.getState().inspectStartTime || 0;

      if (isInspecting) {
        const elapsed = (Date.now() - inspectStartTime) / 1000;
        
        // Auto stop after 4.5 seconds
        if (elapsed > 4.5) {
          useGameStore.setState({ isInspecting: false });
        } else {
          // Play synchronized tactical synthesizer sounds based on the phase
          if (elapsed >= 0 && elapsed < 0.15 && !inspectAudioPhases.current.start) {
            playInspectSound('start');
            inspectAudioPhases.current.start = true;
          }
          if (elapsed >= 1.5 && elapsed < 1.65 && !inspectAudioPhases.current.mid) {
            playInspectSound('mid');
            inspectAudioPhases.current.mid = true;
          }
          if (elapsed >= 3.0 && elapsed < 3.15 && !inspectAudioPhases.current.end) {
            playInspectSound('end');
            inspectAudioPhases.current.end = true;
          }

          // Positional Phase animations:
          let targetX = 0.6;
          let targetY = -0.4;
          let targetZ = -0.8;
          let targetRotX = 0;
          let targetRotY = 0;
          let targetRotZ = 0;

          if (elapsed < 1.2) {
            // Phase 1: Pull in & raise to eye level (rolling to show receiver profile)
            const t = elapsed / 1.2;
            const ease = Math.sin(t * Math.PI / 2);
            targetX = THREE.MathUtils.lerp(0.6, 0.05, ease);
            targetY = THREE.MathUtils.lerp(-0.4, -0.15, ease);
            targetZ = THREE.MathUtils.lerp(-0.8, -0.45, ease);

            targetRotX = THREE.MathUtils.lerp(0, 0.35, ease);
            targetRotY = THREE.MathUtils.lerp(0, -0.75, ease);
            targetRotZ = THREE.MathUtils.lerp(0, 0.6, ease);
          } else if (elapsed < 2.7) {
            // Phase 2: Tilt down/under-barrel & roll to inspect magazine/ejection port
            const t = (elapsed - 1.2) / 1.5;
            const ease = Math.sin(t * Math.PI / 2);
            targetX = THREE.MathUtils.lerp(0.05, -0.1, ease);
            targetY = THREE.MathUtils.lerp(-0.15, -0.1, ease);
            targetZ = THREE.MathUtils.lerp(-0.45, -0.38, ease);

            targetRotX = THREE.MathUtils.lerp(0.35, -0.4, ease);
            targetRotY = THREE.MathUtils.lerp(-0.75, 0.8, ease);
            targetRotZ = THREE.MathUtils.lerp(0.6, -0.4, ease);
          } else if (elapsed < 3.7) {
            // Phase 3: Detailed scanning micro-bob and subtle roll
            const t = (elapsed - 2.7) / 1.0;
            const ease = Math.sin(t * Math.PI / 2);
            const bobY = Math.sin(elapsed * 4) * 0.015;
            const bobX = Math.cos(elapsed * 4) * 0.01;
            targetX = THREE.MathUtils.lerp(-0.1, 0.0, ease) + bobX;
            targetY = THREE.MathUtils.lerp(-0.1, -0.05, ease) + bobY;
            targetZ = THREE.MathUtils.lerp(-0.38, -0.32, ease);

            targetRotX = THREE.MathUtils.lerp(-0.4, 0.1, ease) + Math.sin(elapsed * 3) * 0.05;
            targetRotY = THREE.MathUtils.lerp(0.8, -0.2, ease) + Math.cos(elapsed * 3) * 0.05;
            targetRotZ = THREE.MathUtils.lerp(-0.4, 0.15, ease);
          } else {
            // Phase 4: Recover & snap back to regular hip position
            const t = (elapsed - 3.7) / 0.8;
            const ease = Math.sin(t * Math.PI / 2);
            targetX = THREE.MathUtils.lerp(0.0, 0.6, ease);
            targetY = THREE.MathUtils.lerp(-0.05, -0.4, ease);
            targetZ = THREE.MathUtils.lerp(-0.32, -0.8, ease);

            targetRotX = THREE.MathUtils.lerp(0.1, 0, ease);
            targetRotY = THREE.MathUtils.lerp(-0.2, 0, ease);
            targetRotZ = THREE.MathUtils.lerp(0.15, 0, ease);
          }

          // Apply lerped values to the weapon
          gunVisualRef.current.position.x = THREE.MathUtils.lerp(gunVisualRef.current.position.x, targetX, delta * 12);
          gunVisualRef.current.position.y = THREE.MathUtils.lerp(gunVisualRef.current.position.y, targetY, delta * 12);
          gunVisualRef.current.position.z = THREE.MathUtils.lerp(gunVisualRef.current.position.z, targetZ, delta * 12);

          gunVisualRef.current.rotation.x = THREE.MathUtils.lerp(gunVisualRef.current.rotation.x, targetRotX, delta * 12);
          gunVisualRef.current.rotation.y = THREE.MathUtils.lerp(gunVisualRef.current.rotation.y, targetRotY, delta * 12);
          gunVisualRef.current.rotation.z = THREE.MathUtils.lerp(gunVisualRef.current.rotation.z, targetRotZ, delta * 12);
        }
      } else {
        inspectAudioPhases.current = { start: false, mid: false, end: false };
        if (currentWeapon.isMelee && isAttacking) {
        // Swing animation
        gunVisualRef.current.position.x = THREE.MathUtils.lerp(gunVisualRef.current.position.x, 0.6, delta * 20);
        gunVisualRef.current.position.y = THREE.MathUtils.lerp(gunVisualRef.current.position.y, -0.4, delta * 20);
        gunVisualRef.current.position.z = THREE.MathUtils.lerp(gunVisualRef.current.position.z, 0.2, delta * 20);
        gunVisualRef.current.rotation.y = THREE.MathUtils.lerp(gunVisualRef.current.rotation.y, Math.PI / 2, delta * 20);
        gunVisualRef.current.rotation.x = THREE.MathUtils.lerp(gunVisualRef.current.rotation.x, -Math.PI / 4, delta * 20);
        gunVisualRef.current.rotation.z = THREE.MathUtils.lerp(gunVisualRef.current.rotation.z, 0, delta * 20);
      } else {
        // Return to standard first-person position
        gunVisualRef.current.position.x = THREE.MathUtils.lerp(gunVisualRef.current.position.x, 0.6, delta * 15);
        gunVisualRef.current.position.y = THREE.MathUtils.lerp(gunVisualRef.current.position.y, -0.4, delta * 15);
        gunVisualRef.current.position.z = THREE.MathUtils.lerp(gunVisualRef.current.position.z, -0.8, delta * 15);
        gunVisualRef.current.rotation.y = THREE.MathUtils.lerp(gunVisualRef.current.rotation.y, 0, delta * 15);
        gunVisualRef.current.rotation.x = THREE.MathUtils.lerp(gunVisualRef.current.rotation.x, 0, delta * 15);
        gunVisualRef.current.rotation.z = THREE.MathUtils.lerp(gunVisualRef.current.rotation.z, 0, delta * 15);
      }
    }
  }

    // Targeting logic
    const targetingRaycaster = new THREE.Raycaster();
    targetingRaycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const targetingRayStart = camera.position.clone().add(targetingRaycaster.ray.direction.clone().multiplyScalar(0.8));
    const targetingRay = new rapier.Ray(targetingRayStart, targetingRaycaster.ray.direction);
    const targetingHit = world.castRay(targetingRay, 100, true);

    if (targetingHit) {
      const collider = targetingHit.collider;
      const rb = collider.parent();
      if (rb && rb.userData) {
        const userData = rb.userData as { name?: string };
        if (userData.name && (userData.name.startsWith('bot-') || (userData.name !== 'player' && !userData.name.startsWith('obstacle') && !userData.name.startsWith('wall') && userData.name !== 'floor' && userData.name !== 'ceiling'))) {
          if (useGameStore.getState().targetedEnemyId !== userData.name) {
            useGameStore.getState().setTargetedEnemyId(userData.name);
          }
        } else {
          if (useGameStore.getState().targetedEnemyId !== null) {
            useGameStore.getState().setTargetedEnemyId(null);
          }
        }
      } else {
        if (useGameStore.getState().targetedEnemyId !== null) {
          useGameStore.getState().setTargetedEnemyId(null);
        }
      }
    } else {
      if (useGameStore.getState().targetedEnemyId !== null) {
        useGameStore.getState().setTargetedEnemyId(null);
      }
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
    if (now - lastEmitTime.current > 50) {
      const isDashing = now - lastDashTime.current < 200;
      updatePlayerPosition([pos.x, pos.y, pos.z], camera.rotation.y, isDashing);
      // Note: updatePlayerPosition in store uses get() to find isSliding, 
      // but we should ensure it's updated in the store if it's not already.
      if (useGameStore.getState().isSliding !== isSliding.current) {
        useGameStore.setState({ isSliding: isSliding.current });
      }
      lastEmitTime.current = now;
    }
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button === 0) {
        triggerFire();
      } else if (e.button === 1) {
        e.preventDefault();
        triggerPing();
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

  useEffect(() => {
    if (body.current) {
      body.current.setTranslation({ x: 0, y: 1.6, z: 0 }, true);
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [mapSeed]);

  const color = playerState === 'disabled' ? '#444' : 
    (isGlitch ? '#ff0000' : 
    (team === 'amber' ? '#f59e0b' : 
    (team === 'blue' ? '#3b82f6' : '#f59e0b')));

  const armMaterial = (
    <meshStandardMaterial 
      color={
        isGlitch ? '#ff0000' :
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
        isGlitch ? '#ff0000' :
        selectedSkin === 'gold' ? '#ffd700' : 
        selectedSkin === 'ruby' ? '#660000' :
        selectedSkin === 'emerald' ? '#00ff44' :
        selectedSkin === 'diamond' ? '#ffffff' :
        selectedSkin === 'void' ? '#000000' :
        color
      }
      emissiveIntensity={
        playerState === 'disabled' ? 0 : 
        (isGlitch ? 2 :
        (selectedSkin === 'neon' ? 0.8 : 
         selectedSkin === 'emerald' ? 1.2 :
         selectedSkin === 'void' ? 0 :
         0.4))
      }
      transparent={selectedSkin === 'stealth' || selectedSkin === 'diamond' || isGlitch}
      opacity={isGlitch ? 0.8 : (selectedSkin === 'stealth' ? 0.4 : selectedSkin === 'diamond' ? 0.6 : 1)}
    />
  );

  return (
    <>
      {!isMobile && gameState === 'playing' && (
        <PointerLockControls 
          onLock={() => useGameStore.getState().setPointerLocked(true)}
          onUnlock={() => useGameStore.getState().setPointerLocked(false)}
          pointerSpeed={mouseSensitivity}
        />
      )}
      <RigidBody
        ref={body}
        colliders={false}
        mass={1}
        type="dynamic"
        position={[0, 10, 0]}
        enabledRotations={[false, false, false]}
        userData={{ name: 'player' }}
        friction={0}
        onCollisionEnter={({ other }) => {
          if (useGameStore.getState().gameMode !== 'infection') return;
          
          const otherName = other.rigidBodyObject?.userData?.name;
          if (!otherName) return;

          const isMeGlitch = useGameStore.getState().isGlitch;
          
          // If I am a glitch, I infect others
          if (isMeGlitch) {
            if (otherName.startsWith('bot-') || (otherName !== 'player' && !otherName.startsWith('obstacle'))) {
              infectPlayer(otherName);
            }
          } else {
            // If I am a human, I check if the other is a glitch
            const otherPlayer = useGameStore.getState().otherPlayers[otherName];
            const otherEnemy = useGameStore.getState().enemies.find(e => e.id === otherName);
            
            if ((otherPlayer && otherPlayer.isGlitch) || (otherEnemy && otherEnemy.isGlitch)) {
              useGameStore.getState().hitPlayer();
            }
          }
        }}
      >
        <CapsuleCollider args={[0.5, 0.2]} position={[0, 0.7, 0]} friction={0} />
        
        {/* Hidden detection helper for hallway entity raycasting */}
        <mesh name="player" visible={false} position={[0, 0.7, 0]}>
          <capsuleGeometry args={[0.5, 0.4]} />
        </mesh>
        
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
              isGlitch={isGlitch}
              infectionTimer={infectionLevel}
              activeStreakPower={activeStreakPower}
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
            {currentWeapon.id === 'sword' ? (
              <group rotation={[0, -Math.PI / 2, 0]}>
                {/* Blade */}
                <mesh position={[0.4, 0, 0]} castShadow>
                  <boxGeometry args={[0.8, 0.05, 0.1]} />
                  <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
                </mesh>
                {/* Handle */}
                <mesh position={[-0.1, 0, 0]} castShadow>
                  <boxGeometry args={[0.3, 0.08, 0.08]} />
                  <meshStandardMaterial color="#222" />
                </mesh>
                {/* Guard */}
                <mesh position={[0.05, 0, 0]} castShadow>
                  <boxGeometry args={[0.05, 0.3, 0.15]} />
                  <meshStandardMaterial color="#444" />
                </mesh>
              </group>
            ) : currentWeapon.id === 'axe' ? (
              <group rotation={[0, -Math.PI / 2, 0]}>
                {/* Handle */}
                <mesh position={[0, 0, 0]} castShadow>
                  <boxGeometry args={[0.8, 0.05, 0.05]} />
                  <meshStandardMaterial color="#4d2600" />
                </mesh>
                {/* Axe Head */}
                <mesh position={[0.3, 0.15, 0]} castShadow>
                  <boxGeometry args={[0.3, 0.4, 0.05]} />
                  <meshStandardMaterial color="#888" metalness={0.9} />
                </mesh>
              </group>
            ) : currentWeapon.id === 'scythe' ? (
              <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.1, 1.2, 0.1]} />
                  <meshStandardMaterial color="#888" emissive="#ff0000" emissiveIntensity={1} />
                </mesh>
                <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
                  <boxGeometry args={[0.6, 0.1, 0.05]} />
                  <meshStandardMaterial color="#333" />
                </mesh>
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
            ) : currentWeapon.id === 'knife' ? (
              <group rotation={[0, -Math.PI / 2, 0]}>
                {/* Blade */}
                <mesh position={[0.15, 0, 0]} castShadow>
                  <boxGeometry args={[0.3, 0.03, 0.05]} />
                  <meshStandardMaterial color="#aaa" metalness={1} />
                </mesh>
                {/* Handle */}
                <mesh position={[-0.05, 0, 0]} castShadow>
                  <boxGeometry args={[0.15, 0.05, 0.05]} />
                  <meshStandardMaterial color="#111" />
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
      {/* Spotlight / Flashlight beam */}
      {isFlashlightActive && (
        <group ref={flashlightGroupRef}>
          {spotlightTargetRef.current && <primitive object={spotlightTargetRef.current} />}
          <spotLight
            ref={spotlightRef}
            castShadow
            intensity={11.5}
            distance={40}
            angle={Math.PI / 4}
            penumbra={0.7}
            decay={1.5}
            color="#fef08a"
            position={[0.25, -0.2, -0.2]}
            target={spotlightTargetRef.current || undefined}
          />
        </group>
      )}

      {!isMobile && gameState === 'playing' && !useGameStore.getState().isPointerLocked && (
        <Html center zIndexRange={[100, 200]}>
          <div className="flex items-center justify-center pointer-events-none whitespace-nowrap">
            <div className="bg-zinc-950/80 border border-amber-400/50 p-8 rounded-3xl backdrop-blur-md text-center w-80">
              <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2">SYSTEM READY</h2>
              <p className="text-amber-400 font-bold uppercase tracking-widest text-xs animate-pulse">Click anywhere to initialize controls</p>
            </div>
          </div>
        </Html>
      )}
    </>
  );
}
