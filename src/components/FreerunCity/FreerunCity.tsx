import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import {
  ParkourAction,
  ViewMode,
  WeatherType,
  TimeOfDay,
  CharacterOutfit,
  PhotoSettings,
  ReplayKeyframe,
  CustomMap,
  CollectibleItem,
  ChallengeDefinition,
  NetworkRunner,
  MultiplayerMode,
} from './types';
import { freerunAudio } from './FreerunAudioEngine';
import { FreerunComboEngine, TRICK_CATALOG } from './FreerunComboSystem';
import { FreerunCityMap } from './FreerunCityMap';
import { FreerunCharacter3D } from './FreerunCharacter3D';
import { FreerunMultiplayer } from './FreerunMultiplayer';
import { FreerunLevelEditor } from './FreerunLevelEditor';
import { FreerunReplayPhotoMode } from './FreerunReplayPhotoMode';
import { FreerunCustomization } from './FreerunCustomization';
import { FreerunCommunityHub, PRESET_COMMUNITY_MAPS } from './FreerunCommunityHub';
import { FreerunHUD, CITY_CHALLENGES } from './FreerunHUD';

interface FreerunCityProps {
  onReturnToLobby: () => void;
}

// Initial default outfit
const DEFAULT_OUTFIT: CharacterOutfit = {
  topType: 'hoodie',
  topColor: '#0f172a',
  topAccent: '#06b6d4',
  pantsType: 'cargo_joggers',
  pantsColor: '#1e293b',
  shoesType: 'kinetic_sneakers',
  shoesColor: '#06b6d4',
  headwear: 'cyber_visor',
  headwearColor: '#09090b',
  backAccessory: 'street_backpack',
  backColor: '#334155',
  neonTrail: 'cyan_lightning',
};

// Initial Collectibles scattered in exciting trick spots
const INITIAL_COLLECTIBLES: CollectibleItem[] = [
  { id: 'col_1', name: 'Apex Spire Crown Datashard', type: 'datashard', position: [0, 131, 0], points: 500, collected: false, hint: 'Highest needle tip in the city', description: 'Hidden at the summit of the Apex Megatower' },
  { id: 'col_2', name: 'Titan Crane Jib Shard', type: 'datashard', position: [-60, 74, -45], points: 400, collected: false, hint: 'Tip of the yellow construction crane', description: 'A daring narrow beam run over the chasm' },
  { id: 'col_3', name: 'Zenith Garden Golden Spray', type: 'spray_can', position: [0, 42, -85], points: 300, collected: false, hint: 'Inside the rooftop pergola garden', description: 'Under the neon cherry blossom foliage' },
  { id: 'col_4', name: 'Emerald Loft Quantum Orb', type: 'quantum_orb', position: [65, 30, -15], points: 450, collected: false, hint: 'Suspended above the solar array', description: 'Vault over the solar battery banks' },
  { id: 'col_5', name: 'Subway Maintenance Shard', type: 'datashard', position: [0, -2, 115], points: 350, collected: false, hint: 'Subterranean metro transit tube', description: 'In the lower cyber subway plaza' },
  { id: 'col_6', name: 'Crimson Tech Helipad Shard', type: 'datashard', position: [-25, 73, 50], points: 400, collected: false, hint: 'Helipad boundary railing', description: 'High above the southern district' },
];

