import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Text, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { MegaVehicleType, MegaVehicleConfig } from './types';
import { MEGA_VEHICLES } from './configs';
import { useGameStore } from '../../store';
import { TankModel } from '../RealisticVehicles/TankModel';
import { FighterJetModel } from '../RealisticVehicles/FighterJetModel';
import { AttackHelicopterModel } from '../RealisticVehicles/AttackHelicopterModel';
import { ArmoredIFVModel } from '../RealisticVehicles/ArmoredIFVModel';
import { NavalWarshipModel } from '../RealisticVehicles/NavalWarshipModel';
import { CyberSupercarModel } from '../RealisticVehicles/CyberSupercarModel';
import { CombatMotorbikeModel } from '../RealisticVehicles/CombatMotorbikeModel';

interface OpenWorldVehicleProps {
  id: string;
  config: MegaVehicleConfig;
  initialPosition: [number, number, number];
  initialRotation?: number;
}

export const OpenWorldVehicleInstance: React.FC<OpenWorldVehicleProps> = ({
  id,
  config,
  initialPosition,
  initialRotation = 0
}) => {
  const rbRef = useRef<any>(null);
  const rotorRef = useRef<THREE.Group>(null);
  const currentVehicleId = useGameStore(state => state.currentVehicleId);
  const enterVehicle = useGameStore(state => state.enterVehicle);
  const exitVehicle = useGameStore(state => state.exitVehicle);
  const isDriving = currentVehicleId === id;

  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [isBoosting, setIsBoosting] = useState(false);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Keyboard driving input listener
  useEffect(() => {
    if (!isDriving) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'e') {
        exitVehicle();
      }
      if (e.key === 'Shift') {
        setIsBoosting(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      if (e.key === 'Shift') {
        setIsBoosting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDriving, exitVehicle]);

  // Frame physics and vehicle driving logic
  useFrame((_, delta) => {
    // Rotor spinning for helicopters
    if (rotorRef.current && (config.category === 'air' || isDriving)) {
      rotorRef.current.rotation.y += (isDriving ? 28 : 10) * delta;
    }

    if (!isDriving || !rbRef.current) return;

    const forwardInput = (keysPressed.current['w'] || keysPressed.current['arrowup'] ? 1 : 0) -
                         (keysPressed.current['s'] || keysPressed.current['arrowdown'] ? 1 : 0);
    const turnInput = (keysPressed.current['d'] || keysPressed.current['arrowright'] ? -1 : 0) +
                      (keysPressed.current['a'] || keysPressed.current['arrowleft'] ? 1 : 0);

    const boostMultiplier = isBoosting ? 1.8 : 1.0;
    const accelPower = config.acceleration * 14 * boostMultiplier;

    // Apply linear impulse along vehicle heading
    const rot = rbRef.current.rotation();
    const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w));
    
    // Calculate forward vector
    const forwardVec = new THREE.Vector3(0, 0, -1).applyEuler(euler);
    const impulse = forwardVec.multiplyScalar(forwardInput * accelPower * delta * 80);

    // If helicopter or jet, allow vertical lift with Space / C keys
    if (config.category === 'air' || config.category === 'futuristic') {
      const liftInput = (keysPressed.current[' '] ? 1 : 0) - (keysPressed.current['c'] ? 1 : 0);
      impulse.y += liftInput * 25 * delta * 80;
    }

    rbRef.current.applyImpulse(impulse, true);

    // Apply torque for steering
    const turnTorque = new THREE.Vector3(0, turnInput * config.handling * 1.8 * delta * 80, 0);
    rbRef.current.applyTorqueImpulse(turnTorque, true);

    // Synchronize player position with vehicle in game store
    const pos = rbRef.current.translation();
    const vel = rbRef.current.linvel();
    const speedMagnitude = Math.hypot(vel.x, vel.z);
    setCurrentSpeed(speedMagnitude);

    useGameStore.getState().setPlayerPosition([pos.x, pos.y + 1.2, pos.z]);
  });

  return (
    <group position={initialPosition} rotation={[0, initialRotation, 0]}>
      <RigidBody
        ref={rbRef}
        type={isDriving ? 'dynamic' : 'fixed'}
        colliders="cuboid"
        linearDamping={config.category === 'air' ? 0.8 : 0.6}
        angularDamping={0.85}
        userData={{ name: `mega-vehicle-${id}` }}
      >
        <group
          onClick={(e) => {
            e.stopPropagation();
            if (!currentVehicleId) {
              enterVehicle(id);
              useGameStore.getState().addEvent(`🚗 ENTERED ${config.name.toUpperCase()}`);
            }
          }}
          onPointerOver={() => {
            if (!currentVehicleId) document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* REALISTIC 3D VEHICLE MODEL RENDERERS */}
          {(config.id === 'sports_car' || config.id === 'muscle_car' || config.id === 'buggy' || config.id === 'flying_speeder') && (
            <CyberSupercarModel
              color={config.color}
              camo="urban_cyber"
              isDriving={isDriving}
              isBoosting={isBoosting}
              speed={currentSpeed}
            />
          )}

          {config.id === 'tank' && (
            <TankModel
              color={config.color}
              camo="digital_desert"
              isDriving={isDriving}
              speed={currentSpeed}
            />
          )}

          {config.id === 'armored_apc' && (
            <ArmoredIFVModel
              color={config.color}
              camo="urban_cyber"
              isDriving={isDriving}
              speed={currentSpeed}
            />
          )}

          {config.id === 'helicopter' && (
            <AttackHelicopterModel
              color={config.color}
              camo="stealth_matte"
              isDriving={isDriving}
            />
          )}

          {(config.id === 'jet' || config.id === 'fighter_aircraft' || config.id === 'transport_plane') && (
            <FighterJetModel
              color={config.color}
              camo="stealth_matte"
              isDriving={isDriving}
              isBoosting={isBoosting}
              speed={currentSpeed}
            />
          )}

          {(config.id === 'speedboat' || config.id === 'patrol_boat' || config.id === 'submarine' || config.id === 'aircraft_carrier' || config.id === 'hovercraft') && (
            <NavalWarshipModel
              color={config.color}
              camo="stealth_matte"
              isDriving={isDriving}
              speed={currentSpeed}
            />
          )}

          {config.id === 'motorcycle' && (
            <CombatMotorbikeModel
              color={config.color}
              camo="urban_cyber"
              isDriving={isDriving}
              speed={currentSpeed}
            />
          )}

          {/* VEHICLE INTERACTION LABEL */}
          <group position={[0, 3.2, 0]}>
            <Text
              fontSize={0.45}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.05}
              outlineColor="#000000"
            >
              {config.name.toUpperCase()}
            </Text>
            <Text
              position={[0, -0.4, 0]}
              fontSize={0.32}
              color="#06b6d4"
              anchorX="center"
              anchorY="middle"
            >
              {isDriving ? '[E] TO EXIT' : '[CLICK / TOUCH] TO DRIVE'}
            </Text>
          </group>
        </group>
      </RigidBody>
    </group>
  );
};

