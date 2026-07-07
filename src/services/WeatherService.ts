import { useGameStore, WeatherType } from '../store';

export const mapWeatherCode = (code: number): WeatherType => {
  if (code === 0) return 'clear';
  if (code >= 1 && code <= 3) return 'clear';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 86) return 'rain';
  if (code >= 95) return 'storm';
  return 'clear';
};

export const fetchPortElizabethWeather = async () => {
  const store = useGameStore.getState();
  try {
    // Port Elizabeth, South Africa coordinates: Latitude: -33.9608, Longitude: 25.6022
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=-33.9573&longitude=25.6022&current_weather=true`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error('Port Elizabeth Meteorological service unavailable');
    
    const data = await res.json();
    const cw = data.current_weather;
    if (cw) {
      const temp = cw.temperature;
      const windSpeed = cw.windspeed;
      const weatherCode = cw.weathercode ?? 0;

      let condition: 'hot' | 'windy' | 'cold' | 'rainy' | 'hail' | 'clear' = 'clear';
      let description = 'Sunny and breezy over Algoa Bay, Port Elizabeth';

      // Advanced Port Elizabeth weather parsing rule mapping
      if (weatherCode >= 95 || weatherCode === 75 || weatherCode === 77 || weatherCode === 86) {
        condition = 'hail';
        description = 'Severe thunder & Hail advisory in Port Elizabeth!';
      } else if (weatherCode >= 51 && weatherCode <= 82) {
        condition = 'rainy';
        description = 'Rainy showers wetting Baakens Valley, Port Elizabeth';
      } else if (temp >= 26) {
        condition = 'hot';
        description = 'Sultry summer heatwave across Port Elizabeth beaches';
      } else if (windSpeed > 18) {
        condition = 'windy';
        description = 'Gale force winds roaring in PE (The Windy City)';
      } else if (temp <= 14) {
        condition = 'cold';
        description = 'Frosty shivering temperatures cooling beachfront streets';
      } else {
        condition = 'clear';
        description = 'Spectacular pleasant day in Port Elizabeth';
      }

      // Also set the general environment state weather dynamically if it's currently on PE simulation
      let generalWeather: WeatherType = 'clear';
      if (condition === 'rainy') generalWeather = 'rain';
      else if (condition === 'hail') generalWeather = 'storm';
      else if (condition === 'cold') generalWeather = 'snow';

      store.updateEnvironment({
        weather: generalWeather,
        peWeather: {
          temp,
          windSpeed,
          condition,
          description
        }
      });
      console.debug('Port Elizabeth Weather synced successfully:', { temp, windSpeed, condition, description });
    }
  } catch (err) {
    console.debug('Port Elizabeth online weather forecast timed out/unavailable. Using premium offline fallback.', err);
    // Dynamic simulated coastal weather for Port Elizabeth fallback to gracefully prevent failures
    const hr = new Date().getHours();
    const isDay = hr >= 6 && hr <= 18;
    const temp = isDay ? 20.5 : 14.8;
    const windSpeed = 16.5; // Steady windy city breeze
    const condition = 'clear';
    const description = 'Fresh breezy dynamic coastal conditions over Algoa Bay, Port Elizabeth (Simulated Fallback)';

    store.updateEnvironment({
      weather: 'clear',
      peWeather: {
        temp,
        windSpeed,
        condition,
        description
      }
    });
  }
};

export const syncRealLifeEnvironment = async () => {
  const store = useGameStore.getState();
  if (!store.isRealLifeSyncEnabled) return;

  const now = new Date();
  const time = now.getHours() + now.getMinutes() / 60;
  const date = now.toLocaleDateString();

  store.updateEnvironment({ time, date });

  // Always sync Port Elizabeth Real-time weather as well!
  await fetchPortElizabethWeather();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (!response.ok) throw new Error('Weather API response not OK');
          const data = await response.json();
          const weatherCode = data.current_weather?.weathercode ?? 0;
          const weather = mapWeatherCode(weatherCode);
          
          // Only update general if we didn't force PE overriding sync
          if (store.environment.weather !== weather) {
            store.updateEnvironment({ weather });
          }
        } catch (err) {
          console.debug('Weather sync via geolocation failed:', err);
          fetchDefaultWeather();
        }
      },
      (error) => {
        console.debug('Geolocation access denied or failed, using default:', error);
        fetchDefaultWeather();
      },
      { timeout: 10000 }
    );
  } else {
    fetchDefaultWeather();
  }
};

export const startEnvironmentSync = () => {
  syncRealLifeEnvironment();
  const interval = setInterval(syncRealLifeEnvironment, 300000); // Sync every 5 minutes instead of 1
  return () => clearInterval(interval);
};

let lastFetchFailed = false;

const fetchDefaultWeather = async () => {
  const store = useGameStore.getState();
  if (!store.isRealLifeSyncEnabled) return;

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current_weather=true`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) throw new Error('Default weather API response not OK');
    const data = await response.json();
    const weatherCode = data.current_weather?.weathercode ?? 0;
    const weather = mapWeatherCode(weatherCode);
    if (!store.environment.peWeather && store.environment.weather !== weather) {
      store.updateEnvironment({ weather });
    }
    lastFetchFailed = false;
  } catch (err) {
    if (!lastFetchFailed) {
      console.warn('Weather fetch failed. Using last known or default (clear).');
      lastFetchFailed = true;
    }
    // Fallback to clear if not set
    if (!store.environment.weather) {
      store.updateEnvironment({ weather: 'clear' });
    }
  }
};
