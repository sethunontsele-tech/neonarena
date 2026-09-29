import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store';

interface ActiveIndicatorDisplay {
  id: string;
  currentAngle: number;
  opacity: number;
  scale: number;
  damageType: 'kinetic' | 'critical' | 'explosive' | 'glitch' | 'hazard';
  amount: number;
  attackerName?: string;
  edgeX: number; // -1 (left) to 1 (right)
  edgeY: number; // -1 (top) to 1 (bottom)
}

export const DirectionalDamageHUD: React.FC = () => {
  const damageIndicators = useGameStore(state => state.damageIndicators);
  const clearExpiredDamageIndicators = useGameStore(state => state.clearExpiredDamageIndicators);

  const [activeDisplays, setActiveDisplays] = useState<ActiveIndicatorDisplay[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let isRunning = true;

    const updateFrame = () => {
      if (!isRunning) return;

      const store = useGameStore.getState();
      const indicators = store.damageIndicators;
      const now = Date.now();
      const { playerPosition, playerRotation } = store;

      let hasExpired = false;
      const nextDisplays: ActiveIndicatorDisplay[] = [];

      for (let i = 0; i < indicators.length; i++) {
        const ind = indicators[i];
        const elapsed = now - ind.timestamp;

        if (elapsed >= ind.duration) {
          hasExpired = true;
          continue;
        }

        // Calculate current angle relative to player view
        let displayAngle = ind.angle;
        if (ind.sourcePos && playerPosition) {
          const dx = ind.sourcePos[0] - playerPosition[0];
          const dz = ind.sourcePos[2] - playerPosition[2];
          // Camera forward and right in Three.js coordinate system
          const forwardDot = dx * (-Math.sin(playerRotation)) + dz * (-Math.cos(playerRotation));
          const rightDot = dx * Math.cos(playerRotation) + dz * (-Math.sin(playerRotation));
          displayAngle = (Math.atan2(rightDot, forwardDot) * 180 / Math.PI + 360) % 360;
        }

        // Non-linear fade curve: fast entry, smooth cubic fade-out
        const progress = elapsed / ind.duration; // 0 to 1
        const entryPop = Math.min(1, elapsed / 60); // 60ms quick pop
        const decay = Math.pow(1 - progress, 1.4);
        const opacity = entryPop * decay;

        // Slight impulse scale
        const scale = 1.0 + Math.max(0, 0.15 * (1 - elapsed / 200));

        // Screen edge directional coordinates:
        // Angle 0 is top (Y = -1), 90 is right (X = 1), 180 is bottom (Y = 1), 270 is left (X = -1)
        const rad = (displayAngle * Math.PI) / 180;
        const edgeX = Math.sin(rad); // sin(0)=0, sin(90)=1, sin(180)=0, sin(270)=-1
        const edgeY = -Math.cos(rad); // -cos(0)=-1(top), -cos(90)=0, -cos(180)=1(bottom), -cos(270)=0

        nextDisplays.push({
          id: ind.id,
          currentAngle: displayAngle,
          opacity,
          scale,
          damageType: ind.damageType || 'kinetic',
          amount: ind.amount,
          attackerName: ind.attackerName,
          edgeX,
          edgeY
        });
      }

      setActiveDisplays(nextDisplays);

      if (hasExpired) {
        clearExpiredDamageIndicators();
      }

      animFrameRef.current = requestAnimationFrame(updateFrame);
    };

    animFrameRef.current = requestAnimationFrame(updateFrame);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [damageIndicators, clearExpiredDamageIndicators]);

  // Expose global test helper for combat testing & demonstration
  useEffect(() => {
    (window as any).__neonTestDamage = (direction: 'front' | 'back' | 'left' | 'right' | 'random' = 'random') => {
      const angles: Record<string, number> = {
        front: 0,
        right: 90,
        back: 180,
        left: 270,
        random: Math.random() * 360
      };
      const angle = angles[direction] ?? (Math.random() * 360);
      useGameStore.getState().takeDamage(24, false, 'COMBAT-TEST-AI', angle);
    };
  }, []);

  if (activeDisplays.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[130] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Edge-of-Screen Perimeter Directional Flares */}
      {activeDisplays.map((disp) => {
        const color = getDamageColor(disp.damageType);
        return (
          <div
            key={`edge-${disp.id}`}
            className="absolute inset-0 transition-opacity pointer-events-none"
            style={{
              opacity: disp.opacity * 0.75,
              background: `radial-gradient(ellipse 70% 30% at ${50 + disp.edgeX * 45}% ${50 + disp.edgeY * 45}%, ${color.glow} 0%, transparent 70%)`
            }}
          />
        );
      })}

      {/* 2. Tactical Reticle Arc Indicators (Centered around Crosshair) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          className="w-[380px] h-[380px] sm:w-[460px] sm:h-[460px] overflow-visible"
          viewBox="-200 -200 400 400"
        >
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur1" />
              <feGaussianBlur stdDeviation="8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="laser-bloom" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Linear gradients for threat arcs */}
            <linearGradient id="kineticGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff0044" stopOpacity="0" />
              <stop offset="20%" stopColor="#ff1744" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="80%" stopColor="#ff1744" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff0044" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="criticalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b91c1c" stopOpacity="0" />
              <stop offset="25%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="75%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="explosiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0" />
              <stop offset="25%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ffedd5" stopOpacity="1" />
              <stop offset="75%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="glitchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="30%" stopColor="#d946ef" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#fbcfe8" stopOpacity="1" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {activeDisplays.map((disp) => {
            const config = getDamageConfig(disp.damageType, disp.amount);
            const r = 145; // Radius of threat ring around reticle
            const halfSpan = config.arcSpanDeg / 2;
            
            // Build curved arc path centered at 0° (top)
            const startAngleRad = ((-90 - halfSpan) * Math.PI) / 180;
            const endAngleRad = ((-90 + halfSpan) * Math.PI) / 180;
            
            const x1 = r * Math.cos(startAngleRad);
            const y1 = r * Math.sin(startAngleRad);
            const x2 = r * Math.cos(endAngleRad);
            const y2 = r * Math.sin(endAngleRad);

            const arcPath = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;

            // Outer thick glow arc
            const rOuter = r + 6;
            const ox1 = rOuter * Math.cos(startAngleRad * 1.05);
            const oy1 = rOuter * Math.sin(startAngleRad * 1.05);
            const ox2 = rOuter * Math.cos(endAngleRad * 1.05);
            const oy2 = rOuter * Math.sin(endAngleRad * 1.05);
            const outerArcPath = `M ${ox1} ${oy1} A ${rOuter} ${rOuter} 0 0 1 ${ox2} ${oy2}`;

            return (
              <g 
                key={disp.id} 
                transform={`rotate(${disp.currentAngle}) scale(${disp.scale})`}
                style={{
                  opacity: disp.opacity,
                  transformOrigin: '0px 0px'
                }}
              >
                {/* Ambient Soft Threat Glow */}
                <path
                  d={outerArcPath}
                  fill="none"
                  stroke={config.ambientColor}
                  strokeWidth="16"
                  strokeLinecap="round"
                  filter="url(#neon-glow)"
                  opacity="0.6"
                />

                {/* Primary Laser Threat Arc */}
                <path
                  d={arcPath}
                  fill="none"
                  stroke={`url(#${config.gradientId})`}
                  strokeWidth={config.strokeWidth}
                  strokeLinecap="round"
                  filter="url(#laser-bloom)"
                />

                {/* High-intensity White Hot Core line */}
                <path
                  d={arcPath}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity={disp.opacity * 0.9}
                />

                {/* Tactical Inward Chevron Arrow Pointing Toward Player Center */}
                <polygon
                  points={`0,${-r + 14} -7,${-r + 26} 7,${-r + 26}`}
                  fill={config.primaryColor}
                  filter="url(#laser-bloom)"
                />
                <polygon
                  points={`0,${-r + 16} -4,${-r + 24} 4,${-r + 24}`}
                  fill="#ffffff"
                />

                {/* Flanking Tick Brackets for Heavy / Critical Hits */}
                {disp.amount >= 25 && (
                  <>
                    <path
                      d={`M ${x1 - 4} ${y1} L ${x1 - 10} ${y1 - 6}`}
                      stroke={config.primaryColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${x2 + 4} ${y2} L ${x2 + 10} ${y2 - 6}`}
                      stroke={config.primaryColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {/* Threat Telemetry Badge for Critical/Explosive Hits */}
                {(disp.damageType === 'critical' || disp.damageType === 'explosive') && (
                  <g transform={`translate(0, ${-r - 18})`}>
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="14"
                      rx="3"
                      fill="#000000"
                      fillOpacity="0.75"
                      stroke={config.primaryColor}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={config.primaryColor}
                      fontSize="9"
                      fontWeight="900"
                      fontFamily="monospace"
                      letterSpacing="0.05em"
                    >
                      -{disp.amount}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Subtle Bottom Center Impact Notification */}
      {activeDisplays.some(d => d.amount >= 30) && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-950/80 border border-red-500/60 px-3 py-1 rounded backdrop-blur-sm shadow-[0_0_15px_rgba(239,68,68,0.4)]">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-[11px] font-mono font-black uppercase text-red-300 tracking-widest">
            Incoming Heavy Fire
          </span>
        </div>
      )}
    </div>
  );
};

// Helper: Color schemes for different threat types
function getDamageColor(type: string): { primary: string; glow: string } {
  switch (type) {
    case 'critical':
      return { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.45)' };
    case 'explosive':
      return { primary: '#f97316', glow: 'rgba(249, 115, 22, 0.45)' };
    case 'glitch':
      return { primary: '#d946ef', glow: 'rgba(217, 70, 239, 0.45)' };
    case 'hazard':
      return { primary: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' };
    default:
      return { primary: '#ff1744', glow: 'rgba(255, 23, 68, 0.4)' };
  }
}

function getDamageConfig(type: string, amount: number) {
  const isHeavy = amount >= 30;
  switch (type) {
    case 'critical':
      return {
        gradientId: 'criticalGrad',
        primaryColor: '#ef4444',
        ambientColor: '#dc2626',
        arcSpanDeg: isHeavy ? 56 : 46,
        strokeWidth: isHeavy ? 9 : 7
      };
    case 'explosive':
      return {
        gradientId: 'explosiveGrad',
        primaryColor: '#f97316',
        ambientColor: '#ea580c',
        arcSpanDeg: 62,
        strokeWidth: 10
      };
    case 'glitch':
      return {
        gradientId: 'glitchGrad',
        primaryColor: '#d946ef',
        ambientColor: '#a855f7',
        arcSpanDeg: 48,
        strokeWidth: 8
      };
    case 'hazard':
      return {
        gradientId: 'explosiveGrad',
        primaryColor: '#eab308',
        ambientColor: '#ca8a04',
        arcSpanDeg: 42,
        strokeWidth: 6
      };
    default:
      return {
        gradientId: 'kineticGrad',
        primaryColor: '#ff1744',
        ambientColor: '#ff003c',
        arcSpanDeg: isHeavy ? 48 : 36,
        strokeWidth: isHeavy ? 8 : 6
      };
  }
}
