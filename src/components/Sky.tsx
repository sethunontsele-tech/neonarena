import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky as SkyDrei, Stars, Cloud, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';

export const Sky: React.FC = () => {
  const isReplaying = useGameStore(state => state.isReplaying);
  const currentReplay = useGameStore(state => state.currentReplay);
  const replayTime = useGameStore(state => state.replayTime);
  const storeEnvironment = useGameStore(state => state.environment);
  const arenaState = useGameStore(state => state.arenaState);
  
  const snapshot = isReplaying && currentReplay.length > 0 ? currentReplay[Math.floor(replayTime)] : null;
  const environment = (isReplaying && snapshot?.environment) ? snapshot.environment : storeEnvironment;
  
  const { time, weather, intensity } = environment;
  
  const sunPosition = new THREE.Vector3(
    Math.cos(time * Math.PI / 12) * 100,
    Math.sin(time * Math.PI / 12) * 100,
    0
  );

  const isNight = time < 6 || time > 18;
  const isRaining = (weather === 'rain' || weather === 'storm') || arenaState === 'dimension459';
  const isSnowing = weather === 'snow';
  const isDimension459 = arenaState === 'dimension459';
  const isSpace71 = useGameStore(state => state.currentDimension === 'dimension_71');

  return (
    <group>
      {/* Skybox */}
      {isSpace71 ? (
        <color attach="background" args={['#000010']} />
      ) : !isDimension459 ? (
        <SkyDrei 
          distance={450000} 
          sunPosition={sunPosition} 
          inclination={0} 
          azimuth={0.25} 
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
          rayleigh={3}
          turbidity={10}
        />
      ) : (
        <color attach="background" args={['#050000']} />
      )}
      
      {/* Stars at night or in dimension 459 or space71 */}
      {(isNight || isDimension459 || isSpace71) && (
        <Stars 
          radius={isDimension459 || isSpace71 ? 300 : 100} 
          depth={50} 
          count={isDimension459 || isSpace71 ? 20000 : 5000} 
          factor={isDimension459 || isSpace71 ? 8 : 4} 
          saturation={isDimension459 || isSpace71 ? 1 : 0} 
          fade 
          speed={isDimension459 || isSpace71 ? 3 : 1} 
        />
      )}

      {/* Weather Effects */}
      {isSnowing && !isDimension459 && (
        <Sparkles 
          count={2000} 
          scale={100} 
          size={4} 
          speed={0.5} 
          color="#ffffff" 
          opacity={0.8} 
        />
      )}
      {isRaining && (
        <group>
          <Sparkles 
            count={isDimension459 ? 5000 : 1000} 
            scale={isDimension459 ? 200 : 100} 
            size={isDimension459 ? 5 : 2} 
            speed={isDimension459 ? 4 : 2} 
            color={isDimension459 ? "#ff0000" : "#88ccff"} 
            opacity={0.5} 
          />
          {(weather === 'storm' || isDimension459) && (
            <Lightning color={isDimension459 ? "#ff0000" : "#ffffff"} frequency={isDimension459 ? 0.98 : 0.995} />
          )}
        </group>
      )}

      {/* Fog */}
      {(weather === 'fog' || isDimension459) && (
        <fogExp2 attach="fog" args={[isDimension459 ? '#1a0000' : '#222', isDimension459 ? 0.02 : 0.05]} />
      )}

      {/* Sun/Moon Light */}
      <directionalLight 
        position={isDimension459 ? [0, 50, 0] : sunPosition} 
        intensity={isDimension459 ? 0.5 : (isNight ? 0.2 : 1.5)} 
        color={isDimension459 ? '#ff0000' : (isNight ? '#88ccff' : '#fff9e6')} 
      />
    </group>
  );
};

const Lightning: React.FC<{ color?: string, frequency?: number }> = ({ color = "#fff", frequency = 0.995 }) => {
  const [visible, setVisible] = React.useState(false);
  
  useFrame(() => {
    if (Math.random() > frequency) {
      setVisible(true);
      setTimeout(() => setVisible(false), 50 + Math.random() * 100);
    }
  });

  if (!visible) return null;

  return (
    <pointLight 
      position={[Math.random() * 200 - 100, 100, Math.random() * 200 - 100]} 
      intensity={50} 
      color={color} 
      distance={500} 
    />
  );
};
