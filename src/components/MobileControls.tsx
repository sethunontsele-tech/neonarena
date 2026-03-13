import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store';
import { Target, ArrowUp, Zap, Box } from 'lucide-react';

export function MobileControls() {
  const setMobileControls = useGameStore(state => state.setMobileControls);
  const isBuildMode = useGameStore(state => state.isBuildMode);
  const setBuildMode = useGameStore(state => state.setBuildMode);
  
  const moveJoystickRef = useRef<HTMLDivElement>(null);
  const lookJoystickRef = useRef<HTMLDivElement>(null);
  
  const [movePos, setMovePos] = useState({ x: 0, y: 0 });
  const [lookPos, setLookPos] = useState({ x: 0, y: 0 });
  
  const handleJoystick = (
    e: React.TouchEvent, 
    ref: React.RefObject<HTMLDivElement | null>, 
    setter: (pos: { x: number, y: number }) => void,
    storeKey: 'move' | 'look'
  ) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const touch = e.touches[0];
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2;
    
    if (distance > maxRadius) {
      dx *= maxRadius / distance;
      dy *= maxRadius / distance;
    }
    
    const normalizedX = dx / maxRadius;
    const normalizedY = dy / maxRadius;
    
    setter({ x: dx, y: dy });
    setMobileControls({ [storeKey]: { x: normalizedX, y: -normalizedY } });
  };

  const handleJoystickEnd = (setter: (pos: { x: number, y: number }) => void, storeKey: 'move' | 'look') => {
    setter({ x: 0, y: 0 });
    setMobileControls({ [storeKey]: { x: 0, y: 0 } });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50 select-none">
      {/* Move Joystick */}
      <div 
        className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 backdrop-blur-md rounded-full border border-white/20 pointer-events-auto flex items-center justify-center touch-none"
        ref={moveJoystickRef}
        onTouchMove={(e) => handleJoystick(e, moveJoystickRef, setMovePos, 'move')}
        onTouchEnd={() => handleJoystickEnd(setMovePos, 'move')}
      >
        <div 
          className="w-12 h-12 bg-white/30 rounded-full border border-white/40 shadow-lg"
          style={{ transform: `translate(${movePos.x}px, ${movePos.y}px)` }}
        />
      </div>

      {/* Look Joystick */}
      <div 
        className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 backdrop-blur-md rounded-full border border-white/20 pointer-events-auto flex items-center justify-center touch-none"
        ref={lookJoystickRef}
        onTouchMove={(e) => handleJoystick(e, lookJoystickRef, setLookPos, 'look')}
        onTouchEnd={() => handleJoystickEnd(setLookPos, 'look')}
      >
        <div 
          className="w-12 h-12 bg-white/30 rounded-full border border-white/40 shadow-lg"
          style={{ transform: `translate(${lookPos.x}px, ${lookPos.y}px)` }}
        />
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-48 right-10 flex flex-col gap-4 pointer-events-auto">
        <button 
          className="w-16 h-16 bg-red-500/40 backdrop-blur-md rounded-full border border-red-500/50 flex items-center justify-center active:scale-90 transition-transform touch-none"
          onTouchStart={() => setMobileControls({ fire: true })}
          onTouchEnd={() => setMobileControls({ fire: false })}
        >
          <Target className="text-white w-8 h-8" />
        </button>
        
        <button 
          className="w-16 h-16 bg-blue-500/40 backdrop-blur-md rounded-full border border-blue-500/50 flex items-center justify-center active:scale-90 transition-transform touch-none"
          onTouchStart={() => setMobileControls({ jump: true })}
          onTouchEnd={() => setMobileControls({ jump: false })}
        >
          <ArrowUp className="text-white w-8 h-8" />
        </button>

        <button 
          className={`w-16 h-16 ${isBuildMode ? 'bg-emerald-500/60' : 'bg-emerald-500/40'} backdrop-blur-md rounded-full border border-emerald-500/50 flex items-center justify-center active:scale-90 transition-transform touch-none`}
          onClick={() => setBuildMode(!isBuildMode)}
        >
          <Box className="text-white w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
