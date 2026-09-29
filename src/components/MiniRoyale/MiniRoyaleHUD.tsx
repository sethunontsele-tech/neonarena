import React, { useEffect, useRef } from 'react';
import { BotOpponent, LootItemData, MiniRoyaleWeapon } from './types';
import { BUILDING_CONFIGS } from './data';

interface MiniRoyaleHUDProps {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  currentWeapon: MiniRoyaleWeapon;
  magAmmo: number;
  reserveAmmo: number;
  kills: number;
  aliveCount: number;
  grenadeCount: number;
  isReloading: boolean;
  reloadProgress: number; // 0 to 1
  isAimLocked: boolean;
  isADS: boolean;
  isCrouching: boolean;
  isSprinting: boolean;
  isOutsideZone: boolean;
  zoneTimerText: string;
  isZoneShrinking: boolean;
  playerPos: [number, number, number];
  playerYaw: number;
  bots: BotOpponent[];
  lootItems: LootItemData[];
  killFeed: { id: string; killer: string; victim: string; weapon: string }[];
  nearestLoot: LootItemData | null;
  onFireStart?: () => void;
  onFireEnd?: () => void;
  onToggleADS?: () => void;
  onJump?: () => void;
  onToggleCrouch?: () => void;
  onToggleSprint?: () => void;
  onReload?: () => void;
  onThrowGrenade?: () => void;
  onPickup?: () => void;
  onSwitchWeapon?: (index: number) => void;
}

