import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Text, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { BIOME_ZONES } from './configs';
import { useGameStore } from '../../store';

export const NeonOpenWorld: React.FC = () => {
  const lighthouseRef = useRef<THREE.SpotLight>(null);
  const crystalGroupRef = useRef<THREE.Group>(null);
  const radarRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  
  // Rotating elements animation loop
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lighthouseRef.current) {
      lighthouseRef.current.rotation.y = t * 0.8;
    }
    if (crystalGroupRef.current) {
      crystalGroupRef.current.rotation.y = t * 0.4;
    }
    if (radarRef.current) {
      radarRef.current.rotation.y = t * 1.2;
    }
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.roughness = 0.1 + Math.sin(t * 1.5) * 0.05;
      }
    }
  });

  return (
    <group name="neon-open-world-sandbox">
      {/* 1. TERRAIN SURFACES & BIOME GROUNDS */}
      
      {/* Central Plains & Road Grid Floor */}
      <RigidBody type="fixed" colliders="cuboid" name="terrain-central-plains">
        <mesh position={[0, -1, 0]} receiveShadow>
          <boxGeometry args={[900, 2, 900]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
        </mesh>
      </RigidBody>

      {/* Megacity Asphalt Plaza & Road System */}
      <RigidBody type="fixed" colliders="cuboid" name="megacity-asphalt">
        <mesh position={[0, 0.02, -220]} receiveShadow>
          <boxGeometry args={[260, 0.1, 220]} />
          <meshStandardMaterial color="#18181b" roughness={0.7} metalness={0.3} />
        </mesh>
      </RigidBody>

      {/* Desert Golden Sand Dunes */}
      <RigidBody type="fixed" colliders="cuboid" name="desert-sand">
        <mesh position={[-240, 0.05, 320]} receiveShadow>
          <boxGeometry args={[280, 0.2, 260]} />
          <meshStandardMaterial color="#d97706" roughness={0.95} metalness={0.05} />
        </mesh>
        {/* Soft Sand Dunes */}
        <mesh position={[-200, 3, 260]} rotation={[0.1, 0.4, -0.05]} receiveShadow>
          <cylinderGeometry args={[25, 45, 8, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.95} />
        </mesh>
        <mesh position={[-280, 4, 350]} rotation={[-0.05, -0.3, 0.08]} receiveShadow>
          <cylinderGeometry args={[30, 55, 9, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.95} />
        </mesh>
      </RigidBody>

      {/* Mountain Alpine Granite & Snow Base */}
      <RigidBody type="fixed" colliders="trimesh" name="mountains-granite">
        <mesh position={[260, 0.1, 240]} receiveShadow>
          <boxGeometry args={[260, 0.2, 260]} />
          <meshStandardMaterial color="#334155" roughness={0.85} metalness={0.2} />
        </mesh>
        {/* Summit Peaks */}
        <mesh position={[280, 35, 270]} receiveShadow castShadow>
          <coneGeometry args={[50, 70, 8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[230, 25, 210]} receiveShadow castShadow>
          <coneGeometry args={[40, 50, 8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[310, 20, 200]} receiveShadow castShadow>
          <coneGeometry args={[35, 40, 7]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.7} metalness={0.1} />
        </mesh>
      </RigidBody>

      {/* Dino Valley Basalt & Lava Fissures */}
      <RigidBody type="fixed" colliders="cuboid" name="dino-valley-ground">
        <mesh position={[-260, 0.05, 100]} receiveShadow>
          <boxGeometry args={[240, 0.2, 220]} />
          <meshStandardMaterial color="#1c1917" roughness={0.95} />
        </mesh>
        {/* Glowing Lava Trenches */}
        <mesh position={[-240, 0.1, 90]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[120, 8]} />
          <meshBasicMaterial color="#ea580c" />
        </mesh>
        <mesh position={[-280, 0.1, 130]} rotation={[-Math.PI / 2, 0, 0.4]}>
          <planeGeometry args={[90, 6]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
      </RigidBody>

      {/* 2. THE AZURE OCEAN & TROPICAL REEF */}
      <group position={[0, -0.2, 360]}>
        {/* Water Surface Plane */}
        <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[450, 320]} />
          <meshStandardMaterial 
            color="#0284c7" 
            roughness={0.1} 
            metalness={0.6} 
            transparent 
            opacity={0.88} 
          />
        </mesh>
        {/* Ocean Seafloor */}
        <mesh position={[0, -18, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[450, 320]} />
          <meshStandardMaterial color="#0f766e" roughness={0.95} />
        </mesh>

        {/* Tropical Atoll Islands */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[-80, 1.2, -40]}>
            <cylinderGeometry args={[22, 28, 3, 16]} />
            <meshStandardMaterial color="#fde047" roughness={0.9} />
          </mesh>
        </RigidBody>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[90, 1.5, 30]}>
            <cylinderGeometry args={[26, 32, 3.5, 16]} />
            <meshStandardMaterial color="#fde047" roughness={0.9} />
          </mesh>
        </RigidBody>

        {/* Offshore Lighthouse */}
        <group position={[140, 0, -50]}>
          <RigidBody type="fixed" colliders="cuboid">
            {/* Rocky base */}
            <mesh position={[0, 4, 0]}>
              <cylinderGeometry args={[12, 16, 8, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.9} />
            </mesh>
            {/* White/Red striped tower */}
            <mesh position={[0, 22, 0]}>
              <cylinderGeometry args={[3, 4.5, 28, 12]} />
              <meshStandardMaterial color="#ffffff" roughness={0.4} />
            </mesh>
            <mesh position={[0, 22, 0]}>
              <cylinderGeometry args={[3.05, 4.55, 6, 12]} />
              <meshStandardMaterial color="#dc2626" roughness={0.4} />
            </mesh>
            {/* Lantern room */}
            <mesh position={[0, 37, 0]}>
              <cylinderGeometry args={[3.2, 3.2, 3, 12]} />
              <meshStandardMaterial color="#09090b" roughness={0.2} metalness={0.8} />
            </mesh>
          </RigidBody>
          {/* Rotating Beam */}
          <group position={[0, 37, 0]}>
            <spotLight
              ref={lighthouseRef}
              color="#fef08a"
              intensity={18}
              distance={180}
              angle={Math.PI / 6}
              penumbra={0.3}
            />
          </group>
        </group>

        {/* Sunken Galleon Shipwreck */}
        <group position={[-50, -16, 40]} rotation={[0.2, 0.5, -0.3]}>
          <mesh castShadow>
            <boxGeometry args={[10, 8, 32]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          {/* Mast */}
          <mesh position={[0, 10, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 18, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          <Sparkles count={30} scale={[15, 12, 35]} size={4} speed={0.4} color="#38bdf8" />
        </group>
      </group>

      {/* 3. NEO-TOKYO SKYSCRAPER MEGACITY */}
      <group position={[0, 0, -220]}>
        {/* Skyscraper 1: Apex Cyber Tower with Rooftop Helipad */}
        <RigidBody type="fixed" colliders="cuboid">
          <group position={[0, 0, 0]}>
            {/* Main Tower */}
            <mesh position={[0, 50, 0]} castShadow receiveShadow>
              <boxGeometry args={[32, 100, 32]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.85} />
            </mesh>
            {/* Glass Neon Facades */}
            <mesh position={[0, 50, 16.2]}>
              <planeGeometry args={[28, 92]} />
              <meshBasicMaterial color="#0891b2" wireframe />
            </mesh>
            <mesh position={[0, 50, -16.2]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[28, 92]} />
              <meshBasicMaterial color="#06b6d4" wireframe />
            </mesh>
            {/* Rooftop Helipad */}
            <mesh position={[0, 100.5, 0]}>
              <boxGeometry args={[30, 1, 30]} />
              <meshStandardMaterial color="#18181b" roughness={0.6} />
            </mesh>
            {/* Helipad 'H' */}
            <mesh position={[0, 101.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[8, 9.5, 32]} />
              <meshBasicMaterial color="#eab308" />
            </mesh>
            {/* Antenna Spire with flashing warning beacon */}
            <mesh position={[0, 115, 0]}>
              <cylinderGeometry args={[0.4, 1.2, 30, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
            <pointLight position={[0, 130, 0]} color="#ef4444" intensity={8} distance={60} />
          </group>
        </RigidBody>

        {/* Skyscraper 2: Arasaka Mega-Monolith */}
        <RigidBody type="fixed" colliders="cuboid">
          <group position={[-60, 0, -35]}>
            <mesh position={[0, 40, 0]} castShadow receiveShadow>
              <boxGeometry args={[28, 80, 24]} />
              <meshStandardMaterial color="#1e1b4b" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Hologram Billboard */}
            <mesh position={[0, 60, 12.2]}>
              <planeGeometry args={[22, 14]} />
              <meshBasicMaterial color="#ec4899" />
            </mesh>
          </group>
        </RigidBody>

        {/* Skyscraper 3: Quantum Glass Spire */}
        <RigidBody type="fixed" colliders="cuboid">
          <group position={[60, 0, -30]}>
            <mesh position={[0, 45, 0]} castShadow receiveShadow>
              <boxGeometry args={[26, 90, 26]} />
              <meshStandardMaterial color="#022c22" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh position={[0, 45, 13.2]}>
              <planeGeometry args={[22, 80]} />
              <meshBasicMaterial color="#10b981" wireframe />
            </mesh>
          </group>
        </RigidBody>

        {/* Skyscraper 4 & 5: Twin Gate Towers with Skybridge */}
        <RigidBody type="fixed" colliders="cuboid">
          <group position={[-50, 0, 50]}>
            <mesh position={[0, 35, 0]} castShadow receiveShadow>
              <boxGeometry args={[22, 70, 22]} />
              <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.6} />
            </mesh>
          </group>
        </RigidBody>
        <RigidBody type="fixed" colliders="cuboid">
          <group position={[50, 0, 50]}>
            <mesh position={[0, 35, 0]} castShadow receiveShadow>
              <boxGeometry args={[22, 70, 22]} />
              <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.6} />
            </mesh>
          </group>
        </RigidBody>
        {/* Connecting High-Altitude Skybridge */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 55, 50]} castShadow>
            <boxGeometry args={[80, 5, 8]} />
            <meshStandardMaterial color="#0369a1" roughness={0.2} metalness={0.9} />
          </mesh>
        </RigidBody>

        {/* Elevated Highway Ramp */}
        <RigidBody type="fixed" colliders="cuboid">
          <group position={[0, 8, 10]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[180, 1.5, 14]} />
              <meshStandardMaterial color="#27272a" roughness={0.8} />
            </mesh>
            {/* Neon safety guardrails */}
            <mesh position={[0, 1.2, 6.8]}>
              <boxGeometry args={[180, 1, 0.4]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
            <mesh position={[0, 1.2, -6.8]}>
              <boxGeometry args={[180, 1, 0.4]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
          </group>
        </RigidBody>
      </group>

      {/* 4. MILITARY BASE & AIRFIELD & AIRCRAFT CARRIER */}
      <group position={[-280, 0, -260]}>
        {/* 320m Jet Runway */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0.08, 0]} receiveShadow>
            <boxGeometry args={[70, 0.15, 320]} />
            <meshStandardMaterial color="#262626" roughness={0.8} />
          </mesh>
          {/* White Centerline Stripes */}
          {[-120, -80, -40, 0, 40, 80, 120].map((zPos, idx) => (
            <mesh key={idx} position={[0, 0.18, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3.5, 20]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
          {/* Runway Threshold Yellow Arrows */}
          <mesh position={[0, 0.18, -145]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[50, 8]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
        </RigidBody>

        {/* Aircraft Hangar */}
        <RigidBody type="fixed" colliders="cuboid">
          <group position={[65, 0, -40]}>
            <mesh position={[0, 12, 0]} castShadow receiveShadow>
              <boxGeometry args={[45, 24, 60]} />
              <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.4} />
            </mesh>
            {/* Open hangar front */}
            <mesh position={[-22.6, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[40, 20]} />
              <meshBasicMaterial color="#020617" />
            </mesh>
          </group>
        </RigidBody>

        {/* Air Traffic Control Tower with Rotating Radar */}
        <group position={[-60, 0, -50]}>
          <RigidBody type="fixed" colliders="cuboid">
            {/* Tower Pillar */}
            <mesh position={[0, 20, 0]} castShadow>
              <cylinderGeometry args={[3, 4, 40, 8]} />
              <meshStandardMaterial color="#64748b" roughness={0.5} />
            </mesh>
            {/* Glass Observation Deck */}
            <mesh position={[0, 42, 0]}>
              <cylinderGeometry args={[8, 6, 8, 12]} />
              <meshStandardMaterial color="#0369a1" roughness={0.1} metalness={0.9} />
            </mesh>
          </RigidBody>
          {/* Rotating Radar Dome */}
          <group ref={radarRef} position={[0, 48, 0]}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.3, 3, 6]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
            <mesh position={[0, 1.5, 0]} rotation={[0.4, 0, 0]}>
              <boxGeometry args={[8, 2, 0.4]} />
              <meshStandardMaterial color="#0284c7" />
            </mesh>
          </group>
        </group>

        {/* Offshore Aircraft Carrier (USS TITAN) */}
        <group position={[-110, -0.4, 100]}>
          <RigidBody type="fixed" colliders="cuboid">
            {/* Flight Deck */}
            <mesh position={[0, 3, 0]} castShadow receiveShadow>
              <boxGeometry args={[45, 6, 160]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.3} />
            </mesh>
            {/* Island Control Tower */}
            <mesh position={[18, 14, 20]} castShadow>
              <boxGeometry args={[8, 18, 24]} />
              <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>
            {/* Flight deck runway stripe */}
            <mesh position={[-5, 6.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[14, 140]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </RigidBody>
        </group>
      </group>

      {/* 5. JURASSIC DINO VALLEY & VOLCANO */}
      <group position={[-260, 0, 100]}>
        {/* Giant T-Rex Ribcage Bone Arch */}
        <group position={[0, 0, 0]}>
          {[-25, -15, -5, 5, 15, 25].map((zOff, idx) => (
            <mesh key={idx} position={[0, 8, zOff]} rotation={[0, 0, Math.sin(idx) * 0.1]}>
              <torusGeometry args={[8 + Math.sin(idx) * 2, 1, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Steaming Volcano Cone */}
        <RigidBody type="fixed" colliders="trimesh">
          <mesh position={[70, 18, -40]} castShadow receiveShadow>
            <coneGeometry args={[35, 36, 12, 1, true]} />
            <meshStandardMaterial color="#292524" roughness={0.95} />
          </mesh>
          {/* Magma Pool in Crater */}
          <mesh position={[70, 24, -40]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[14, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </RigidBody>
        <pointLight position={[70, 28, -40]} color="#f97316" intensity={12} distance={80} />

        {/* Dino Nests with Glowing Eggs */}
        <group position={[-40, 1, 30]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[4, 5, 0.8, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.95} />
          </mesh>
          {/* 3 Prehistoric Eggs */}
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial color="#bef264" roughness={0.3} emissive="#84cc16" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[-1.2, 0.8, 0.8]}>
            <sphereGeometry args={[0.9, 12, 12]} />
            <meshStandardMaterial color="#a3e635" roughness={0.3} emissive="#65a30d" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[1.2, 0.8, -0.6]}>
            <sphereGeometry args={[0.85, 12, 12]} />
            <meshStandardMaterial color="#bef264" roughness={0.3} emissive="#84cc16" emissiveIntensity={0.4} />
          </mesh>
        </group>
      </group>

      {/* 6. SOLARIA GREAT PYRAMID & DESERT OASIS */}
      <group position={[-220, 0, 320]}>
        {/* Step Pyramid */}
        <RigidBody type="fixed" colliders="trimesh">
          <group position={[0, 0, 0]}>
            {/* 4 tiers of stone blocks */}
            <mesh position={[0, 6, 0]} castShadow receiveShadow>
              <boxGeometry args={[70, 12, 70]} />
              <meshStandardMaterial color="#d97706" roughness={0.9} />
            </mesh>
            <mesh position={[0, 16, 0]} castShadow receiveShadow>
              <boxGeometry args={[52, 10, 52]} />
              <meshStandardMaterial color="#b45309" roughness={0.9} />
            </mesh>
            <mesh position={[0, 24, 0]} castShadow receiveShadow>
              <boxGeometry args={[36, 8, 36]} />
              <meshStandardMaterial color="#d97706" roughness={0.9} />
            </mesh>
            <mesh position={[0, 30, 0]} castShadow receiveShadow>
              <boxGeometry args={[20, 6, 20]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.7} />
            </mesh>
            {/* Golden Apex Capstone */}
            <mesh position={[0, 35, 0]}>
              <coneGeometry args={[6, 8, 4]} />
              <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.1} emissive="#eab308" emissiveIntensity={0.5} />
            </mesh>
          </group>
        </RigidBody>

        {/* Golden Obelisks Flanking Entrance */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[-25, 10, 42]} castShadow>
            <cylinderGeometry args={[0.8, 1.6, 20, 4]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.2} />
          </mesh>
        </RigidBody>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[25, 10, 42]} castShadow>
            <cylinderGeometry args={[0.8, 1.6, 20, 4]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.2} />
          </mesh>
        </RigidBody>

        {/* Desert Oasis Pool & Palms */}
        <group position={[70, 0, -50]}>
          <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[22, 24]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.1} metalness={0.8} />
          </mesh>
          {/* Palm Trunks */}
          {[[-15, 12], [18, -10], [-10, -16], [14, 14]].map(([x, z], idx) => (
            <group key={idx} position={[x, 0, z]}>
              <mesh position={[0, 6, 0]} rotation={[0.1, 0, 0.15]}>
                <cylinderGeometry args={[0.4, 0.7, 12, 6]} />
                <meshStandardMaterial color="#78350f" roughness={0.9} />
              </mesh>
              {/* Palm Crown Fronds */}
              <mesh position={[1, 12, 1]}>
                <sphereGeometry args={[3, 6, 6]} />
                <meshStandardMaterial color="#15803d" roughness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* 7. SANCTUARY OF LEVITATING AETHER RUINS */}
      <group position={[280, 0, -80]}>
        {/* Stone Temple Platform */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2, 0]} receiveShadow>
            <cylinderGeometry args={[36, 40, 4, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.85} />
          </mesh>
        </RigidBody>

        {/* Ancient Broken Pillars */}
        {[-22, 22].map((x, i) =>
          [-22, 22].map((z, j) => (
            <RigidBody key={`${i}-${j}`} type="fixed" colliders="cuboid">
              <mesh position={[x, 10, z]} castShadow>
                <cylinderGeometry args={[1.6, 2, 16, 8]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.7} />
              </mesh>
            </RigidBody>
          ))
        )}

        {/* Levitating Runic Crystals Ring */}
        <group ref={crystalGroupRef} position={[0, 16, 0]}>
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const angle = (idx / 6) * Math.PI * 2;
            const radius = 18;
            return (
              <Float key={idx} speed={2} rotationIntensity={1} floatIntensity={2}>
                <mesh position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
                  <octahedronGeometry args={[2.5]} />
                  <meshStandardMaterial 
                    color="#c084fc" 
                    emissive="#a855f7" 
                    emissiveIntensity={0.8} 
                    roughness={0.1} 
                    metalness={0.9} 
                  />
                </mesh>
              </Float>
            );
          })}
        </group>
        <pointLight position={[0, 16, 0]} color="#c084fc" intensity={12} distance={50} />
      </group>

      {/* 8. ANIME TITAN COLOSSEUM & SHATTERED GOD SWORD */}
      <group position={[240, 0, -280]}>
        {/* Dueling Arena Ring */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1, 0]} receiveShadow>
            <cylinderGeometry args={[50, 52, 2, 24]} />
            <meshStandardMaterial color="#1e1b4b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[45, 48, 32]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </RigidBody>

        {/* Colossal 45-Meter Shattered God Sword plunged into the ground */}
        <group position={[0, 0, 0]} rotation={[0.2, 0.3, -0.2]}>
          {/* Blade */}
          <mesh position={[0, 24, 0]} castShadow>
            <boxGeometry args={[4, 45, 0.8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Glowing Red Energy Channel in blade */}
          <mesh position={[0, 24, 0.45]}>
            <boxGeometry args={[1, 40, 0.2]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          {/* Crossguard */}
          <mesh position={[0, 47, 0]}>
            <boxGeometry args={[18, 3, 3]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} />
          </mesh>
          {/* Hilt */}
          <mesh position={[0, 55, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 14, 8]} />
            <meshStandardMaterial color="#18181b" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* 9. SAKURA VILLAGE & HARBOR */}
      <group position={[120, 0, 40]}>
        {/* Japanese Pagoda Town Hall */}
        <RigidBody type="fixed" colliders="cuboid">
          <group position={[0, 0, 0]}>
            {/* Base floor */}
            <mesh position={[0, 4, 0]} castShadow receiveShadow>
              <boxGeometry args={[18, 8, 18]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            {/* Lower Eaves Roof */}
            <mesh position={[0, 9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[16, 4, 4]} />
              <meshStandardMaterial color="#991b1b" roughness={0.6} />
            </mesh>
            {/* Second Tier */}
            <mesh position={[0, 13, 0]} castShadow>
              <boxGeometry args={[12, 6, 12]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            {/* Top Roof with Spire */}
            <mesh position={[0, 17, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[12, 4, 4]} />
              <meshStandardMaterial color="#991b1b" roughness={0.6} />
            </mesh>
          </group>
        </RigidBody>

        {/* Beautiful Sakura Cherry Blossom Trees */}
        {[[-18, 16], [22, -14], [-24, -18], [26, 20]].map(([x, z], idx) => (
          <group key={idx} position={[x, 0, z]}>
            <mesh position={[0, 4, 0]}>
              <cylinderGeometry args={[0.6, 0.9, 8, 6]} />
              <meshStandardMaterial color="#451a03" roughness={0.9} />
            </mesh>
            {/* Vibrant Pink Foliage */}
            <mesh position={[0, 8, 0]}>
              <sphereGeometry args={[4.5, 8, 8]} />
              <meshStandardMaterial color="#f472b6" roughness={0.7} />
            </mesh>
            <Sparkles count={15} scale={[8, 6, 8]} size={3} speed={0.8} color="#fbcfe8" position={[0, 7, 0]} />
          </group>
        ))}
      </group>

      {/* 10. DESTRUCTIBLE INTERACTIVE CRATES & EXPLOSIVE BARRELS */}
      <group name="interactive-world-props">
        {[
          { pos: [12, 1, -200], type: 'barrel', color: '#ef4444' },
          { pos: [-15, 1, -190], type: 'crate', color: '#eab308' },
          { pos: [20, 1, -240], type: 'crate', color: '#06b6d4' },
          { pos: [-250, 1, -240], type: 'barrel', color: '#ef4444' },
          { pos: [-230, 1, 80], type: 'crate', color: '#10b981' },
          { pos: [100, 1, 20], type: 'crate', color: '#a855f7' }
        ].map((prop, idx) => (
          <RigidBody key={idx} type="dynamic" position={prop.pos as [number, number, number]} colliders="cuboid">
            {prop.type === 'barrel' ? (
              <mesh castShadow>
                <cylinderGeometry args={[0.8, 0.8, 1.8, 12]} />
                <meshStandardMaterial color={prop.color} roughness={0.4} metalness={0.7} />
              </mesh>
            ) : (
              <mesh castShadow>
                <boxGeometry args={[1.6, 1.6, 1.6]} />
                <meshStandardMaterial color={prop.color} roughness={0.6} metalness={0.3} />
              </mesh>
            )}
          </RigidBody>
        ))}
      </group>

      {/* 11. IN-WORLD 3D BIOME ZONE LABELS */}
      {BIOME_ZONES.map((zone) => (
        <group key={zone.id} position={[zone.coordinates[0], 28, zone.coordinates[2]]}>
          <Text
            fontSize={4.2}
            color={zone.color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.2}
            outlineColor="#000000"
          >
            {zone.name.toUpperCase()}
          </Text>
        </group>
      ))}
    </group>
  );
};