export const OpenWorldVehiclesFleet: React.FC = () => {
  // Pre-spawn vehicles strategically in relevant biomes
  const fleetSpawns = [
    // Megacity Plaza
    { id: 'veh_gtr_city', type: 'sports_car', pos: [10, 0.2, -180], rot: 0 },
    { id: 'veh_bike_city', type: 'motorcycle', pos: [16, 0.2, -180], rot: 0 },
    { id: 'veh_speeder_city', type: 'flying_speeder', pos: [-12, 0.2, -180], rot: 0 },
    
    // Megacity Rooftop Helipad
    { id: 'veh_chopper_roof', type: 'helicopter', pos: [0, 101.5, -220], rot: 0 },

    // Military Base Airfield & Hangar
    { id: 'veh_jet_runway', type: 'jet', pos: [-280, 0.2, -280], rot: 0 },
    { id: 'veh_tank_base', type: 'tank', pos: [-240, 0.2, -220], rot: Math.PI / 4 },
    { id: 'veh_apc_base', type: 'armored_apc', pos: [-220, 0.2, -220], rot: Math.PI / 4 },
    { id: 'veh_chopper_base', type: 'helicopter', pos: [-310, 0.2, -220], rot: 0 },

    // Desert Dunes
    { id: 'veh_buggy_desert', type: 'buggy', pos: [-180, 0.2, 280], rot: -Math.PI / 3 },

    // Azure Ocean & Island Marina
    { id: 'veh_boat_marina', type: 'speedboat', pos: [0, 0.5, 260], rot: Math.PI },
    { id: 'veh_patrol_sea', type: 'patrol_boat', pos: [50, 0.5, 340], rot: Math.PI / 2 },
    { id: 'veh_sub_sea', type: 'submarine', pos: [-70, -4.0, 360], rot: 0 }
  ];

  return (
    <group name="open-world-vehicles-fleet">
      {fleetSpawns.map((spawn) => {
        const config = MEGA_VEHICLES.find(v => v.id === spawn.type) || MEGA_VEHICLES[0];
        return (
          <OpenWorldVehicleInstance
            key={spawn.id}
            id={spawn.id}
            config={config}
            initialPosition={spawn.pos as [number, number, number]}
            initialRotation={spawn.rot}
          />
        );
      })}
    </group>
  );
};
