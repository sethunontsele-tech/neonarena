import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { Target, ArrowUp, Zap, Box, RotateCcw, Car } from 'lucide-react';
import nipplejs from 'nipplejs';

export function MobileControls() {
  const setMobileControls = useGameStore(state => state.setMobileControls);
  const isBuildMode = useGameStore(state => state.isBuildMode);
  const setBuildMode = useGameStore(state => state.setBuildMode);
  const reload = useGameStore(state => state.reload);
  const setVehicleMenuOpen = useGameStore(state => state.setVehicleMenuOpen);
  const isVehicleMenuOpen = useGameStore(state => state.isVehicleMenuOpen);
  
  const moveZoneRef = useRef<HTMLDivElement>(null);
  const lookZoneRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!moveZoneRef.current || !lookZoneRef.current) return;

    const moveManager = nipplejs.create({
      zone: moveZoneRef.current,
      mode: 'static',
      position: { left: '80px', bottom: '80px' },
      color: 'white',
      size: 120,
    });

    const lookManager = nipplejs.create({
      zone: lookZoneRef.current,
      mode: 'static',
      position: { right: '80px', bottom: '80px' },
      color: 'white',
      size: 120,
    });

    moveManager.on('move', (evt, data) => {
      const forward = data.vector.y;
      const side = data.vector.x;
      setMobileControls({ move: { x: side, y: forward } });
    });

    moveManager.on('end', () => {
      setMobileControls({ move: { x: 0, y: 0 } });
    });

    lookManager.on('move', (evt, data) => {
      // Sensitivity adjustment for look
      const sensitivity = 2.0;
      setMobileControls({ look: { x: data.vector.x * sensitivity, y: data.vector.y * sensitivity } });
    });

    lookManager.on('end', () => {
      setMobileControls({ look: { x: 0, y: 0 } });
    });

    return () => {
      moveManager.destroy();
      lookManager.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] select-none">
      {/* Joystick Zones */}
      <div ref={moveZoneRef} className="absolute bottom-0 left-0 w-1/2 h-1/2 pointer-events-auto touch-none" />
      <div ref={lookZoneRef} className="absolute bottom-0 right-0 w-1/2 h-1/2 pointer-events-auto touch-none" />

      {/* Action Buttons (Right Side, above look joystick) */}
      <div className="absolute right-6 bottom-40 flex flex-col gap-4 pointer-events-auto">
        <button 
          className="w-16 h-16 bg-red-500/40 backdrop-blur-xl rounded-full border-2 border-red-500/50 flex items-center justify-center active:scale-90 active:bg-red-500/60 transition-all touch-none shadow-lg shadow-red-500/20"
          onTouchStart={() => setMobileControls({ fire: true })}
          onTouchEnd={() => setMobileControls({ fire: false })}
        >
          <Target className="text-white w-8 h-8" />
        </button>
        
        <button 
          className="w-16 h-16 bg-blue-500/40 backdrop-blur-xl rounded-full border-2 border-blue-500/50 flex items-center justify-center active:scale-90 active:bg-blue-500/60 transition-all touch-none shadow-lg shadow-blue-500/20"
          onTouchStart={() => setMobileControls({ jump: true })}
          onTouchEnd={() => setMobileControls({ jump: false })}
        >
          <ArrowUp className="text-white w-8 h-8" />
        </button>
      </div>

      {/* Utility Buttons (Left Side, above move joystick) */}
      <div className="absolute left-6 bottom-40 flex flex-col gap-4 pointer-events-auto">
        <button 
          className={`w-14 h-14 ${isBuildMode ? 'bg-emerald-500/60' : 'bg-emerald-500/40'} backdrop-blur-xl rounded-full border-2 border-emerald-500/50 flex items-center justify-center active:scale-90 transition-all touch-none shadow-lg shadow-emerald-500/20`}
          onClick={() => setBuildMode(!isBuildMode)}
        >
          <Box className="text-white w-7 h-7" />
        </button>

        <button 
          className="w-14 h-14 bg-blue-500/40 backdrop-blur-xl rounded-full border-2 border-blue-500/50 flex items-center justify-center active:scale-90 transition-all touch-none shadow-lg shadow-blue-500/20"
          onClick={() => setVehicleMenuOpen(!isVehicleMenuOpen)}
        >
          <Car className="text-white w-7 h-7" />
        </button>

        <button 
          className="w-14 h-14 bg-amber-500/40 backdrop-blur-xl rounded-full border-2 border-amber-500/50 flex items-center justify-center active:scale-90 transition-all touch-none shadow-lg shadow-amber-500/20"
          onClick={() => reload()}
        >
          <RotateCcw className="text-white w-7 h-7" />
        </button>
      </div>

      {/* Sprint Button (Top Left) */}
      <div className="absolute top-6 left-6 pointer-events-auto">
        <button 
          className="px-6 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white text-xs font-black uppercase tracking-widest active:bg-white/30 transition-all"
          onTouchStart={() => setMobileControls({ sprint: true })}
          onTouchEnd={() => setMobileControls({ sprint: false })}
        >
          Sprint
        </button>
      </div>
    </div>
  );
}
