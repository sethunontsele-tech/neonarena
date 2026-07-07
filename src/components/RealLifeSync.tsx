import React, { useEffect } from 'react';
import { useGameStore } from '../store';
import { syncRealLifeEnvironment } from '../services/WeatherService';

export const RealLifeSync: React.FC = () => {
  const isRealLifeSyncEnabled = useGameStore(state => state.isRealLifeSyncEnabled);

  useEffect(() => {
    if (!isRealLifeSyncEnabled) return;

    syncRealLifeEnvironment();
    const interval = setInterval(syncRealLifeEnvironment, 60000); // Sync every minute

    return () => clearInterval(interval);
  }, [isRealLifeSyncEnabled]);

  return null;
};
