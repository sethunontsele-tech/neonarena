import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Text, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { MegaVehicleType, MegaVehicleConfig } from './types';
import { MEGA_VEHICLES } from './configs';
import { useGameStore } from '../../store';

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
          {/* VEHICLE MODEL RENDERERS */}

          {/* 1. SPORTS CAR / MUSCLE CAR / BUGGY */}
          {(config.id === 'sports_car' || config.id === 'muscle_car' || config.id === 'buggy') && (
            <group>
              {/* Chassis */}
              <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.2, 0.7, 4.4]} />
                <meshStandardMaterial color={config.color} metalness={0.85} roughness={0.15} />
              </mesh>
              {/* Cabin Roof */}
              <mesh position={[0, 1.2, -0.2]} castShadow>
                <boxGeometry args={[1.7, 0.6, 2.2]} />
                <meshStandardMaterial color="#09090b" roughness={0.1} metalness={0.9} />
              </mesh>
              {/* Wheels */}
              {[[-1.2, 0.35, 1.4], [1.2, 0.35, 1.4], [-1.2, 0.35, -1.4], [1.2, 0.35, -1.4]].map(([x, y, z], idx) => (
                <mesh key={idx} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.38, 0.38, 0.3, 16]} />
                  <meshStandardMaterial color="#18181b" roughness={0.9} />
                </mesh>
              ))}
              {/* Neon Underglow */}
              <pointLight position={[0, 0.1, 0]} color={config.color} intensity={4} distance={6} />
              {/* Rear Turbo Nitro Exhaust */}
              {isBoosting && (
                <pointLight position={[0, 0.6, 2.4]} color="#06b6d4" intensity={8} distance={8} />
              )}
            </group>
          )}

          {/* 2. TANK & ARMORED APC */}
          {(config.id === 'tank' || config.id === 'armored_apc') && (
            <group>
              {/* Armored Hull */}
              <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.2, 1.2, 5.2]} />
                <meshStandardMaterial color={config.color} metalness={0.7} roughness={0.4} />
              </mesh>
              {/* Caterpillar Treads */}
              <mesh position={[-1.7, 0.5, 0]}>
                <boxGeometry args={[0.6, 0.9, 5.4]} />
                <meshStandardMaterial color="#09090b" roughness={0.95} />
              </mesh>
              <mesh position={[1.7, 0.5, 0]}>
                <boxGeometry args={[0.6, 0.9, 5.4]} />
                <meshStandardMaterial color="#09090b" roughness={0.95} />
              </mesh>
              {/* Rotating Turret & 120mm Cannon */}
              <group position={[0, 1.7, -0.2]}>
                <mesh castShadow>
                  <boxGeometry args={[2.0, 0.8, 2.4]} />
                  <meshStandardMaterial color={config.color} metalness={0.7} roughness={0.4} />
                </mesh>
                <mesh position={[0, 0.1, -2.2]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.18, 0.22, 3.2, 12]} />
                  <meshStandardMaterial color="#27272a" metalness={0.9} />
                </mesh>
              </group>
            </group>
          )}

          {/* 3. COMBAT HELICOPTER */}
          {config.id === 'helicopter' && (
            <group>
              {/* Fuselage */}
              <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[1.8, 1.8, 5.0]} />
                <meshStandardMaterial color={config.color} metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Cockpit Canopy */}
              <mesh position={[0, 1.6, -1.8]}>
                <sphereGeometry args={[0.9, 12, 12]} />
                <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Tail Boom */}
              <mesh position={[0, 1.8, 3.5]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.4, 4.0, 8]} />
                <meshStandardMaterial color={config.color} />
              </mesh>
              {/* Spinning Main Rotor */}
              <group ref={rotorRef} position={[0, 2.7, -0.2]}>
                <mesh>
                  <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
                  <meshStandardMaterial color="#18181b" />
                </mesh>
                <mesh position={[0, 0.2, 0]}>
                  <boxGeometry args={[9.0, 0.05, 0.4]} />
                  <meshStandardMaterial color="#18181b" />
                </mesh>
                <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <boxGeometry args={[9.0, 0.05, 0.4]} />
                  <meshStandardMaterial color="#18181b" />
                </mesh>
              </group>
              {/* Rocket Pods */}
              <mesh position={[-1.3, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 1.6, 8]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
              <mesh position={[1.3, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 1.6, 8]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            </group>
          )}

          {/* 4. FIGHTER JET / SUPERSONIC RAPTOR */}
          {(config.id === 'jet' || config.id === 'fighter_aircraft') && (
            <group>
              {/* Sleek Aerodynamic Fuselage */}
              <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <coneGeometry args={[1.2, 7.5, 8]} />
                <meshStandardMaterial color={config.color} metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Swept Delta Wings */}
              <mesh position={[0, 0.8, 0.5]}>
                <boxGeometry args={[7.2, 0.1, 3.2]} />
                <meshStandardMaterial color={config.color} metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Twin Vertical Stabilizers */}
              <mesh position={[-1.4, 1.6, 2.4]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[0.1, 1.8, 1.4]} />
                <meshStandardMaterial color={config.color} />
              </mesh>
              <mesh position={[1.4, 1.6, 2.4]} rotation={[0, 0, 0.2]}>
                <boxGeometry args={[0.1, 1.8, 1.4]} />
                <meshStandardMaterial color={config.color} />
              </mesh>
              {/* Afterburner Glow */}
              <pointLight position={[0, 0.8, 3.8]} color="#06b6d4" intensity={isDriving ? 12 : 1} distance={10} />
            </group>
          )}

          {/* 5. SPEEDBOAT & PATROL BOAT & SUBMARINE */}
          {(config.id === 'speedboat' || config.id === 'patrol_boat' || config.id === 'submarine') && (
            <group>
              {/* Hydrodynamic Hull */}
              <mesh position={[0, 0.6, 0]} castShadow>
                <boxGeometry args={[2.4, 1.1, 6.0]} />
                <meshStandardMaterial color={config.color} metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Cockpit / Bridge */}
              <mesh position={[0, 1.4, 0.8]}>
                <boxGeometry args={[1.8, 0.9, 2.0]} />
                <meshStandardMaterial color="#0284c7" roughness={0.1} />
              </mesh>
              {/* Water Splash Trail */}
              {isDriving && currentSpeed > 2 && (
                <pointLight position={[0, 0.1, 3.2]} color="#38bdf8" intensity={6} distance={8} />
              )}
            </group>
          )}

          {/* 6. CYBERBIKE / MOTORCYCLE */}
          {config.id === 'motorcycle' && (
            <group>
              {/* Slender Frame */}
              <mesh position={[0, 0.8, 0]} castShadow>
                <boxGeometry args={[0.7, 0.9, 2.6]} />
                <meshStandardMaterial color={config.color} metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Hubless Glowing Wheels */}
              <mesh position={[0, 0.5, 1.1]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.45, 0.12, 16, 24]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
              <mesh position={[0, 0.5, -1.1]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.45, 0.12, 16, 24]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
            </group>
          )}

          {/* 7. QUANTUM HOVER SPEEDER */}
          {config.id === 'flying_speeder' && (
            <group>
              <mesh position={[0, 0.8, 0]} castShadow>
                <boxGeometry args={[1.6, 0.5, 3.4]} />
                <meshStandardMaterial color="#22d3ee" metalness={0.95} roughness={0.05} />
              </mesh>
              {/* Anti-grav Rings */}
              <pointLight position={[0, 0.3, 0]} color="#22d3ee" intensity={8} distance={8} />
            </group>
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
