import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  UnitDefinition, 
  ActiveUnitInstance, 
  DefensiveStructure, 
  LaneId, 
  ClusterCommandType, 
  FormationType, 
  BoardSquadLoadout, 
  BoardEnvironmentConfig, 
  ArtifactDefinition 
} from './types';
import { 
  BOARD_UNITS, 
  BOARD_ARTIFACTS, 
  BOARD_ENVIRONMENTS, 
  DEFAULT_SQUAD 
} from './unitCatalog';
import { 
  INITIAL_TOWERS, 
  LANE_Z_COORDINATES, 
  createActiveUnit, 
  getDistance, 
  getFormationOffsets 
} from './boardLogic';
import { BoardArena3D } from './BoardArena3D';
import { BoardHUD } from './BoardHUD';
import { BoardHub } from './BoardHub';
import { BoardTutorialModal } from './BoardTutorialModal';
import { Trophy, Skull, RotateCcw, ArrowLeft } from 'lucide-react';

interface BoardModeProps {
  onBackToMainMenu: () => void;
}

export const BoardMode: React.FC<BoardModeProps> = ({ onBackToMainMenu }) => {
  // Master mode state: 'hub' (squad builder, catalog) vs 'battle' (live board match)
  const [subMode, setSubMode] = useState<'hub' | 'battle'>('hub');
  const [currentSquad, setCurrentSquad] = useState<BoardSquadLoadout>(DEFAULT_SQUAD);
  const [activeEnvironment, setActiveEnvironment] = useState<BoardEnvironmentConfig>(BOARD_ENVIRONMENTS[0]);
  const [matchDifficulty, setMatchDifficulty] = useState<'easy' | 'normal' | 'master' | 'brutal'>('normal');

  // Active match simulation state
  const [units, setUnits] = useState<ActiveUnitInstance[]>([]);
  const [structures, setStructures] = useState<DefensiveStructure[]>(INITIAL_TOWERS);
  const [mana, setMana] = useState<number>(5.0);
  const [enemyMana, setEnemyMana] = useState<number>(5.0);
  const [matchTime, setMatchTime] = useState<number>(0);
  const [selectedLane, setSelectedLane] = useState<LaneId>('mid');
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [activeFormation, setActiveFormation] = useState<FormationType>('wedge');
  const [artifactCooldowns, setArtifactCooldowns] = useState<Record<string, number>>({});
  const [matchOutcome, setMatchOutcome] = useState<'victory' | 'defeat' | null>(null);

  // Platform and view controls
  const [platformMode, setPlatformMode] = useState<'pc' | 'mobile' | 'vr'>('pc');
  const [isMixedReality, setIsMixedReality] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // References for game tick loop
  const unitsRef = useRef<ActiveUnitInstance[]>(units);
  const structuresRef = useRef<DefensiveStructure[]>(structures);
  unitsRef.current = units;
  structuresRef.current = structures;

  // Start a new match
  const handleStartMatch = (difficulty: 'easy' | 'normal' | 'master' | 'brutal') => {
    setMatchDifficulty(difficulty);
    setUnits([]);
    setStructures(JSON.parse(JSON.stringify(INITIAL_TOWERS)));
    setMana(5.0);
    setEnemyMana(5.0);
    setMatchTime(0);
    setSelectedUnitIds([]);
    setArtifactCooldowns({});
    setMatchOutcome(null);
    setSubMode('battle');

    // Spawn initial friendly Hero and AI enemy Hero at base
    const playerHeroDef = BOARD_UNITS.find(u => u.id === currentSquad.heroId) || BOARD_UNITS[0];
    const enemyHeroDef = BOARD_UNITS.find(u => u.id === 'hero_dragonkin') || BOARD_UNITS[4];

    const initialPlayerHero = createActiveUnit(playerHeroDef, 'player', 'mid', [-22, 0, 0]);
    const initialEnemyHero = createActiveUnit(enemyHeroDef, 'enemy', 'mid', [22, 0, 0]);

    setUnits([initialPlayerHero, initialEnemyHero]);
  };

  // Main combat & AI simulation tick loop
  useEffect(() => {
    if (subMode !== 'battle' || matchOutcome !== null) return;

    const interval = setInterval(() => {
      setMatchTime(t => t + 0.1);

      // Regenerate Mana
      setMana(m => Math.min(10, m + 0.035));
      setEnemyMana(em => Math.min(10, em + 0.035));

      // Decrement artifact cooldowns
      setArtifactCooldowns(prev => {
        const next: Record<string, number> = {};
        for (const [id, cd] of Object.entries(prev)) {
          if (cd > 0.1) next[id] = cd - 0.1;
        }
        return next;
      });

      // ================= 1. AI BOT BEHAVIOR =================
      const currentEm = enemyMana;
      if (currentEm >= 4) {
        // Pick an enemy unit to spawn
        const aiPool = BOARD_UNITS.filter(u => !u.isHero && u.manaCost <= currentEm);
        if (aiPool.length > 0 && Math.random() < 0.25) {
          const chosenDef = aiPool[Math.floor(Math.random() * aiPool.length)];
          const lanes: LaneId[] = ['top', 'mid', 'bot'];
          const chosenLane = lanes[Math.floor(Math.random() * lanes.length)];
          const newAiUnit = createActiveUnit(chosenDef, 'enemy', chosenLane);
          setUnits(prev => [...prev, newAiUnit]);
          setEnemyMana(em => Math.max(0, em - chosenDef.manaCost));
        }
      }

      // ================= 2. UNIT MOVEMENT & COMBAT =================
      setUnits(prevUnits => {
        const updatedUnits: ActiveUnitInstance[] = [];

        for (const unit of prevUnits) {
          if (unit.hp <= 0) continue; // dead unit

          const unitDef = BOARD_UNITS.find(u => u.id === unit.unitId);
          if (!unitDef) continue;

          let [x, y, z] = unit.position;
          let isMoving = false;
          let isAttacking = false;
          let targetPosition = unit.targetPosition;

          // Find nearest opposing unit or tower
          const enemies = prevUnits.filter(u => u.team !== unit.team && u.hp > 0);
          let closestEnemy: ActiveUnitInstance | null = null;
          let closestDist = 9999;

          for (const enemy of enemies) {
            const d = getDistance(unit.position, enemy.position);
            if (d < closestDist) {
              closestDist = d;
              closestEnemy = enemy;
            }
          }

          // Check for nearby opposing structures
          const enemyStructures = structuresRef.current.filter(s => s.team !== unit.team && !s.destroyed);
          let closestStruct: DefensiveStructure | null = null;
          let closestStructDist = 9999;

          for (const s of enemyStructures) {
            const d = getDistance(unit.position, s.position);
            if (d < closestStructDist) {
              closestStructDist = d;
              closestStruct = s;
            }
          }

          // In-range combat evaluation
          const attackRange = unitDef.range;
          if (closestEnemy && closestDist <= attackRange) {
            // Engage enemy unit
            isAttacking = true;
            isMoving = false;
            // Deal damage
            const targetDef = BOARD_UNITS.find(u => u.id === closestEnemy.unitId);
            const enemyArmor = targetDef?.armor || 0;
            const damageDealt = Math.max(5, (unitDef.damage * 0.1) - enemyArmor * 0.05);
            closestEnemy.hp = Math.max(0, closestEnemy.hp - damageDealt);
          } else if (closestStruct && closestStructDist <= attackRange + 1.5) {
            // Engage defensive tower
            isAttacking = true;
            isMoving = false;
            const structDmg = Math.max(4, unitDef.damage * 0.08);
            closestStruct.hp = Math.max(0, closestStruct.hp - structDmg);
            if (closestStruct.hp <= 0) {
              closestStruct.destroyed = true;
            }
          } else {
            // Unit moves according to command or marches down lane
            isMoving = true;
            const moveSpeed = unitDef.moveSpeed * 0.045;

            if (unit.currentCommand === 'Retreat') {
              // Move back towards home nexus
              const retreatX = unit.team === 'player' ? -26 : 26;
              const dx = retreatX - x;
              x += Math.sign(dx) * moveSpeed;
            } else if (unit.targetPosition) {
              // Move towards issued formation target
              const dx = unit.targetPosition[0] - x;
              const dz = unit.targetPosition[2] - z;
              const distToTgt = Math.sqrt(dx * dx + dz * dz);

              if (distToTgt > 0.4) {
                x += (dx / distToTgt) * moveSpeed;
                z += (dz / distToTgt) * moveSpeed;
              } else {
                targetPosition = undefined;
              }
            } else {
              // Default lane advance (Player moves +X towards enemy, Enemy moves -X towards player)
              const marchDir = unit.team === 'player' ? 1 : -1;
              x += marchDir * moveSpeed;

              // Keep units aligned to lane Z unless flanking
              if (unit.currentCommand !== 'Flank') {
                const laneZ = LANE_Z_COORDINATES[unit.assignedLane];
                const dz = laneZ - z;
                if (Math.abs(dz) > 0.1) {
                  z += Math.sign(dz) * (moveSpeed * 0.6);
                }
              }
            }
          }

          updatedUnits.push({
            ...unit,
            position: [x, y, z],
            isMoving,
            isAttacking,
            targetPosition
          });
        }

        return updatedUnits;
      });

      // ================= 3. TOWER DEFENSIVE COMBAT =================
      setStructures(prevStructures => {
        const updated = prevStructures.map(struct => {
          if (struct.destroyed) return struct;

          // Tower attacks nearest intruder in range
          const intruder = unitsRef.current.find(u => u.team !== struct.team && u.hp > 0 && getDistance(u.position, struct.position) <= struct.range);
          if (intruder) {
            intruder.hp = Math.max(0, intruder.hp - struct.damage * 0.08);
          }

          return struct;
        });

        // Check Victory / Defeat conditions
        const playerNexus = updated.find(s => s.id === 'p_nexus');
        const enemyNexus = updated.find(s => s.id === 'e_nexus');

        if (enemyNexus && enemyNexus.hp <= 0) {
          setMatchOutcome('victory');
        } else if (playerNexus && playerNexus.hp <= 0) {
          setMatchOutcome('defeat');
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [subMode, matchOutcome, enemyMana]);

  // Deploy a unit from deck onto selected lane
  const handleDeployUnit = (unitDef: UnitDefinition, lane: LaneId) => {
    if (mana < unitDef.manaCost) return;

    setMana(m => Math.max(0, m - unitDef.manaCost));
    const newUnit = createActiveUnit(unitDef, 'player', lane);
    setUnits(prev => [...prev, newUnit]);

    // Automatically select the freshly deployed unit as part of active cluster
    setSelectedUnitIds([newUnit.instanceId]);
  };

  // Select a unit or add to cluster squad
  const handleSelectUnit = (instanceId: string, shiftKey: boolean) => {
    const targetUnit = units.find(u => u.instanceId === instanceId);
    if (!targetUnit || targetUnit.team !== 'player') return;

    if (shiftKey) {
      // Toggle in cluster
      setSelectedUnitIds(prev => 
        prev.includes(instanceId) ? prev.filter(id => id !== instanceId) : [...prev, instanceId]
      );
    } else {
      // Cluster command: select this unit AND all nearby allied units within 6.5 meters!
      const nearbyAllies = units.filter(u => 
        u.team === 'player' && 
        u.hp > 0 && 
        getDistance(u.position, targetUnit.position) <= 7.0
      );

      setSelectedUnitIds(nearbyAllies.map(u => u.instanceId));
    }
  };

  // Issue real-time group order to the selected cluster squad
  const handleIssueClusterCommand = (command: ClusterCommandType) => {
    if (selectedUnitIds.length === 0) return;

    setUnits(prev => prev.map(unit => {
      if (selectedUnitIds.includes(unit.instanceId)) {
        return {
          ...unit,
          currentCommand: command
        };
      }
      return unit;
    }));
  };

  // Change tactical formation
  const handleChangeFormation = (formation: FormationType) => {
    setActiveFormation(formation);

    // Apply formation offsets to all selected units
    const count = selectedUnitIds.length;
    setUnits(prev => {
      let idx = 0;
      return prev.map(unit => {
        if (selectedUnitIds.includes(unit.instanceId)) {
          const [ox, oz] = getFormationOffsets(idx, count, formation);
          idx++;
          const newTarget: [number, number, number] = [
            unit.position[0] + ox,
            unit.position[1],
            unit.position[2] + oz
          ];
          return {
            ...unit,
            targetPosition: newTarget,
            isMoving: true
          };
        }
        return unit;
      });
    });
  };

  // Click on board ground to move cluster in formation
  const handleBoardClick = (point: [number, number, number]) => {
    if (selectedUnitIds.length === 0) return;

    const count = selectedUnitIds.length;
    let idx = 0;

    setUnits(prev => prev.map(unit => {
      if (selectedUnitIds.includes(unit.instanceId)) {
        const [ox, oz] = getFormationOffsets(idx, count, activeFormation);
        idx++;
        const targetPos: [number, number, number] = [point[0] + ox, 0, point[2] + oz];
        return {
          ...unit,
          targetPosition: targetPos,
          currentCommand: 'Move',
          isMoving: true
        };
      }
      return unit;
    }));
  };

  // Click on structure
  const handleStructureClick = (structureId: string) => {
    const struct = structures.find(s => s.id === structureId);
    if (!struct) return;

    if (struct.team === 'enemy' && selectedUnitIds.length > 0) {
      // Order cluster to siege the enemy structure!
      setUnits(prev => prev.map(unit => {
        if (selectedUnitIds.includes(unit.instanceId)) {
          return {
            ...unit,
            currentCommand: 'TargetStructure',
            targetPosition: struct.position,
            isMoving: true
          };
        }
        return unit;
      }));
    }
  };

  // Trigger game-changing artifact
  const handleTriggerArtifact = (artifact: ArtifactDefinition) => {
    if ((artifactCooldowns[artifact.id] || 0) > 0) return;

    // Set cooldown
    setArtifactCooldowns(prev => ({ ...prev, [artifact.id]: artifact.cooldown }));

    // Apply immediate battlefield effects
    if (artifact.id === 'art_meteor') {
      // Strike all enemy units in the mid lane
      setUnits(prev => prev.map(u => {
        if (u.team === 'enemy') {
          return { ...u, hp: Math.max(0, u.hp - 350) };
        }
        return u;
      }));
    } else if (artifact.id === 'art_aegis') {
      // Grant divine shield to all friendly units
      setUnits(prev => prev.map(u => {
        if (u.team === 'player') {
          return { ...u, hp: Math.min(u.maxHp, u.hp + 250) };
        }
        return u;
      }));
    } else if (artifact.id === 'art_healing') {
      // Heal all friendly units
      setUnits(prev => prev.map(u => {
        if (u.team === 'player') {
          return { ...u, hp: Math.min(u.maxHp, u.hp + 400) };
        }
        return u;
      }));
    } else if (artifact.id === 'art_summoning') {
      // Spawn 3 void skirmishers
      const skirmisherDef = BOARD_UNITS.find(u => u.id === 'soldier_assassin') || BOARD_UNITS[2];
      const squad = [
        createActiveUnit(skirmisherDef, 'player', selectedLane, [-10, 0, LANE_Z_COORDINATES[selectedLane] - 1]),
        createActiveUnit(skirmisherDef, 'player', selectedLane, [-10, 0, LANE_Z_COORDINATES[selectedLane]]),
        createActiveUnit(skirmisherDef, 'player', selectedLane, [-10, 0, LANE_Z_COORDINATES[selectedLane] + 1])
      ];
      setUnits(prev => [...prev, ...squad]);
    }
  };

  // Units currently in deck
  const deckUnits = [
    BOARD_UNITS.find(u => u.id === currentSquad.heroId) || BOARD_UNITS[0],
    ...currentSquad.soldierIds.map(id => BOARD_UNITS.find(u => u.id === id)).filter(Boolean) as UnitDefinition[]
  ];

  const squadArtifacts = currentSquad.artifactIds.map(id => BOARD_ARTIFACTS.find(a => a.id === id)).filter(Boolean) as ArtifactDefinition[];
  const selectedUnitsList = units.filter(u => selectedUnitIds.includes(u.instanceId));

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden select-none">
      {/* ================= 1. HUB / HEADQUARTERS VIEW ================= */}
      {subMode === 'hub' && (
        <BoardHub
          currentSquad={currentSquad}
          activeEnvironment={activeEnvironment}
          onUpdateSquad={setCurrentSquad}
          onSelectEnvironment={setActiveEnvironment}
          onStartMatch={handleStartMatch}
          onStartTutorial={() => setIsTutorialOpen(true)}
          onBackToMainMenu={onBackToMainMenu}
        />
      )}

      {/* ================= 2. LIVE 3D STRATEGY BATTLE VIEW ================= */}
      {subMode === 'battle' && (
        <div className="relative w-full h-full">
          {/* 3D React-Three-Fiber Living Strategy Table Canvas */}
          <Canvas
            shadows
            camera={{ position: [0, 32, 28], fov: 45 }}
            className="w-full h-full bg-black"
          >
            <BoardArena3D
              units={units}
              structures={structures}
              selectedUnitIds={selectedUnitIds}
              environment={activeEnvironment}
              isTabletopVR={platformMode === 'vr'}
              isMixedReality={isMixedReality}
              onSelectUnit={handleSelectUnit}
              onBoardClick={handleBoardClick}
              onStructureClick={handleStructureClick}
            />
          </Canvas>

          {/* Real-Time Strategy Cluster HUD & Controls */}
          <BoardHUD
            mana={mana}
            maxMana={10}
            matchTime={matchTime}
            deckUnits={deckUnits}
            artifacts={squadArtifacts}
            artifactCooldowns={artifactCooldowns}
            selectedLane={selectedLane}
            selectedUnits={selectedUnitsList}
            activeFormation={activeFormation}
            platformMode={platformMode}
            isMixedReality={isMixedReality}
            onSelectLane={setSelectedLane}
            onDeployUnit={handleDeployUnit}
            onIssueClusterCommand={handleIssueClusterCommand}
            onChangeFormation={handleChangeFormation}
            onTriggerArtifact={handleTriggerArtifact}
            onTogglePlatformMode={setPlatformMode}
            onToggleMixedReality={() => setIsMixedReality(!isMixedReality)}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            onExitMatch={() => setSubMode('hub')}
          />

          {/* MATCH OUTCOME OVERLAY (VICTORY / DEFEAT) */}
          {matchOutcome && (
            <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300 font-sans">
              <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
                {matchOutcome === 'victory' ? (
                  <Trophy size={48} className="text-amber-400 animate-bounce" />
                ) : (
                  <Skull size={48} className="text-rose-500 animate-pulse" />
                )}
              </div>

              <h2 className={`text-4xl sm:text-5xl font-black italic uppercase tracking-wider ${
                matchOutcome === 'victory' ? 'text-amber-400' : 'text-rose-500'
              }`}>
                {matchOutcome === 'victory' ? 'VICTORY ON THE BOARD!' : 'CITADEL DESTROYED — DEFEAT'}
              </h2>

              <p className="text-sm text-white/60 mt-3 max-w-md text-center">
                {matchOutcome === 'victory'
                  ? 'Your tactical formations and cluster commands crushed the enemy forces! Core citadel secured.'
                  : 'The enemy broke through your outer towers and overwhelmed your citadel. Regroup and rethink your squad composition!'}
              </p>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => handleStartMatch(matchDifficulty)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 text-black font-black uppercase text-sm tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  <RotateCcw size={18} /> PLAY AGAIN
                </button>
                <button
                  onClick={() => setSubMode('hub')}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 text-white font-bold uppercase text-sm tracking-wider hover:bg-white/20 transition-all border border-white/15"
                >
                  <ArrowLeft size={18} /> RETURN TO HQ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* INTERACTIVE STRATEGY TUTORIAL MODAL */}
      <BoardTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
};
