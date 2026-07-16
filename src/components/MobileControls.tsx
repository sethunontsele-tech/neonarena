import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store';
import { Target, ArrowUp, Zap, Box, RotateCcw, Car, Move, Sliders, Shield, RotateCw } from 'lucide-react';
import nipplejs from 'nipplejs';

export function MobileControls() {
  const setMobileControls = useGameStore(state => state.setMobileControls);
  const isBuildMode = useGameStore(state => state.isBuildMode);
  const setBuildMode = useGameStore(state => state.setBuildMode);
  const reload = useGameStore(state => state.reload);
  const setVehicleMenuOpen = useGameStore(state => state.setVehicleMenuOpen);
  const isVehicleMenuOpen = useGameStore(state => state.isVehicleMenuOpen);
  
  // Custom mobile controls keys
  const layout = useGameStore(state => state.mobileControlsLayout) || 'default';
  const customButtonPositions = useGameStore(state => state.customButtonPositions) || {};
  const setCustomButtonPosition = useGameStore(state => state.setCustomButtonPosition);
  const vibrationEnabled = useGameStore(state => state.vibrationEnabled) ?? true;
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggingButton, setDraggingButton] = useState<string | null>(null);

  const moveZoneRef = useRef<HTMLDivElement>(null);
  const lookZoneRef = useRef<HTMLDivElement>(null);
  const moveManagerRef = useRef<any>(null);
  const lookManagerRef = useRef<any>(null);

  // Trigger haptic vibration on touch
  const triggerHaptic = (duration = 40) => {
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  // Re-initialize Joysticks when layout changes
  useEffect(() => {
    if (!moveZoneRef.current || !lookZoneRef.current) return;

    // Destroy existing
    if (moveManagerRef.current) {
      moveManagerRef.current.destroy();
    }
    if (lookManagerRef.current) {
      lookManagerRef.current.destroy();
    }

    let movePosition = { left: '80px', bottom: '80px' };
    let lookPosition = { right: '80px', bottom: '80px' };
    let size = 120;

    if (layout === 'compact') {
      movePosition = { left: '60px', bottom: '60px' };
      lookPosition = { right: '60px', bottom: '60px' };
      size = 95;
    } else if (layout === 'lefthanded') {
      movePosition = { right: '80px', bottom: '80px' };
      lookPosition = { left: '80px', bottom: '80px' };
    } else if (layout === 'custom') {
      const customMove = customButtonPositions['joystick_move'];
      const customLook = customButtonPositions['joystick_look'];
      movePosition = customMove ? { left: `${customMove.x}px`, bottom: `${customMove.y}px` } : { left: '80px', bottom: '80px' };
      lookPosition = customLook ? { left: `${customLook.x}px`, bottom: `${customLook.y}px` } : { right: '80px', bottom: '80px' };
      size = customMove?.size || 120;
    }

    const moveManager = nipplejs.create({
      zone: moveZoneRef.current,
      mode: 'static',
      position: movePosition,
      color: 'rgba(255, 255, 255, 0.4)',
      size: size,
    });

    const lookManager = nipplejs.create({
      zone: lookZoneRef.current,
      mode: 'static',
      position: lookPosition,
      color: 'rgba(255, 255, 255, 0.4)',
      size: size,
    });

    moveManagerRef.current = moveManager;
    lookManagerRef.current = lookManager;

    moveManager.on('move', (evt, data) => {
      const forward = data.vector.y;
      const side = data.vector.x;
      setMobileControls({ move: { x: side, y: forward } });
    });

    moveManager.on('start', () => {
      triggerHaptic(20);
    });

    moveManager.on('end', () => {
      setMobileControls({ move: { x: 0, y: 0 } });
    });

    lookManager.on('move', (evt, data) => {
      const sensitivity = 2.0;
      setMobileControls({ look: { x: data.vector.x * sensitivity, y: data.vector.y * sensitivity } });
    });

    lookManager.on('start', () => {
      triggerHaptic(20);
    });

    lookManager.on('end', () => {
      setMobileControls({ look: { x: 0, y: 0 } });
    });

    return () => {
      if (moveManager) moveManager.destroy();
      if (lookManager) lookManager.destroy();
    };
  }, [layout, customButtonPositions]);

  // Handle Dragging in Edit Mode
  const handleDrag = (e: React.MouseEvent | React.TouchEvent, buttonId: string) => {
    if (!isEditMode) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Calculate positions relative to screen dimensions
    const x = Math.min(Math.max(20, clientX), window.innerWidth - 60);
    const y = Math.min(Math.max(20, window.innerHeight - clientY), window.innerHeight - 60);
    
    setCustomButtonPosition(buttonId, x, y, customButtonPositions[buttonId]?.size || 60);
  };

  // Pre-configured Button Layout Styles based on layout presets
  const getButtonPositionStyle = (buttonId: string, defaultStyle: React.CSSProperties): React.CSSProperties => {
    if (layout === 'custom' && customButtonPositions[buttonId]) {
      const pos = customButtonPositions[buttonId];
      return {
        position: 'absolute',
        left: `${pos.x}px`,
        bottom: `${pos.y}px`,
        width: `${pos.size}px`,
        height: `${pos.size}px`,
      };
    }

    if (layout === 'lefthanded') {
      // Swapped left and right
      if (buttonId === 'fire') return { position: 'absolute', left: '40px', bottom: '180px' };
      if (buttonId === 'jump') return { position: 'absolute', left: '120px', bottom: '180px' };
      if (buttonId === 'build') return { position: 'absolute', right: '40px', bottom: '260px' };
      if (buttonId === 'vehicle') return { position: 'absolute', right: '40px', bottom: '190px' };
      if (buttonId === 'reload') return { position: 'absolute', right: '40px', bottom: '120px' };
      if (buttonId === 'sprint') return { position: 'absolute', top: '24px', right: '24px' };
    }

    if (layout === 'compact') {
      if (buttonId === 'fire') return { position: 'absolute', right: '20px', bottom: '130px', scale: '0.85' };
      if (buttonId === 'jump') return { position: 'absolute', right: '85px', bottom: '130px', scale: '0.85' };
      if (buttonId === 'build') return { position: 'absolute', left: '20px', bottom: '210px', scale: '0.85' };
      if (buttonId === 'vehicle') return { position: 'absolute', left: '20px', bottom: '155px', scale: '0.85' };
      if (buttonId === 'reload') return { position: 'absolute', left: '20px', bottom: '100px', scale: '0.85' };
    }

    return defaultStyle;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] select-none">
      {/* Joystick Touch Zones */}
      <div 
        ref={moveZoneRef} 
        className={`absolute bottom-0 left-0 w-1/2 h-1/2 pointer-events-auto touch-none ${isEditMode ? 'bg-blue-500/5 border border-dashed border-blue-400/20' : ''}`}
      />
      <div 
        ref={lookZoneRef} 
        className={`absolute bottom-0 right-0 w-1/2 h-1/2 pointer-events-auto touch-none ${isEditMode ? 'bg-amber-500/5 border border-dashed border-amber-400/20' : ''}`}
      />

      {/* EDIT MODE BUTTON OVERLAYS */}
      {isEditMode && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center pointer-events-auto">
          <div className="bg-zinc-900 border-2 border-amber-400 p-6 rounded-3xl text-center max-w-sm flex flex-col gap-4">
            <h3 className="text-amber-400 font-black uppercase italic text-xl">Drag Buttons to Position</h3>
            <p className="text-[10px] text-white/60 uppercase font-medium">Touch and hold any button to move it. Turn off edit mode to save layout.</p>
            <button 
              onClick={() => {
                setIsEditMode(false);
                triggerHaptic(60);
              }}
              className="py-3 bg-amber-400 text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-all cursor-pointer"
            >
              SAVE LAYOUT
            </button>
          </div>
        </div>
      )}

      {/* Control Configuration Switcher Overlay during lobby */}
      <div className="absolute top-6 right-24 pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => {
            setIsEditMode(!isEditMode);
            useGameStore.setState({ mobileControlsLayout: 'custom' });
            triggerHaptic(50);
          }}
          className={`px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all bg-black/50 ${
            isEditMode ? 'border-amber-400 text-amber-400' : 'border-white/10 text-white/60 hover:text-white'
          }`}
          title="Drag and customized controls"
        >
          <Move size={10} /> {isEditMode ? 'Editing Layout' : 'Customize Layout'}
        </button>
      </div>

      {/* Action Buttons (Right Side) */}
      <div 
        style={getButtonPositionStyle('fire', { position: 'absolute', right: '24px', bottom: '160px' })}
        className="pointer-events-auto z-[120]"
        onTouchStart={(e) => {
          if (isEditMode) {
            setDraggingButton('fire');
          } else {
            setMobileControls({ fire: true });
            triggerHaptic(50);
          }
        }}
        onTouchMove={(e) => isEditMode && handleDrag(e, 'fire')}
        onTouchEnd={() => {
          if (isEditMode) {
            setDraggingButton(null);
          } else {
            setMobileControls({ fire: false });
          }
        }}
      >
        <button 
          className="w-16 h-16 bg-red-500/45 backdrop-blur-xl rounded-full border-2 border-red-500 flex items-center justify-center active:scale-90 active:bg-red-500/70 transition-all touch-none shadow-lg shadow-red-500/35 cursor-pointer"
        >
          <Target className="text-white w-8 h-8" />
        </button>
      </div>
      
      <div 
        style={getButtonPositionStyle('jump', { position: 'absolute', right: '104px', bottom: '160px' })}
        className="pointer-events-auto z-[120]"
        onTouchStart={(e) => {
          if (isEditMode) {
            setDraggingButton('jump');
          } else {
            setMobileControls({ jump: true });
            triggerHaptic(40);
          }
        }}
        onTouchMove={(e) => isEditMode && handleDrag(e, 'jump')}
        onTouchEnd={() => {
          if (isEditMode) {
            setDraggingButton(null);
          } else {
            setMobileControls({ jump: false });
          }
        }}
      >
        <button 
          className="w-16 h-16 bg-blue-500/45 backdrop-blur-xl rounded-full border-2 border-blue-500 flex items-center justify-center active:scale-90 active:bg-blue-500/70 transition-all touch-none shadow-lg shadow-blue-500/35 cursor-pointer"
        >
          <ArrowUp className="text-white w-8 h-8" />
        </button>
      </div>

      {/* Utility Buttons (Left Side) */}
      <div 
        style={getButtonPositionStyle('build', { position: 'absolute', left: '24px', bottom: '260px' })}
        className="pointer-events-auto z-[120]"
        onTouchStart={(e) => {
          if (isEditMode) {
            setDraggingButton('build');
          } else {
            setBuildMode(!isBuildMode);
            triggerHaptic(45);
          }
        }}
        onTouchMove={(e) => isEditMode && handleDrag(e, 'build')}
        onTouchEnd={() => isEditMode && setDraggingButton(null)}
      >
        <button 
          className={`w-14 h-14 ${isBuildMode ? 'bg-emerald-500/70 border-emerald-400' : 'bg-emerald-500/40 border-emerald-500/60'} backdrop-blur-xl rounded-full border-2 flex items-center justify-center active:scale-90 transition-all touch-none shadow-lg shadow-emerald-500/30 cursor-pointer`}
        >
          <Box className="text-white w-7 h-7" />
        </button>
      </div>

      <div 
        style={getButtonPositionStyle('vehicle', { position: 'absolute', left: '24px', bottom: '190px' })}
        className="pointer-events-auto z-[120]"
        onTouchStart={(e) => {
          if (isEditMode) {
            setDraggingButton('vehicle');
          } else {
            setVehicleMenuOpen(!isVehicleMenuOpen);
            triggerHaptic(45);
          }
        }}
        onTouchMove={(e) => isEditMode && handleDrag(e, 'vehicle')}
        onTouchEnd={() => isEditMode && setDraggingButton(null)}
      >
        <button 
          className="w-14 h-14 bg-blue-500/40 backdrop-blur-xl rounded-full border-2 border-blue-500/60 flex items-center justify-center active:scale-90 transition-all touch-none shadow-lg shadow-blue-500/30 cursor-pointer"
        >
          <Car className="text-white w-7 h-7" />
        </button>
      </div>

      <div 
        style={getButtonPositionStyle('reload', { position: 'absolute', left: '24px', bottom: '120px' })}
        className="pointer-events-auto z-[120]"
        onTouchStart={(e) => {
          if (isEditMode) {
            setDraggingButton('reload');
          } else {
            reload();
            triggerHaptic(40);
          }
        }}
        onTouchMove={(e) => isEditMode && handleDrag(e, 'reload')}
        onTouchEnd={() => isEditMode && setDraggingButton(null)}
      >
        <button 
          className="w-14 h-14 bg-amber-500/40 backdrop-blur-xl rounded-full border-2 border-amber-500/60 flex items-center justify-center active:scale-90 transition-all touch-none shadow-lg shadow-amber-500/30 cursor-pointer"
        >
          <RotateCcw className="text-white w-7 h-7" />
        </button>
      </div>

      {/* Sprint Button (Top Left) */}
      <div 
        style={getButtonPositionStyle('sprint', { position: 'absolute', top: '24px', left: '24px' })}
        className="pointer-events-auto z-[120]"
        onTouchStart={(e) => {
          if (isEditMode) {
            setDraggingButton('sprint');
          } else {
            setMobileControls({ sprint: true });
            triggerHaptic(30);
          }
        }}
        onTouchMove={(e) => isEditMode && handleDrag(e, 'sprint')}
        onTouchEnd={() => {
          if (isEditMode) {
            setDraggingButton(null);
          } else {
            setMobileControls({ sprint: false });
          }
        }}
      >
        <button 
          className="px-6 py-2.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest active:bg-white/30 transition-all cursor-pointer shadow-md"
        >
          Sprint
        </button>
      </div>
    </div>
  );
}
