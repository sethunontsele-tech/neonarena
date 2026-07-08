import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

interface FallingNote {
  id: number;
  keyIndex: number;
  y: number;
  color: string;
}

export function PianoTeacher() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const songsList = {
    ode_to_joy: {
      name: 'Ode to Joy',
      composer: 'Beethoven',
      notes: [4, 4, 5, 7, 7, 5, 4, 2, 0, 0, 2, 4, 4, 2, 2], // key indices
    },
    twinkle: {
      name: 'Twinkle Twinkle Little Star',
      composer: 'Traditional',
      notes: [0, 0, 7, 7, 9, 9, 7, 5, 5, 4, 4, 2, 2, 0],
    },
    fur_elise: {
      name: 'Für Elise',
      composer: 'Beethoven',
      notes: [11, 10, 11, 10, 11, 7, 9, 5, 4],
    }
  };

  const [activeSongKey, setActiveSongKey] = useState<keyof typeof songsList>('ode_to_joy');
  const [isPlaying, setIsPlaying] = useState(true);
  const [tempo, setTempo] = useState(120);
  const [activeKeys, setActiveKeys] = useState<number[]>([]);

  const keys = Array.from({ length: 14 }, (_, i) => ({
    index: i,
    isBlack: [1, 3, 6, 8, 10, 13].includes(i),
    noteName: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C2', 'C#2'][i]
  }));

  const fallingNotesRef = useRef<FallingNote[]>([]);
  const noteIdCounter = useRef(0);
  const songTimerRef = useRef(0);
  const nextNoteIndex = useRef(0);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    // falling notes speed based on tempo
    const speed = (tempo / 60) * 1.5;

    // update positions of falling notes
    fallingNotesRef.current = fallingNotesRef.current
      .map(note => ({ ...note, y: note.y - delta * speed }))
      .filter(note => {
        // When note hits y=0, trigger key animation
        if (note.y <= 0.1 && note.y >= -0.1) {
          if (!activeKeys.includes(note.keyIndex)) {
            setActiveKeys(prev => [...prev, note.keyIndex]);
            // Automatically clear after a short delay
            setTimeout(() => {
              setActiveKeys(prev => prev.filter(k => k !== note.keyIndex));
            }, 300);
          }
        }
        return note.y > -0.5; // keep until fully cleared
      });

    // spawn notes based on active song
    songTimerRef.current += delta;
    const noteInterval = 60 / tempo; // seconds per beat

    if (songTimerRef.current >= noteInterval) {
      songTimerRef.current = 0;
      const songNotes = songsList[activeSongKey].notes;
      const currentNoteVal = songNotes[nextNoteIndex.current];
      
      if (currentNoteVal !== undefined) {
        fallingNotesRef.current.push({
          id: noteIdCounter.current++,
          keyIndex: currentNoteVal,
          y: 4.5, // start height
          color: currentNoteVal % 2 === 0 ? '#06b6d4' : '#ec4899'
        });
        nextNoteIndex.current = (nextNoteIndex.current + 1) % songNotes.length;
      }
    }
  });

  const selectSong = (key: keyof typeof songsList) => {
    setActiveSongKey(key);
    fallingNotesRef.current = [];
    nextNoteIndex.current = 0;
    songTimerRef.current = 0;
    discoverObject(`piano_song_${key}`);
  };

  const handleInspect = () => {
    setSelectedObject({
      id: 'virtual_piano_teacher',
      name: 'Interactive Piano Teacher',
      category: 'Creative Arts',
      description: 'A responsive virtual keyboard overlay designed for spatial hand calibration. Colored stream blocks indicate notes, while guiding targets align fingers with white and black keys.',
      funFact: 'Interactive spatial learning increases skill retention by 70% compared to flat screen videos!'
    });
  };

  return (
    <group position={[0, -0.2, -1]}>
      {/* HUD Panel */}
      <Html position={[1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2.5 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-cyan-400 uppercase">Music Academy</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">🎹 Piano Teacher</h3>

          <div className="flex flex-col gap-1">
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">Select Song</span>
            {Object.entries(songsList).map(([key, song]) => (
              <button
                key={key}
                onClick={() => selectSong(key as any)}
                className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                  activeSongKey === key
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                    : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{song.name}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 border-t border-white/5 pt-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
            <button
              onClick={() => {
                fallingNotesRef.current = [];
                nextNoteIndex.current = 0;
              }}
              className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              RESET
            </button>
          </div>
          
          <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>Composer</span>
            <span className="text-zinc-300 font-bold">{songsList[activeSongKey].composer}</span>
          </div>
        </div>
      </Html>

      {/* Piano Keyboard Geometry */}
      <group position={[-1.4, 0.4, 0]}>
        {/* Base Frame */}
        <mesh 
          position={[1.3, -0.05, 0.2]}
          onClick={handleInspect}
        >
          <boxGeometry args={[3.2, 0.15, 0.9]} />
          <meshStandardMaterial color="#09090b" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Keys render */}
        {keys.map((k) => {
          const isActive = activeKeys.includes(k.index);
          const width = k.isBlack ? 0.12 : 0.22;
          const height = k.isBlack ? 0.14 : 0.08;
          const depth = k.isBlack ? 0.45 : 0.8;
          const xOffset = k.index * 0.2;
          const zOffset = k.isBlack ? 0.05 : 0.25;

          return (
            <group key={k.index} position={[xOffset, 0, zOffset]}>
              <mesh position={[0, height / 2, 0]}>
                <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial 
                  color={isActive ? (k.isBlack ? '#f43f5e' : '#22d3ee') : (k.isBlack ? '#18181b' : '#fafafa')} 
                  roughness={0.2}
                  emissive={isActive ? (k.isBlack ? '#f43f5e' : '#22d3ee') : '#000000'}
                  emissiveIntensity={isActive ? 1.5 : 0}
                />
              </mesh>

              {/* Falling streams indicator lines */}
              {isPlaying && !k.isBlack && (
                <mesh position={[0, 2.5, -0.45]} rotation={[0, 0, 0]}>
                  <planeGeometry args={[0.1, 4.5]} />
                  <meshBasicMaterial 
                    color="#22d3ee" 
                    transparent 
                    opacity={isActive ? 0.15 : 0.02} 
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
              )}
            </group>
          );
        })}

        {/* Live Notes falling from above */}
        {fallingNotesRef.current.map((note) => {
          const xPos = note.keyIndex * 0.2;
          const zPos = keys[note.keyIndex].isBlack ? 0.05 : 0.25;
          const noteHeight = 0.25;

          return (
            <mesh key={note.id} position={[xPos, note.y, zPos - 0.4]}>
              <boxGeometry args={[0.12, noteHeight, 0.12]} />
              <meshStandardMaterial 
                color={note.color} 
                emissive={note.color}
                emissiveIntensity={1.2}
              />
            </mesh>
          );
        })}

        {/* Virtual Floating Hand Guidance Overlay (translucent fingers) */}
        {isPlaying && (
          <group position={[1.2, 0.3, 0.4]}>
            {/* Hand skeletal wireframe lines */}
            <mesh>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#34d399" transparent opacity={0.3} wireframe />
            </mesh>
            {/* Finger placement spheres mapping active keys */}
            {activeKeys.map((kIdx, i) => (
              <mesh key={i} position={[(kIdx * 0.2) - 1.2, 0.1, keys[kIdx].isBlack ? -0.35 : -0.15]}>
                <sphereGeometry args={[0.035, 16, 16]} />
                <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.8} transparent opacity={0.7} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </group>
  );
}
export default PianoTeacher;
