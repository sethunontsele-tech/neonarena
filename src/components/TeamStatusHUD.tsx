import React, { useEffect, useState } from 'react';
import { useGameStore, WEAPONS } from '../store';
import { Activity, Shield, Heart, Zap } from 'lucide-react';

interface Teammate {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  weapon: string;
  ammo: string;
  status: 'EXPLORING' | 'COMBAT' | 'RELOADING' | 'DOWN';
  isBot: boolean;
}

export function TeamStatusHUD() {
  const otherPlayers = useGameStore(state => state.otherPlayers);
  const playerTeam = useGameStore(state => state.team || 'none');
  const gameState = useGameStore(state => state.gameState);

  const [squad, setSquad] = useState<Teammate[]>([]);

  useEffect(() => {
    // 1. Process actual human teammates if available
    const humanTeammates: Teammate[] = Object.values(otherPlayers)
      .filter(p => playerTeam !== 'none' && p.team === playerTeam)
      .map(p => ({
        id: p.id,
        name: p.name || `Player_${p.id.substring(0, 4)}`,
        health: p.health || 100,
        maxHealth: 100,
        weapon: p.weapon ? (WEAPONS[p.weapon]?.name || p.weapon) : 'Assault Rifle',
        ammo: 'Full',
        status: p.health <= 0 ? 'DOWN' : (p.isAttacking ? 'COMBAT' : 'EXPLORING'),
        isBot: false,
      }));

    // 2. If no human teammates or if playing offline against bots, add premium AI squadmates to complete the squad
    if (humanTeammates.length === 0 && gameState === 'playing') {
      // Keep persistent mock bots with slightly fluctuating values to make the HUD feel alive
      const botSquad: Teammate[] = [
        {
          id: 'bot-squad-1',
          name: 'COBALT-SQUAD-01',
          health: 100,
          maxHealth: 100,
          weapon: 'Plasma Rifle',
          ammo: '28 / 30',
          status: 'EXPLORING',
          isBot: true,
        },
        {
          id: 'bot-squad-2',
          name: 'VORTEX-SQUAD-02',
          health: 85,
          maxHealth: 100,
          weapon: 'Laser Sniper',
          ammo: '4 / 5',
          status: 'EXPLORING',
          isBot: true,
        },
        {
          id: 'bot-squad-3',
          name: 'APEX-SQUAD-03',
          health: 45,
          maxHealth: 100,
          weapon: 'Quantum Blade',
          ammo: 'N/A',
          status: 'COMBAT',
          isBot: true,
        }
      ];

      setSquad(botSquad);
    } else {
      setSquad(humanTeammates);
    }
  }, [otherPlayers, playerTeam, gameState]);

  // Periodic squad stats fluctuations for bots to simulate active gameplay
  useEffect(() => {
    const interval = setInterval(() => {
      setSquad(prevSquad => 
        prevSquad.map(member => {
          if (!member.isBot) return member;

          // Random health changes
          let nextHealth = member.health;
          let nextStatus = member.status;
          let nextAmmo = member.ammo;

          if (member.id === 'bot-squad-1') {
            // First bot is steady, occasionally shoots
            if (Math.random() > 0.7) {
              nextStatus = Math.random() > 0.5 ? 'COMBAT' : 'EXPLORING';
              nextAmmo = nextStatus === 'COMBAT' ? '18 / 30' : '30 / 30';
            }
          } else if (member.id === 'bot-squad-2') {
            // Sniper bot
            if (Math.random() > 0.8) {
              nextStatus = 'RELOADING';
              nextAmmo = '0 / 5';
            } else if (member.status === 'RELOADING') {
              nextStatus = 'EXPLORING';
              nextAmmo = '5 / 5';
            }
          } else if (member.id === 'bot-squad-3') {
            // Vanguard melee bot in active combat, health fluctuates
            if (Math.random() > 0.5) {
              const damage = Math.floor(Math.random() * 15) - 5; // Can heal or get hit
              nextHealth = Math.max(10, Math.min(100, member.health - damage));
              nextStatus = nextHealth < 30 ? 'DOWN' : 'COMBAT';
            }
          }

          return {
            ...member,
            health: nextHealth,
            status: nextStatus,
            ammo: nextAmmo,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (gameState !== 'playing' || squad.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 p-4 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md w-72 pointer-events-auto shadow-2xl">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase font-sans">
            TACTICAL SQUAD STATUS
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-400">SYNCED</span>
        </div>
      </div>

      {/* Squad Members */}
      <div className="flex flex-col gap-2.5">
        {squad.map((member) => {
          const isCritical = member.health < 35 && member.status !== 'DOWN';
          const isDown = member.status === 'DOWN' || member.health <= 0;

          return (
            <div 
              key={member.id} 
              className={`flex flex-col gap-1.5 p-2 rounded-lg transition-all duration-300 ${
                isDown 
                  ? 'bg-red-950/20 border border-red-500/20' 
                  : isCritical 
                    ? 'bg-amber-950/20 border border-amber-500/20 animate-pulse' 
                    : 'bg-white/5 border border-white/5 hover:border-white/10'
              }`}
            >
              {/* Member name and status pill */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider ${isDown ? 'text-red-400' : 'text-white'}`}>
                  {member.name}
                </span>
                
                {/* Status Pill */}
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest font-mono ${
                  isDown 
                    ? 'bg-red-500 text-white' 
                    : member.status === 'COMBAT' 
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                      : member.status === 'RELOADING'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {member.status}
                </span>
              </div>

              {/* Health progress bar */}
              <div className="flex items-center gap-2">
                <Heart className={`w-3 h-3 flex-shrink-0 ${isDown ? 'text-red-500' : isCritical ? 'text-amber-500' : 'text-emerald-400'}`} />
                <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      isDown 
                        ? 'bg-red-600' 
                        : isCritical 
                          ? 'bg-gradient-to-r from-amber-500 to-red-500' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${member.health}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-white/70 w-8 text-right">
                  {isDown ? '0' : member.health}%
                </span>
              </div>

              {/* Weapon and Ammo Row */}
              <div className="flex items-center justify-between text-[9px] font-mono text-white/50 border-t border-white/5 pt-1 mt-0.5">
                <span className="truncate max-w-[130px]" title={member.weapon}>
                  🔫 {member.weapon}
                </span>
                <span>
                  🔋 {member.ammo}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
