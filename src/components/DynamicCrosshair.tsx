import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';

export function DynamicCrosshair() {
  const isPlayerMoving = useGameStore(state => state.isPlayerMoving);
  const lastFireTime = useGameStore(state => state.lastFireTime);
  const playerState = useGameStore(state => state.playerState);
  
  const [bloom, setBloom] = useState(0);

  useEffect(() => {
    let active = true;
    const update = () => {
      if (!active) return;
      const elapsed = Date.now() - lastFireTime;
      // Decay fire bloom over 250ms
      const currentBloom = elapsed < 250 ? (1 - elapsed / 250) : 0;
      setBloom(currentBloom);
      requestAnimationFrame(update);
    };
    update();
    return () => {
      active = false;
    };
  }, [lastFireTime]);

  // Base spread + movement spread + fire bloom spread
  const spreadMultiplier = 1.0 + (isPlayerMoving ? 0.6 : 0) + (bloom * 1.5);
  // Color code based on status
  const colorClass = playerState === 'disabled' ? 'bg-red-500' : 'bg-amber-400';
  const borderColorClass = playerState === 'disabled' ? 'border-red-500' : 'border-amber-400';

  const gap = spreadMultiplier * 10; // in pixels

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Center dot */}
      <div className={`w-1 h-1 rounded-full ${colorClass} shadow-[0_0_6px_rgba(245,158,11,0.8)]`} />

      {/* Top Tick */}
      <div 
        className={`absolute w-0.5 h-2.5 ${colorClass} transition-all duration-75`} 
        style={{ transform: `translateY(-${gap}px)` }} 
      />
      {/* Bottom Tick */}
      <div 
        className={`absolute w-0.5 h-2.5 ${colorClass} transition-all duration-75`} 
        style={{ transform: `translateY(${gap}px)` }} 
      />
      {/* Left Tick */}
      <div 
        className={`absolute w-2.5 h-0.5 ${colorClass} transition-all duration-75`} 
        style={{ transform: `translateX(-${gap}px)` }} 
      />
      {/* Right Tick */}
      <div 
        className={`absolute w-2.5 h-0.5 ${colorClass} transition-all duration-75`} 
        style={{ transform: `translateX(${gap}px)` }} 
      />

      {/* Outer Tactical Circle */}
      <div 
        className={`absolute rounded-full border border-dashed opacity-40 transition-all duration-75 ${borderColorClass}`}
        style={{ 
          width: `${gap * 3.2}px`, 
          height: `${gap * 3.2}px`,
        }} 
      />

      {/* Accuracy percentage / recoil feedback text (subtle mono font) */}
      <div className="absolute top-9 text-[7px] font-mono opacity-50 select-none pointer-events-none uppercase tracking-widest text-center whitespace-nowrap text-amber-400">
        {isPlayerMoving ? 'UNSTABLE ACC' : 'STEADY'}
      </div>
    </div>
  );
}
