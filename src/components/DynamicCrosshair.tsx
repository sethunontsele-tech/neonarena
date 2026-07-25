/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';

export function DynamicCrosshair() {
  const isPlayerMoving = useGameStore(state => state.isPlayerMoving);
  const lastFireTime = useGameStore(state => state.lastFireTime);
  const playerState = useGameStore(state => state.playerState);
  const uiLayoutConfig = useGameStore(state => state.uiLayoutConfig);

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

  if (!uiLayoutConfig.showCrosshair) return null;

  // Configuration parameters
  const { 
    crosshairStyle, 
    crosshairColor, 
    crosshairScale, 
    crosshairGap, 
    crosshairThickness, 
    crosshairOpacity 
  } = uiLayoutConfig;

  // Base spread + movement spread + fire bloom spread
  const spreadMultiplier = 1.0 + (isPlayerMoving ? 0.6 : 0) + (bloom * 1.5);
  const dynamicGap = crosshairGap * (crosshairStyle === 'dynamic' ? spreadMultiplier : 1.0);

  const activeColor = playerState === 'disabled' ? '#ef4444' : crosshairColor;

  return (
    <div 
      className="relative w-24 h-24 flex items-center justify-center pointer-events-none select-none transition-all duration-75"
      style={{
        transform: `scale(${crosshairScale})`,
        opacity: crosshairOpacity
      }}
    >
      {/* Center Dot */}
      <div 
        className="rounded-full shadow-lg"
        style={{ 
          backgroundColor: activeColor,
          width: `${Math.max(2, crosshairThickness + 1)}px`,
          height: `${Math.max(2, crosshairThickness + 1)}px`,
          boxShadow: `0 0 8px ${activeColor}`
        }} 
      />

      {crosshairStyle !== 'dot' && (
        <>
          {/* Top Tick */}
          <div 
            className="absolute shadow transition-all duration-75" 
            style={{ 
              backgroundColor: activeColor,
              width: `${crosshairThickness}px`,
              height: '10px',
              transform: `translateY(-${dynamicGap + 5}px)` 
            }} 
          />
          {/* Bottom Tick */}
          <div 
            className="absolute shadow transition-all duration-75" 
            style={{ 
              backgroundColor: activeColor,
              width: `${crosshairThickness}px`,
              height: '10px',
              transform: `translateY(${dynamicGap + 5}px)` 
            }} 
          />
          {/* Left Tick */}
          <div 
            className="absolute shadow transition-all duration-75" 
            style={{ 
              backgroundColor: activeColor,
              height: `${crosshairThickness}px`,
              width: '10px',
              transform: `translateX(-${dynamicGap + 5}px)` 
            }} 
          />
          {/* Right Tick */}
          <div 
            className="absolute shadow transition-all duration-75" 
            style={{ 
              backgroundColor: activeColor,
              height: `${crosshairThickness}px`,
              width: '10px',
              transform: `translateX(${dynamicGap + 5}px)` 
            }} 
          />
        </>
      )}

      {/* Circle / Ring Overlay */}
      {(crosshairStyle === 'circle' || crosshairStyle === 'ring' || crosshairStyle === 'dynamic') && (
        <div 
          className="absolute rounded-full border border-dashed opacity-50 transition-all duration-75"
          style={{ 
            borderColor: activeColor,
            borderWidth: `${crosshairThickness}px`,
            width: `${dynamicGap * 2.8}px`, 
            height: `${dynamicGap * 2.8}px`,
          }} 
        />
      )}

      {/* Accuracy status text */}
      <div 
        className="absolute top-10 text-[7px] font-mono opacity-60 select-none uppercase tracking-widest text-center whitespace-nowrap"
        style={{ color: activeColor }}
      >
        {isPlayerMoving ? 'UNSTABLE' : 'STEADY'}
      </div>
    </div>
  );
}
