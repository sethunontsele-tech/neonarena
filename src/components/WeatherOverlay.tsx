import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { Thermometer, Wind, CloudRain, Snowflake, AlertOctagon, Sun, Eye } from 'lucide-react';

export function WeatherOverlay() {
  const gameState = useGameStore(state => state.gameState);
  const peWeather = useGameStore(state => state.environment.peWeather);
  const isRealLifeSyncEnabled = useGameStore(state => state.isRealLifeSyncEnabled);
  const [isBlinking, setIsBlinking] = useState(false);

  // Periodic Blink Controller for Windy conditions
  useEffect(() => {
    if (!peWeather || peWeather.condition !== 'windy' || gameState !== 'playing') {
      setIsBlinking(false);
      return;
    }

    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 140); // Standard human blink duration (140 ms)
    };

    // Blink every 3.5 to 6 seconds in PE gale force winds
    const intervalId = setInterval(() => {
      triggerBlink();
    }, 3500 + Math.random() * 2500);

    return () => clearInterval(intervalId);
  }, [peWeather?.condition, gameState]);

  if (gameState !== 'playing' && gameState !== 'open_world') return null;

  const cond = peWeather?.condition ?? 'clear';
  const temp = peWeather?.temp ?? 21;
  const wind = peWeather?.windSpeed ?? 15;
  const desc = peWeather?.description ?? 'Clear over Algoa Bay, Port Elizabeth';

  return (
    <>
      {/* 1. Windy condition: Eye blink visual blackout */}
      {isBlinking && (
        <div className="fixed inset-0 bg-black z-[120] pointer-events-none transition-opacity duration-75" />
      )}

      {/* 2. Rainy condition: Water droplets visual distortion on lens */}
      {cond === 'rainy' && (
        <div className="fixed inset-0 pointer-events-none z-[80] opacity-40 mix-blend-screen bg-cover bg-center pointer-events-none"
             style={{
               backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(56, 189, 248, 0.08), rgba(0, 0, 0, 0)), url("https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=600")'
             }}
        />
      )}

      {/* 3. Hot condition: Wave noise animation overlay */}
      {cond === 'hot' && (
        <div className="fixed inset-0 pointer-events-none z-[80] bg-orange-500/5 mix-blend-color-burn animate-wiggle-heat" />
      )}

      {/* 4. Cold condition: Blue frosty shivering vignette */}
      {cond === 'cold' && (
        <div 
          className="fixed inset-0 pointer-events-none z-[80] transition-all"
          style={{
            boxShadow: 'inset 0 0 120px rgba(56, 189, 248, 0.16)',
            borderColor: 'rgba(56, 189, 248, 0.2)'
          }}
        />
      )}

      {/* 5. Port Elizabeth Weather Terminal HUD Controller */}
      <div className="absolute top-24 right-4 z-[90] bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 p-4 max-w-sm flex flex-col gap-2 font-mono text-xs select-none shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-6 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">PORT ELIZABETH SYNC</span>
          </div>
          <span className="text-[8px] uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
            Live Met System
          </span>
        </div>

        {/* Condition details */}
        <div className="flex items-center gap-3 py-1">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
            {cond === 'hot' && <Sun size={20} className="text-orange-400 animate-spin-slow" />}
            {cond === 'cold' && <Snowflake size={20} className="text-blue-300 animate-pulse" />}
            {cond === 'windy' && <Wind size={20} className="text-cyan-300 animate-pulse" />}
            {cond === 'rainy' && <CloudRain size={20} className="text-sky-400 animate-bounce" />}
            {cond === 'hail' && <AlertOctagon size={20} className="text-red-500 animate-bounce" />}
            {cond === 'clear' && <Sun size={20} className="text-yellow-400" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-black tracking-tight text-white uppercase truncate">
              {cond === 'windy' && '🌬️ GALE WIND ADVISORY'}
              {cond === 'hot' && '🔥 EXTREME HEATWAVE'}
              {cond === 'cold' && '❄️ SHIVERING COLD'}
              {cond === 'rainy' && '☔ DENSE SHOWER SYSTEM'}
              {cond === 'hail' && '⚠️ CRITICAL HAIL ALERT'}
              {cond === 'clear' && '☀️ SUNNY & PLEASANT'}
            </h4>
            <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight mt-0.5">
              {desc}
            </p>
          </div>
        </div>

        {/* Temperature & Wind Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-white/5 text-[10px] text-zinc-400">
          <div className="flex items-center gap-1.5 p-1.5 bg-white/5 rounded-lg border border-white/5">
            <Thermometer size={12} className="text-orange-400" />
            <span>TEMP: <strong className="text-white">{temp}°C</strong></span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white/5 rounded-lg border border-white/5">
            <Wind size={12} className="text-cyan-300" />
            <span>WIND: <strong className="text-white">{wind}km/h</strong></span>
          </div>
        </div>

        {/* Diagnostic Status */}
        <div className="mt-1 space-y-1">
          {cond === 'hot' && (
            <div className="text-[9px] font-bold text-orange-400/80 uppercase tracking-widest">
              ⚠️ Warning: Heat distortion (Screen wiggle) active!
            </div>
          )}
          {cond === 'windy' && (
            <div className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-widest flex items-center gap-1">
              <Eye size={10} className="animate-pulse" />
              ⚠️ Dry winds causing eye blinking!
            </div>
          )}
          {cond === 'cold' && (
            <div className="text-[9px] font-bold text-blue-400/80 uppercase tracking-widest">
              ⚠️ Shivering cold. Camera tremor enabled.
            </div>
          )}
          {cond === 'rainy' && (
            <div className="text-[9px] font-bold text-sky-400/80 uppercase tracking-widest">
              ⚠️ Rain on lens. Look-angle forced down!
            </div>
          )}
          {cond === 'hail' && (
            <div className="text-[9px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">
              🚨 TAKE SHELTER UNDER BLOCKS OR SUFFER TICKING DAMAGE!
            </div>
          )}
        </div>
      </div>
    </>
  );
}