export function FreerunCity({ onReturnToLobby }: FreerunCityProps) {
  // Master Submode
  const [subMode, setSubMode] = useState<'play' | 'editor' | 'replay' | 'customization' | 'community'>('play');

  // Player Kinematics & Physics State
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([-35, 46, -50]);
  const [playerRot, setPlayerRot] = useState<number>(0);
  const [action, setAction] = useState<ParkourAction>('idle');
  const [velocity, setVelocity] = useState<[number, number, number]>([0, 0, 0]);
  const [isGrounded, setIsGrounded] = useState<boolean>(true);
  const [speedMps, setSpeedMps] = useState<number>(0);
  const [bailTimer, setBailTimer] = useState<number>(0);

  // Settings & Optics
  const [viewMode, setViewMode] = useState<ViewMode>('third_person');
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('sunset');
  const [outfit, setOutfit] = useState<CharacterOutfit>(DEFAULT_OUTFIT);

  // Combo Engine
  const comboEngineRef = useRef<FreerunComboEngine | null>(null);
  const [comboState, setComboState] = useState(() => new FreerunComboEngine().state);
  const [playerStats, setPlayerStats] = useState(() => new FreerunComboEngine().stats);

  // Collectibles & Challenges
  const [collectibles, setCollectibles] = useState<CollectibleItem[]>(INITIAL_COLLECTIBLES);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeDefinition | null>(null);
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState<number>(0);
  const [challengeTimer, setChallengeTimer] = useState<number>(0);

  // Custom Map Creator State
  const [currentCustomMap, setCurrentCustomMap] = useState<CustomMap>(PRESET_COMMUNITY_MAPS[0]);

  // Replay Ring Buffer
  const replayBufferRef = useRef<ReplayKeyframe[]>([]);
  const [replayPlaybackTime, setReplayPlaybackTime] = useState<number>(0);
  const [isReplayPlaying, setIsReplayPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [photoSettings, setPhotoSettings] = useState<PhotoSettings>({
    fov: 75,
    dof: 0,
    tilt: 0,
    filter: 'none',
    freeCam: false,
    hideHUD: false,
    vignette: false,
  });

  // Multiplayer session
  const [multiplayerMode, setMultiplayerMode] = useState<MultiplayerMode>('free_roam');
  const [networkRunners, setNetworkRunners] = useState<NetworkRunner[]>([
    { id: 'bot_1', name: 'Zephyr_Traceur', color: '#06b6d4', trailColor: '#06b6d4', position: [-20, 65, 0], rotation: 0, action: 'run', score: 12400, currentCombo: 3, isIt: false, outfit: { hoodieColor: '#0f172a', pantsColor: '#1e293b', shoesColor: '#06b6d4', hasVisor: true } },
    { id: 'bot_2', name: 'Apex_Viper', color: '#ef4444', trailColor: '#ef4444', position: [30, 50, -50], rotation: 0, action: 'vault', score: 18900, currentCombo: 5, isIt: true, outfit: { hoodieColor: '#ef4444', pantsColor: '#09090b', shoesColor: '#f59e0b', hasVisor: false } },
    { id: 'bot_3', name: 'EchoRunner', color: '#10b981', trailColor: '#10b981', position: [0, 40, -85], rotation: 0, action: 'wallrun_left', score: 9800, currentCombo: 2, isIt: false, outfit: { hoodieColor: '#064e3b', pantsColor: '#18181b', shoesColor: '#10b981', hasVisor: true } },
    { id: 'bot_4', name: 'NovaGlider', color: '#a855f7', trailColor: '#a855f7', position: [70, 35, 25], rotation: 0, action: 'frontflip', score: 14500, currentCombo: 4, isIt: false, outfit: { hoodieColor: '#312e81', pantsColor: '#1e293b', shoesColor: '#ec4899', hasVisor: false } },
  ]);

  // Input Key Tracking
  const keysRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Initialize combo engine
    comboEngineRef.current = new FreerunComboEngine((cState, pStats) => {
      setComboState(cState);
      setPlayerStats(pStats);
    });

    // Start dynamic procedural breakbeat music
    freerunAudio.startDynamicMusic();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      // Quick shortcuts
      if (e.code === 'KeyV') {
        setViewMode(v => v === 'third_person' ? 'first_person' : 'third_person');
      }
      if (e.code === 'KeyP') {
        setSubMode(m => m === 'replay' ? 'play' : 'replay');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      freerunAudio.stopDynamicMusic();
    };
  }, []);

  // Challenge Start/Cancel Handlers
  const handleStartChallenge = (ch: ChallengeDefinition) => {
    setActiveChallenge(ch);
    setActiveCheckpointIndex(0);
    setChallengeTimer(0);
    setPlayerPos([...ch.startPos]);
    freerunAudio.playCollectible();
  };

  const handleCancelChallenge = () => {
    setActiveChallenge(null);
    setActiveCheckpointIndex(0);
    setChallengeTimer(0);
  };

  // Collectible pickup check
  const checkCollectiblePickup = useCallback((currentPos: [number, number, number]) => {
    collectibles.forEach(item => {
      if (item.collected) return;
      const dist = Math.sqrt(
        (item.position[0] - currentPos[0]) ** 2 +
        (item.position[1] - currentPos[1]) ** 2 +
        (item.position[2] - currentPos[2]) ** 2
      );
      if (dist < 3.2) {
        setCollectibles(prev => prev.map(c => c.id === item.id ? { ...c, collected: true } : c));
        freerunAudio.playCollectible();
        comboEngineRef.current?.registerTrick('clean_roll', 14);
        comboEngineRef.current?.addXP(item.points);
      }
    });
  }, [collectibles]);

  // Mobile Action Helper
  const handleMobileAction = (type: 'jump' | 'vault' | 'slide' | 'flip' | 'dash') => {
    if (type === 'jump') {
      keysRef.current['Space'] = true;
      setTimeout(() => { keysRef.current['Space'] = false; }, 200);
    } else if (type === 'vault') {
      comboEngineRef.current?.registerTrick('sprint_vault', 14);
      setAction('vault');
      freerunAudio.playVault();
      setTimeout(() => setAction('run'), 400);
    } else if (type === 'slide') {
      comboEngineRef.current?.registerTrick('power_slide', 15);
      setAction('slide');
      setTimeout(() => setAction('run'), 600);
    } else if (type === 'flip') {
      comboEngineRef.current?.registerTrick('frontflip', 18);
      setAction('frontflip');
      setTimeout(() => setAction('run'), 700);
    } else if (type === 'dash') {
      comboEngineRef.current?.registerTrick('air_dash', 20);
      setAction('air_dash');
      freerunAudio.playAirDash();
      setTimeout(() => setAction('run'), 350);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* 3D R3F CANVAS */}
      <Canvas
        camera={{ position: [-35, 52, -40], fov: photoSettings.fov }}
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <FreerunPhysicsWorld
          keysRef={keysRef}
          playerPos={playerPos}
          setPlayerPos={setPlayerPos}
          playerRot={playerRot}
          setPlayerRot={setPlayerRot}
          action={action}
          setAction={setAction}
          velocity={velocity}
          setVelocity={setVelocity}
          isGrounded={isGrounded}
          setIsGrounded={setIsGrounded}
          setSpeedMps={setSpeedMps}
          bailTimer={bailTimer}
          setBailTimer={setBailTimer}
          comboEngine={comboEngineRef.current}
          replayBufferRef={replayBufferRef}
          viewMode={viewMode}
          photoSettings={photoSettings}
          subMode={subMode}
          checkCollectiblePickup={checkCollectiblePickup}
          activeChallenge={activeChallenge}
          activeCheckpointIndex={activeCheckpointIndex}
          setActiveCheckpointIndex={setActiveCheckpointIndex}
          challengeTimer={challengeTimer}
          setChallengeTimer={setChallengeTimer}
        />

        {/* CITY ENVIRONMENT */}
        <FreerunCityMap
          weather={weather}
          timeOfDay={timeOfDay}
          collectibles={collectibles}
          activeCheckpointIndex={activeCheckpointIndex}
          currentChallengeCheckpoints={activeChallenge?.checkpoints}
        />

        {/* PLAYER 3D CHARACTER */}
        <group position={playerPos} rotation={[0, playerRot, 0]}>
          <FreerunCharacter3D
            action={action}
            velocity={velocity}
            isGrounded={isGrounded}
            outfit={outfit}
            viewMode={viewMode}
            isFlowStateActive={comboState.isFlowStateActive}
            bailTimer={bailTimer}
          />
        </group>

        {/* MULTIPLAYER RUNNERS */}
        <FreerunMultiplayer
          runners={networkRunners}
          mode={multiplayerMode}
          playerPosition={playerPos}
          onPlayerTagged={() => {
            // Player was tagged in Tag Mode!
            freerunAudio.playBail();
            setNetworkRunners(prev => prev.map(r => ({ ...r, isIt: !r.isIt })));
          }}
        />
      </Canvas>

      {/* OVERLAY HUD (WHEN IN GAMEPLAY) */}
      {subMode === 'play' && (
        <FreerunHUD
          speedMps={speedMps}
          comboState={comboState}
          playerStats={playerStats}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(v => v === 'third_person' ? 'first_person' : 'third_person')}
          weather={weather}
          onChangeWeather={setWeather}
          timeOfDay={timeOfDay}
          onChangeTimeOfDay={setTimeOfDay}
          onOpenReplayPhoto={() => setSubMode('replay')}
          onOpenLevelEditor={() => setSubMode('editor')}
          onOpenCommunityHub={() => setSubMode('community')}
          onOpenCustomization={() => setSubMode('customization')}
          onExitFreerun={onReturnToLobby}
          activeChallenge={activeChallenge}
          onStartChallenge={handleStartChallenge}
          onCancelChallenge={handleCancelChallenge}
          challengeTimer={challengeTimer}
          collectibles={collectibles}
          multiplayerMode={multiplayerMode}
          onChangeMultiplayerMode={setMultiplayerMode}
          onMobileAction={handleMobileAction}
        />
      )}

      {/* LEVEL EDITOR STUDIO */}
      {subMode === 'editor' && (
        <FreerunLevelEditor
          currentMap={currentCustomMap}
          onUpdateMap={setCurrentCustomMap}
          onTestPlay={() => setSubMode('play')}
          onExitEditor={() => setSubMode('play')}
          onPublishMap={(map) => {
            alert(`"${map.title}" published to Neon Arena Community Hub!`);
            setSubMode('community');
          }}
        />
      )}

      {/* REPLAY & PHOTO STUDIO */}
      {subMode === 'replay' && (
        <FreerunReplayPhotoMode
          keyframes={replayBufferRef.current}
          photoSettings={photoSettings}
          onUpdatePhotoSettings={setPhotoSettings}
          onClose={() => setSubMode('play')}
          onScrubTimestamp={(ts) => setReplayPlaybackTime(ts)}
          currentPlaybackTime={replayPlaybackTime}
          isPlaying={isReplayPlaying}
          onTogglePlay={() => setIsReplayPlaying(p => !p)}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
        />
      )}

      {/* CHARACTER WARDROBE CUSTOMIZATION */}
      {subMode === 'customization' && (
        <FreerunCustomization
          outfit={outfit}
          onUpdateOutfit={setOutfit}
          onClose={() => setSubMode('play')}
        />
      )}

      {/* COMMUNITY HUB */}
      {subMode === 'community' && (
        <FreerunCommunityHub
          onPlayMap={(map) => {
            setCurrentCustomMap(map);
            setPlayerPos([...map.spawnPoint]);
            setSubMode('play');
          }}
          onClose={() => setSubMode('play')}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// INTERNAL PHYSICS & KINEMATICS LOOP
// -------------------------------------------------------------

interface PhysicsWorldProps {
  keysRef: React.MutableRefObject<{ [key: string]: boolean }>;
  playerPos: [number, number, number];
  setPlayerPos: React.Dispatch<React.SetStateAction<[number, number, number]>>;
  playerRot: number;
  setPlayerRot: React.Dispatch<React.SetStateAction<number>>;
  action: ParkourAction;
  setAction: React.Dispatch<React.SetStateAction<ParkourAction>>;
  velocity: [number, number, number];
  setVelocity: React.Dispatch<React.SetStateAction<[number, number, number]>>;
  isGrounded: boolean;
  setIsGrounded: React.Dispatch<React.SetStateAction<boolean>>;
  setSpeedMps: React.Dispatch<React.SetStateAction<number>>;
  bailTimer: number;
  setBailTimer: React.Dispatch<React.SetStateAction<number>>;
  comboEngine: FreerunComboEngine | null;
  replayBufferRef: React.MutableRefObject<ReplayKeyframe[]>;
  viewMode: ViewMode;
  photoSettings: PhotoSettings;
  subMode: string;
  checkCollectiblePickup: (pos: [number, number, number]) => void;
  activeChallenge: ChallengeDefinition | null;
  activeCheckpointIndex: number;
  setActiveCheckpointIndex: React.Dispatch<React.SetStateAction<number>>;
  challengeTimer: number;
  setChallengeTimer: React.Dispatch<React.SetStateAction<number>>;
}

function FreerunPhysicsWorld({
  keysRef,
  playerPos,
  setPlayerPos,
  playerRot,
  setPlayerRot,
  action,
  setAction,
  velocity,
  setVelocity,
  isGrounded,
  setIsGrounded,
  setSpeedMps,
  bailTimer,
  setBailTimer,
  comboEngine,
  replayBufferRef,
  viewMode,
  photoSettings,
  subMode,
  checkCollectiblePickup,
  activeChallenge,
  activeCheckpointIndex,
  setActiveCheckpointIndex,
  challengeTimer,
  setChallengeTimer,
}: PhysicsWorldProps) {
  const { camera } = useThree();
  const stepTimerRef = useRef(0);

  useFrame((state, delta) => {
    if (subMode !== 'play') return;

    // Delta clamp
    const dt = Math.min(delta, 0.1);
    const keys = keysRef.current;

    // Bail Recovery countdown
    if (bailTimer > 0) {
      setBailTimer(t => Math.max(0, t - dt));
      return;
    }

    // Direction input
    let moveX = 0;
    let moveZ = 0;
    if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

    const isMoving = moveX !== 0 || moveZ !== 0;
    const isSprinting = !!keys['ShiftLeft'] || !!keys['ShiftRight'];

    // Movement speed tuning
    const baseSpeed = isSprinting ? 15 : 9;
    const flowMultiplier = (comboEngine?.state.flowState || 0) > 70 ? 1.25 : 1.0;
    const targetSpeed = baseSpeed * flowMultiplier;

    // Camera heading
    const camAngle = camera.rotation.y;
    let worldMoveX = 0;
    let worldMoveZ = 0;

    if (isMoving) {
      const inputAngle = Math.atan2(moveX, -moveZ);
      const moveAngle = camAngle + inputAngle;
      worldMoveX = Math.sin(moveAngle) * targetSpeed;
      worldMoveZ = -Math.cos(moveAngle) * targetSpeed;
      setPlayerRot(moveAngle);
    }

    // Velocity Lerp
    let vx = THREE.MathUtils.lerp(velocity[0], worldMoveX, 0.18);
    let vz = THREE.MathUtils.lerp(velocity[2], worldMoveZ, 0.18);
    let vy = velocity[1] - 32 * dt; // Gravity

    // JUMP & TRICK TRIGGERS
    if (keys['Space'] && isGrounded) {
      vy = 12.5;
      setIsGrounded(false);
      setAction('jump');
      freerunAudio.playJump();
      comboEngine?.registerTrick('dash_vault', Math.sqrt(vx ** 2 + vz ** 2));
    }

    // SLIDE
    if ((keys['KeyC'] || keys['ControlLeft']) && isGrounded && isSprinting) {
      setAction('slide');
      vx *= 1.35;
      vz *= 1.35;
      freerunAudio.playVault();
      comboEngine?.registerTrick('power_slide', 16);
    }

    // AIR FLIPS (Q / E in mid-air)
    if (!isGrounded) {
      if (keys['KeyQ'] && action !== 'frontflip') {
        setAction('frontflip');
        comboEngine?.registerTrick('frontflip', 18);
      } else if (keys['KeyE'] && action !== 'backflip') {
        setAction('backflip');
        comboEngine?.registerTrick('backflip', 18);
      } else if (keys['KeyF']) {
        // Air Dash
        vx *= 1.8;
        vz *= 1.8;
        vy = 2;
        setAction('air_dash');
        freerunAudio.playAirDash();
        comboEngine?.registerTrick('air_dash', 22);
      }
    }

    // Position integration
    let nextX = playerPos[0] + vx * dt;
    let nextY = playerPos[1] + vy * dt;
    let nextZ = playerPos[2] + vz * dt;

    // ROOFTOP COLLISION DETECTION
    // Determine highest roof under player
    let floorY = 0;
    // Central Apex Spire roof (height ~130)
    if (Math.abs(nextX) < 14 && Math.abs(nextZ) < 14) floorY = 130;
    // North Vanguard (height ~90)
    else if (Math.abs(nextX - (-35)) < 12 && Math.abs(nextZ - (-50)) < 12) floorY = 90;
    // Horizon Center (height ~100)
    else if (Math.abs(nextX - 35) < 12 && Math.abs(nextZ - (-50)) < 13) floorY = 100;
    // Zenith Garden (height ~80)
    else if (Math.abs(nextX) < 16 && Math.abs(nextZ - (-85)) < 12) floorY = 80;
    // Titan Crane (height ~84)
    else if (Math.abs(nextX - (-75)) < 13 && Math.abs(nextZ - (-45)) < 13) floorY = 84;
    // Emerald Loft (height ~56)
    else if (Math.abs(nextX - 65) < 12 && Math.abs(nextZ - (-15)) < 14) floorY = 56;
    // Crimson Tech (height ~72)
    else if (Math.abs(nextX - (-25)) < 13 && Math.abs(nextZ - 50) < 13) floorY = 72;
    // Neon Metro Plaza (height ~50)
    else if (Math.abs(nextX) < 17 && Math.abs(nextZ - 90) < 13) floorY = 50;
    // Mid tier connector buildings (height ~48)
    else if (Math.abs(nextX - (-38)) < 9 && Math.abs(nextZ - (-10)) < 10) floorY = 48;
    else if (Math.abs(nextX - 38) < 9 && Math.abs(nextZ - (-12)) < 10) floorY = 50;
    else if (Math.abs(nextX) < 8 && Math.abs(nextZ - 115) < 10) floorY = -2; // Subway pit

    if (nextY <= floorY) {
      nextY = floorY;
      vy = 0;
      if (!isGrounded) {
        setIsGrounded(true);
        // Landing audio
        freerunAudio.playLanding(false, isSprinting);
        if (action === 'jump' || action === 'frontflip' || action === 'backflip') {
          comboEngine?.registerTrick('precision_landing', 12);
        }
      }
      if (isMoving) {
        setAction(isSprinting ? 'sprint' : 'run');
      } else if (action !== 'slide') {
        setAction('idle');
      }
    } else {
      setIsGrounded(false);
    }

    // Footstep audio cadence
    if (isGrounded && isMoving) {
      stepTimerRef.current += dt;
      const stepInterval = isSprinting ? 0.28 : 0.42;
      if (stepTimerRef.current >= stepInterval) {
        stepTimerRef.current = 0;
        freerunAudio.playFootstep(isSprinting);
      }
    }

    // Wall-Run Detection (alongside vertical facade)
    const distFromCenter = Math.sqrt(nextX ** 2 + nextZ ** 2);
    if (!isGrounded && Math.abs(distFromCenter - 14) < 1.2 && vy > -10) {
      setAction('wallrun_left');
      vy = -1.5; // Wall glide
      freerunAudio.playWallrun();
      comboEngine?.registerTrick('wallrun_left', 16);
    }

    // Update state
    setPlayerPos([nextX, nextY, nextZ]);
    setVelocity([vx, vy, vz]);
    const currentSpeed = Math.sqrt(vx ** 2 + vz ** 2);
    setSpeedMps(currentSpeed);

    // Update combo system
    comboEngine?.update(dt, currentSpeed);

    // Check Collectibles
    checkCollectiblePickup([nextX, nextY, nextZ]);

    // Check Active Challenge progress
    if (activeChallenge && activeChallenge.checkpoints.length > 0) {
      setChallengeTimer(t => t + dt);
      const targetCp = activeChallenge.checkpoints[activeCheckpointIndex];
      if (targetCp) {
        const distToCp = Math.sqrt(
          (nextX - targetCp[0]) ** 2 +
          (nextY - targetCp[1]) ** 2 +
          (nextZ - targetCp[2]) ** 2
        );
        if (distToCp < 6.0) {
          freerunAudio.playCollectible();
          if (activeCheckpointIndex + 1 < activeChallenge.checkpoints.length) {
            setActiveCheckpointIndex(i => i + 1);
          } else {
            // Challenge Completed!
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            comboEngine?.addXP(activeChallenge.rewardXP);
            alert(`🎉 Challenge Completed! Earned +${activeChallenge.rewardXP.toLocaleString()} XP!`);
          }
        }
      }
    }

    // Record into Replay Buffer (every 0.05s)
    if (Math.random() < 0.4) {
      replayBufferRef.current.push({
        timestamp: Date.now(),
        position: [nextX, nextY, nextZ],
        rotation: [0, playerRot, 0],
        action,
        trickName: comboEngine?.state.lastTrickName || '',
        comboMultiplier: comboEngine?.state.multiplier || 1.0,
        flowState: comboEngine?.state.flowState || 0,
      });
      if (replayBufferRef.current.length > 600) {
        replayBufferRef.current.shift();
      }
    }

    // Dynamic Camera Follow / View Mode
    if (viewMode === 'first_person') {
      camera.position.set(nextX, nextY + 1.6, nextZ);
    } else {
      // Third-person smooth orbit
      const targetCamX = nextX - Math.sin(playerRot) * 6.5;
      const targetCamZ = nextZ - Math.cos(playerRot) * 6.5;
      const targetCamY = nextY + 3.2;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.1);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1);
      camera.lookAt(nextX, nextY + 1.4, nextZ);
    }
  });

  return null;
}
