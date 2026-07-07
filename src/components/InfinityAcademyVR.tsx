import React from 'react';
import { InfinityAcademyGame } from './InfinityAcademy/InfinityAcademyGame';
import { useGameStore } from '../store';

export function InfinityAcademyVR() {
  const setGameState = useGameStore(state => state.setGameState);
  
  const handleExitAcademy = () => {
    // Navigate back to the main game lobby
    setGameState('lobby');
  };

  return (
    <div className="absolute inset-0 z-[55] pointer-events-auto">
      <InfinityAcademyGame onBackToLobby={handleExitAcademy} />
    </div>
  );
}

export default InfinityAcademyVR;
