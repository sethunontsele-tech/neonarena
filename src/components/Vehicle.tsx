import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, VehicleData } from '../store';
import { TankModel } from './RealisticVehicles/TankModel';
import { FighterJetModel } from './RealisticVehicles/FighterJetModel';
import { AttackHelicopterModel } from './RealisticVehicles/AttackHelicopterModel';
import { ArmoredIFVModel } from './RealisticVehicles/ArmoredIFVModel';
import { NavalWarshipModel } from './RealisticVehicles/NavalWarshipModel';
import { CyberSupercarModel } from './RealisticVehicles/CyberSupercarModel';
import { CombatMechModel } from './RealisticVehicles/CombatMechModel';
import { CombatMotorbikeModel } from './RealisticVehicles/CombatMotorbikeModel';
import { soundService } from '../services/soundService';

export const Vehicle: React.FC<{ data: VehicleData; id?: string }> = ({ data, id: propId }) => {
  const vehicleId = propId || data.id;
  const rb = useRef<any>(null);
  const currentVehicleId = useGameStore(state => state.currentVehicleId);
  const isDriving = currentVehicleId === vehicleId;
  const enterVehicle = useGameStore(state => state.enterVehicle);
  const exitVehicle = useGameStore(state => state.exitVehicle);
  const fireVehicleWeapon = useGameStore(state => state.fireVehicleWeapon);
  const deployVehicleFlares = useGameStore(state => state.deployVehicleFlares);
  const repairVehicle = useGameStore(state => state.repairVehicle);

  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [isBoosting, setIsBoosting] = useState(false);
  const [turretYaw, setTurretYaw] = useState(0);
  const [pitchAngle, setPitchAngle] = useState(0);
  const [rollAngle, setRollAngle] = useState(0);
  const [steeringAngle, setSteeringAngle] = useState(0);
  const [flaresActive, setFlaresActive] = useState(false);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const { camera } = useThree();

  const healthPercent = (data.health / data.maxHealth) * 100;

  // Keyboard controls listener
  useEffect(() => {
    if (!isDriving) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;

      // Exit vehicle
      if (k === 'e') {
        exitVehicle();
        soundService.playSFX('ui_click');
      }

      // Boost / Afterburner
      if (e.key === 'Shift') {
        setIsBoosting(true);
      }

      // Countermeasures Flares
      if (k === 'x') {
        deployVehicleFlares(vehicleId);
        soundService.playSFX('explosion');
        setFlaresActive(true);
        setTimeout(() => setFlaresActive(false), 2000);
      }

      // Field Repair
      if (k === 'r') {
        repairVehicle(vehicleId, 300);
        soundService.playSFX('powerup');
      }

      // Horn / Battle Siren
      if (k === 'h') {
        soundService.playSFX('shoot');
        useGameStore.getState().addEvent('📢 COMBAT VEHICLE SIREN SOUNDED');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = false;
      if (e.key === 'Shift') {
        setIsBoosting(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // Primary weapon
        fireVehicleWeapon(vehicleId, false);
        soundService.playSFX('shoot');
      } else if (e.button === 2) {
        // Secondary weapon (missiles)
        fireVehicleWeapon(vehicleId, true);
        soundService.playSFX('shoot');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isDriving, vehicleId, exitVehicle, deployVehicleFlares, repairVehicle, fireVehicleWeapon]);

  // Frame physics loop
  useFrame((_, delta) => {
    if (!rb.current) return;

    if (!isDriving) {
      // Idle physics
      return;
    }

    const keys = keysPressed.current;
    const forwardInput = (keys['w'] || keys['arrowup'] ? 1 : 0) - (keys['s'] || keys['arrowdown'] ? 1 : 0);
    const turnInput = (keys['d'] || keys['arrowright'] ? -1 : 0) + (keys['a'] || keys['arrowleft'] ? 1 : 0);

    const boostMult = isBoosting ? 2.0 : 1.0;

    // Type-specific realistic physics tuning
    let accelForce = 60 * boostMult;
    let turnTorque = 18;

    if (data.type === 'tank') {
      accelForce = 85 * boostMult;
      turnTorque = 22; // Tank neutral pivot steer
    } else if (data.type === 'jet') {
      accelForce = 160 * boostMult;
      turnTorque = 12;
    } else if (data.type === 'helicopter') {
      accelForce = 70 * boostMult;
      turnTorque = 14;
    } else if (data.type === 'apc') {
      accelForce = 75 * boostMult;
      turnTorque = 16;
    } else if (data.type === 'gunboat') {
      accelForce = 50 * boostMult;
      turnTorque = 10;
    } else if (data.type === 'mech') {
      accelForce = 50 * boostMult;
      turnTorque = 15;
    }

    const rot = rb.current.rotation();
    const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w));

    // Calculate heading vector
    const forwardVec = new THREE.Vector3(0, 0, -1).applyEuler(euler);
    const impulse = forwardVec.multiplyScalar(forwardInput * accelForce * delta * 70);

    // Aircraft Vertical lift & pitch simulation
    if (data.type === 'jet') {
      const pitchInput = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
      setPitchAngle(pitchInput);
      setRollAngle(turnInput);
      impulse.y += (keys[' '] ? 30 : keys['c'] ? -20 : 5) * delta * 70;
    } else if (data.type === 'helicopter') {
      const liftInput = (keys[' '] ? 1 : 0) - (keys['c'] || keys['shift'] ? 1 : 0);
      impulse.y += liftInput * 35 * delta * 70;
      setPitchAngle(forwardInput * 0.3);
      setRollAngle(turnInput * 0.25);
    } else {
      setSteeringAngle(turnInput * 0.4);
    }

    rb.current.applyImpulse(impulse, true);

    // Apply turning torque
    const torque = new THREE.Vector3(0, turnInput * turnTorque * delta * 70, 0);
    rb.current.applyTorqueImpulse(torque, true);

    // Damping and speed sync
    const pos = rb.current.translation();
    const vel = rb.current.linvel();
    const speedMag = Math.hypot(vel.x, vel.z);
    setCurrentSpeed(speedMag);

    // Synchronize vehicle position in store
    useGameStore.getState().updateVehicle(vehicleId, {
      position: [pos.x, pos.y, pos.z],
      rotation: [euler.x, euler.y, euler.z],
      speed: speedMag
    });

    // Camera follow when driving
    if (isDriving) {
      useGameStore.getState().setPlayerPosition([pos.x, pos.y + 1.5, pos.z]);

      // Third person chase camera smoothing
      const targetCamPos = new THREE.Vector3(
        pos.x - forwardVec.x * (data.type === 'jet' ? 12 : 7),
        pos.y + (data.type === 'helicopter' ? 5 : 3.5),
        pos.z - forwardVec.z * (data.type === 'jet' ? 12 : 7)
      );
      camera.position.lerp(targetCamPos, 0.1);
      camera.lookAt(pos.x, pos.y + 1.2, pos.z);
    }
  });

  // Calculate collider bounding dimensions
  const colliderSize: [number, number, number] =
    data.type === 'tank' ? [2.0, 1.2, 3.2] :
    data.type === 'jet' ? [3.8, 1.2, 4.5] :
    data.type === 'helicopter' ? [2.5, 2.0, 4.2] :
    data.type === 'apc' ? [1.8, 1.4, 3.5] :
    data.type === 'gunboat' ? [2.2, 1.6, 5.0] :
    data.type === 'mech' ? [1.6, 2.5, 1.6] :
    data.type === 'motorbike' ? [0.6, 0.9, 1.5] :
    [1.5, 0.8, 2.5]; // Car / Speeder

  return (
    <RigidBody
      ref={rb}
      position={data.position}
      type={isDriving ? 'dynamic' : 'fixed'}
      colliders={false}
      linearDamping={data.type === 'jet' || data.type === 'helicopter' ? 0.75 : 0.6}
      angularDamping={0.85}
      userData={{ name: `vehicle-${vehicleId}` }}
    >
      <CuboidCollider args={colliderSize} />

      <group
        rotation={data.rotation}
        onClick={(e) => {
          e.stopPropagation();
          if (!currentVehicleId && !data.driverId) {
            enterVehicle(vehicleId);
            soundService.playSFX('ui_click');
          }
        }}
        onPointerOver={() => {
          if (!currentVehicleId) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* ================= REALISTIC 3D VEHICLE MODELS ================= */}
        {data.type === 'tank' && (
          <TankModel
            camo={data.camo || 'urban_cyber'}
            isDriving={isDriving}
            speed={currentSpeed}
            turretRotation={turretYaw}
            recoil={data.recoil || 0}
            healthPercent={healthPercent}
          />
        )}

        {data.type === 'jet' && (
          <FighterJetModel
            camo={data.camo || 'stealth_matte'}
            isDriving={isDriving}
            isBoosting={isBoosting}
            speed={currentSpeed}
            pitch={pitchAngle}
            roll={rollAngle}
            healthPercent={healthPercent}
          />
        )}

        {data.type === 'helicopter' && (
          <AttackHelicopterModel
            camo={data.camo || 'stealth_matte'}
            isDriving={isDriving}
            healthPercent={healthPercent}
          />
        )}

        {data.type === 'apc' && (
          <ArmoredIFVModel
            camo={data.camo || 'digital_desert'}
            isDriving={isDriving}
            speed={currentSpeed}
            healthPercent={healthPercent}
          />
        )}

        {data.type === 'gunboat' && (
          <NavalWarshipModel
            camo={data.camo || 'stealth_matte'}
            isDriving={isDriving}
            speed={currentSpeed}
            healthPercent={healthPercent}
          />
        )}

        {(data.type === 'car' || data.type === 'speeder') && (
          <CyberSupercarModel
            camo={data.camo || 'urban_cyber'}
            isDriving={isDriving}
            isBoosting={isBoosting}
            speed={currentSpeed}
            steeringAngle={steeringAngle}
            healthPercent={healthPercent}
          />
        )}

        {data.type === 'mech' && (
          <CombatMechModel
            camo={data.camo || 'urban_cyber'}
            isDriving={isDriving}
            healthPercent={healthPercent}
          />
        )}

        {data.type === 'motorbike' && (
          <CombatMotorbikeModel
            camo={data.camo || 'urban_cyber'}
            isDriving={isDriving}
            speed={currentSpeed}
            steeringAngle={steeringAngle}
            healthPercent={healthPercent}
          />
        )}

        {/* Countermeasure Flare Sparkles */}
        {flaresActive && (
          <group position={[0, 1.5, 1.0]}>
            {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
              <mesh key={i} position={[x, 1.2, i * 0.5]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#fbbf24" />
                <pointLight color="#f59e0b" intensity={12} distance={8} />
              </mesh>
            ))}
          </group>
        )}

        {/* Floating Holographic Interaction Label when unoccupied */}
        {!isDriving && (
          <group position={[0, colliderSize[1] * 2 + 1.2, 0]}>
            <Text
              fontSize={0.48}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.06}
              outlineColor="#000000"
            >
              {data.type.toUpperCase()}
            </Text>
            <Text
              position={[0, -0.4, 0]}
              fontSize={0.32}
              color="#00e5ff"
              anchorX="center"
              anchorY="middle"
            >
              {data.driverId ? '[OCCUPIED]' : '[CLICK / E] TO PILOT'}
            </Text>
            {/* Mini Health Bar */}
            <mesh position={[0, -0.7, 0]}>
              <boxGeometry args={[1.6, 0.08, 0.02]} />
              <meshBasicMaterial color="#1f2937" />
            </mesh>
            <mesh position={[((healthPercent / 100) - 1) * 0.8, -0.7, 0.01]}>
              <boxGeometry args={[(healthPercent / 100) * 1.6, 0.08, 0.02]} />
              <meshBasicMaterial color={healthPercent < 30 ? '#ef4444' : '#10b981'} />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
};