export const MiniRoyaleHUD: React.FC<MiniRoyaleHUDProps> = ({
  health,
  maxHealth,
  shield,
  maxShield,
  currentWeapon,
  magAmmo,
  reserveAmmo,
  kills,
  aliveCount,
  grenadeCount,
  isReloading,
  reloadProgress,
  isAimLocked,
  isADS,
  isCrouching,
  isSprinting,
  isOutsideZone,
  zoneTimerText,
  isZoneShrinking,
  playerPos,
  playerYaw,
  bots,
  lootItems,
  killFeed,
  nearestLoot,
  onFireStart,
  onFireEnd,
  onToggleADS,
  onJump,
  onToggleCrouch,
  onToggleSprint,
  onReload,
  onThrowGrenade,
  onPickup,
  onSwitchWeapon,
}) => {
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render Heading-Up Rotating Minimap
  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const mapScale = 0.55; // 1 world unit = 0.55 canvas pixels

    ctx.clearRect(0, 0, w, h);

    // Save context for heading-up rotation
    ctx.save();
    // Rotate canvas around center by -playerYaw so player's look direction is always UP
    ctx.translate(cx, cy);
    ctx.rotate(playerYaw);

    // Grid pattern / radar background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let r = 25; r <= 80; r += 25) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Buildings footprints
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    BUILDING_CONFIGS.forEach(b => {
      const bx = (b.x - playerPos[0]) * mapScale;
      const bz = (b.z - playerPos[2]) * mapScale;
      // Only draw if within minimap range
      if (Math.hypot(bx, bz) < 95) {
        ctx.fillRect(bx - (b.w * mapScale) / 2, bz - (b.d * mapScale) / 2, b.w * mapScale, b.d * mapScale);
      }
    });

    // Draw Loot items (Yellow dots)
    ctx.fillStyle = '#eab308';
    lootItems.forEach(item => {
      if (item.collected) return;
      const lx = (item.x - playerPos[0]) * mapScale;
      const lz = (item.z - playerPos[2]) * mapScale;
      if (Math.hypot(lx, lz) < 85) {
        ctx.beginPath();
        ctx.arc(lx, lz, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Bots (Red pulsing dots)
    const now = Date.now();
    bots.forEach(bot => {
      if (!bot.alive) return;
      const ex = (bot.x - playerPos[0]) * mapScale;
      const ez = (bot.z - playerPos[2]) * mapScale;
      const dist = Math.hypot(ex, ez);
      if (dist < 90) {
        // Closer enemies pulse faster
        const pulseSpeed = Math.max(2, 8 - (dist / 90) * 6);
        const pulse = 0.5 + 0.5 * Math.sin(now * 0.005 * pulseSpeed);
        ctx.fillStyle = `rgba(239, 68, 68, ${0.6 + 0.4 * pulse})`;
        ctx.beginPath();
        ctx.arc(ex, ez, 3 + pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();

    // Draw Fixed Center Player Marker (Green Triangle pointing straight UP)
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx - 5, cy + 6);
    ctx.lineTo(cx, cy + 3);
    ctx.lineTo(cx + 5, cy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // FOV View Cone overlay
    ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 70, -Math.PI / 2 - 0.45, -Math.PI / 2 + 0.45);
    ctx.closePath();
    ctx.fill();
  }, [playerPos, playerYaw, bots, lootItems]);

  // Compass Heading calculation
  const headingDeg = Math.round(((playerYaw * 180) / Math.PI + 360) % 360);
  const getCardinal = (deg: number) => {
    const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return cardinals[Math.round(deg / 45) % 8];
  };

  const isLowAmmo = magAmmo <= Math.ceil(currentWeapon.magSize * 0.25) && magAmmo > 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-[110] select-none overflow-hidden font-sans">
      {/* 1. TOP COMPASS BAR */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1 rounded-full flex items-center gap-2 shadow-lg">
        <span className="text-xs font-mono font-bold text-amber-400">{getCardinal(headingDeg)}</span>
        <span className="text-[11px] font-mono text-white/60">{headingDeg}°</span>
      </div>

      {/* 2. DANGER ZONE TIMER */}
      <div 
        className={`absolute top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded border text-xs font-mono font-bold tracking-wider transition-colors shadow-lg ${
          isZoneShrinking 
            ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse' 
            : 'bg-black/60 border-blue-500/40 text-blue-300'
        }`}
      >
        {zoneTimerText}
      </div>

      {/* OUTSIDE ZONE ALERT */}
      {isOutsideZone && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-950/90 border-2 border-red-500 text-red-100 px-5 py-2 rounded-lg font-black text-sm tracking-widest uppercase animate-bounce shadow-[0_0_25px_rgba(239,68,68,0.8)]">
          ⚠ OUTSIDE SAFE ZONE ⚠
        </div>
      )}

      {/* 3. HEADING-UP ROTATING MINIMAP (Top Right) */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 w-24 h-24 sm:w-36 sm:h-36 rounded-2xl bg-black/75 border-2 border-white/20 backdrop-blur-md overflow-hidden shadow-2xl">
        <canvas 
          ref={minimapCanvasRef} 
          width={144} 
          height={144} 
          className="w-full h-full" 
        />
        {/* Radar glass ring */}
        <div className="absolute inset-0 rounded-2xl border border-cyan-500/30 pointer-events-none" />
      </div>

      {/* 4. KILL FEED (Top Left) */}
      <div className="absolute top-4 left-4 max-w-[280px] space-y-1.5 pointer-events-none">
        {killFeed.map(k => (
          <div 
            key={k.id} 
            className="bg-black/70 border-l-4 border-red-500 px-2.5 py-1 rounded text-[11px] text-white flex items-center gap-1.5 shadow"
          >
            <span className="font-bold text-red-400">{k.killer}</span>
            <span className="text-white/40 text-[9px]">[{k.weapon}]</span>
            <span className="text-white/80">{k.victim}</span>
          </div>
        ))}
      </div>

      {/* 5. FREE FIRE STYLE RETICLE & AIM LOCK INDICATOR */}
      {!isADS && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {/* Default Crosshair */}
          {!isAimLocked ? (
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute w-2 h-0.5 bg-white/80 -left-3" />
              <div className="absolute w-2 h-0.5 bg-white/80 -right-3" />
              <div className="absolute w-0.5 h-2 bg-white/80 -top-3" />
              <div className="absolute w-0.5 h-2 bg-white/80 -bottom-3" />
              <div className="w-1 h-1 rounded-full bg-red-500/80" />
            </div>
          ) : (
            /* Free Fire Red Aim Lock Ring */
            <div className="relative w-12 h-12 flex items-center justify-center animate-pulse">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
              <div className="absolute w-3 h-0.5 bg-red-500 -left-1" />
              <div className="absolute w-3 h-0.5 bg-red-500 -right-1" />
              <div className="absolute w-0.5 h-3 bg-red-500 -top-1" />
              <div className="absolute w-0.5 h-3 bg-red-500 -bottom-1" />
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            </div>
          )}
        </div>
      )}

      {/* Reloading Bar */}
      {isReloading && (
        <div className="absolute top-[56%] left-1/2 -translate-x-1/2 w-32 bg-black/70 border border-white/20 p-1 rounded-full flex flex-col items-center">
          <div className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-0.5">Reloading</div>
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-400 transition-all duration-75"
              style={{ width: `${reloadProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 6. NEAREST LOOT INTERACTION PROMPT */}
      {nearestLoot && !nearestLoot.collected && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-black/80 border border-emerald-500/60 px-4 py-2 rounded-xl text-center shadow-lg backdrop-blur pointer-events-auto">
          <div className="text-xs text-white/50 font-mono">Press [E] or tap Pick</div>
          <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5 justify-center">
            <span>{nearestLoot.emoji}</span>
            <span>{nearestLoot.label}</span>
          </div>
        </div>
      )}

      {/* 7. HEALTH, SHIELD & BATTLE STATUS BARS (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] space-y-2 pointer-events-none">
        {/* Shield Bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-blue-400 w-12">🛡 {shield}</span>
          <div className="flex-1 h-2 bg-black/60 border border-blue-500/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-200"
              style={{ width: `${(shield / maxShield) * 100}%` }}
            />
          </div>
        </div>

        {/* Health Bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-400 w-12">❤ {health}</span>
          <div className="flex-1 h-3 bg-black/60 border border-white/20 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-200 ${
                health > 75 
                  ? 'bg-gradient-to-r from-emerald-600 to-green-400' 
                  : health > 35 
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-400' 
                  : 'bg-gradient-to-r from-red-600 to-rose-400 animate-pulse'
              }`}
              style={{ width: `${(health / maxHealth) * 100}%` }}
            />
          </div>
        </div>

        {/* Match Statistics Pills */}
        <div className="flex items-center justify-between pt-1">
          <div className="bg-black/60 border border-white/10 px-3 py-1 rounded-lg text-xs font-mono text-white/80">
            KILLS <span className="font-bold text-red-400">{kills}</span>
          </div>
          <div className="bg-black/60 border border-white/10 px-3 py-1 rounded-lg text-xs font-mono text-white/80">
            ALIVE <span className="font-bold text-cyan-400">{aliveCount}</span>
          </div>
          <div className="bg-black/60 border border-white/10 px-3 py-1 rounded-lg text-xs font-mono text-white/80">
            💣 <span className="font-bold text-orange-400">{grenadeCount}</span>
          </div>
        </div>
      </div>

      {/* 8. WEAPON & AMMO STATUS (Bottom Right) */}
      <div className="absolute bottom-6 right-4 sm:right-8 bg-black/75 border border-white/15 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col items-end pointer-events-none">
        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">{currentWeapon.name}</div>
        <div className="text-[10px] text-white/40 font-mono tracking-widest">{currentWeapon.mode}</div>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className={`text-2xl font-black font-mono ${isLowAmmo ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {magAmmo}
          </span>
          <span className="text-xs font-mono text-white/40">/{reserveAmmo}</span>
        </div>
      </div>

      {/* 9. MOBILE ACTION BUTTONS (Touch Enabled) */}
      <div className="sm:hidden pointer-events-auto">
        {/* Fire Button */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onFireStart?.(); }}
          onTouchEnd={(e) => { e.preventDefault(); onFireEnd?.(); }}
          className="absolute bottom-28 right-6 w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 border-2 border-white/40 shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-95 text-2xl flex items-center justify-center text-white"
        >
          🔥
        </button>

        {/* ADS Toggle Button */}
        <button
          onClick={onToggleADS}
          className={`absolute bottom-48 right-6 w-12 h-12 rounded-full border border-white/30 text-xs font-bold font-mono text-white backdrop-blur flex items-center justify-center ${
            isADS ? 'bg-blue-600/80 border-blue-400' : 'bg-black/50'
          }`}
        >
          ADS
        </button>

        {/* Jump Button */}
        <button
          onClick={onJump}
          className="absolute bottom-28 right-24 w-12 h-12 rounded-full bg-black/60 border border-white/30 text-white font-bold text-sm flex items-center justify-center backdrop-blur active:scale-90"
        >
          ⬆
        </button>

        {/* Crouch Button */}
        <button
          onClick={onToggleCrouch}
          className={`absolute bottom-44 right-24 w-11 h-11 rounded-full border text-sm flex items-center justify-center backdrop-blur ${
            isCrouching ? 'bg-amber-600/80 border-amber-400 text-white' : 'bg-black/60 border-white/30 text-white/70'
          }`}
        >
          🦆
        </button>

        {/* Sprint Toggle Button */}
        <button
          onClick={onToggleSprint}
          className={`absolute bottom-28 left-28 w-12 h-12 rounded-full border text-base flex items-center justify-center backdrop-blur ${
            isSprinting ? 'bg-cyan-600/80 border-cyan-400 text-white shadow-[0_0_12px_#06b6d4]' : 'bg-black/60 border-white/30 text-white/70'
          }`}
        >
          🏃
        </button>

        {/* Reload Button */}
        <button
          onClick={onReload}
          className="absolute bottom-60 right-6 w-11 h-11 rounded-full bg-black/60 border border-white/30 text-white font-mono font-bold text-xs flex items-center justify-center backdrop-blur"
        >
          R
        </button>

        {/* Grenade Button */}
        <button
          onClick={onThrowGrenade}
          className="absolute bottom-60 right-20 w-11 h-11 rounded-full bg-amber-950/60 border border-orange-500/40 text-base flex items-center justify-center backdrop-blur"
        >
          💣
        </button>

        {/* Pickup Button (when near loot) */}
        {nearestLoot && !nearestLoot.collected && (
          <button
            onClick={onPickup}
            className="absolute bottom-36 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-emerald-600/90 border-2 border-emerald-300 text-xs font-black text-white flex items-center justify-center shadow-lg animate-pulse"
          >
            PICK
          </button>
        )}

        {/* Weapon Switch Strip */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-2">
          {['Pistol', 'AR', 'Shotgun'].map((wName, idx) => (
            <button
              key={wName}
              onClick={() => onSwitchWeapon?.(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                currentWeapon.name.includes(wName) 
                  ? 'bg-amber-500 text-black border-amber-300' 
                  : 'bg-black/70 text-white/70 border-white/20'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
