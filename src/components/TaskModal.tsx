import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ListTodo, Plus, Trash2, Calendar, AlertCircle, Trophy, Sparkles, Gift } from 'lucide-react';
import { useGameStore, GameTask } from '../store';
import { soundService } from '../services/soundService';

export const TaskModal = ({ onClose }: { onClose: () => void }) => {
  const tasks = useGameStore(state => state.tasks);
  const addTask = useGameStore(state => state.addTask);
  const editTask = useGameStore(state => state.editTask);
  const deleteTask = useGameStore(state => state.deleteTask);
  const toggleTask = useGameStore(state => state.toggleTask);
  
  // Daily Missions extensions
  const dailyMissions = useGameStore(state => state.dailyMissions) || [];
  const generateDailyMissions = useGameStore(state => state.generateDailyMissions);
  const toggleDailyMission = useGameStore(state => state.toggleDailyMission);
  const claimDailyMissionsBonus = useGameStore(state => state.claimDailyMissionsBonus);
  const dailyMissionsBonusClaimed = useGameStore(state => state.dailyMissionsBonusClaimed);

  const [activeTab, setActiveTab] = useState<'tasks' | 'daily'>('daily');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Automatically trigger generation of daily missions on mount
  useEffect(() => {
    if (generateDailyMissions) {
      generateDailyMissions();
    }
  }, [generateDailyMissions]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addTask({
        title: newTitle,
        description: '',
        priority: newPriority,
        dueDate: new Date().toISOString().split('T')[0]
      });
      setNewTitle('');
      soundService.playSFX('ui_click');
    }
  };

  const completedDailyCount = dailyMissions.filter(m => m.completed).length;
  const isBonusEligible = dailyMissions.length === 3 && completedDailyCount === 3;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] pointer-events-auto p-4 backdrop-blur-sm select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-2xl flex flex-col shadow-[0_0_100px_rgba(59,130,246,0.1)] relative overflow-hidden max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter leading-none mb-1">OPERATIONS LOG</h2>
            <div className="flex gap-4 items-center">
              <div className="h-1 w-24 bg-blue-500" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Combat Objectives & Daily Missions</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="group flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white hover:text-black transition-all cursor-pointer"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 p-1.5 bg-black/40 border border-white/5 rounded-2xl mb-6 relative z-10 text-xs">
          <button
            onClick={() => {
              setActiveTab('daily');
              soundService.playSFX('ui_click');
            }}
            className={`flex-1 py-3 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'daily' 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black shadow-lg shadow-amber-500/20' 
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <Trophy size={14} /> DAILY MISSIONS
          </button>
          <button
            onClick={() => {
              setActiveTab('tasks');
              soundService.playSFX('ui_click');
            }}
            className={`flex-1 py-3 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tasks' 
                ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/20' 
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <ListTodo size={14} /> CUSTOM TASKS
          </button>
        </div>

        {/* TAB 1: DAILY MISSIONS */}
        {activeTab === 'daily' && (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 relative z-10 flex flex-col">
            {/* Mission Generation Indicator */}
            <div className="flex justify-between items-center bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="animate-pulse" /> 24-Hour Cycle Active
                </span>
                <p className="text-[8px] text-white/40 uppercase font-black tracking-widest mt-0.5">Auto-generates 3 custom tasks every 24 hours.</p>
              </div>
              <button 
                onClick={() => {
                  generateDailyMissions(true);
                  soundService.playSFX('ui_click');
                }}
                className="px-3 py-1.5 border border-amber-500/20 hover:bg-amber-400 hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest text-amber-400 transition-all cursor-pointer"
              >
                Reroll Tasks
              </button>
            </div>

            {/* List of 3 Daily Missions */}
            <div className="space-y-3 flex-1">
              {dailyMissions.map((mission) => (
                <div 
                  key={mission.id}
                  className={`bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 transition-all ${
                    mission.completed ? 'opacity-50 border-emerald-500/35 bg-emerald-500/5' : ''
                  }`}
                >
                  <button 
                    onClick={() => {
                      toggleDailyMission(mission.id);
                      soundService.playSFX('ui_click');
                    }}
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                      mission.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-black' 
                        : 'border-white/20 hover:border-amber-400'
                    }`}
                  >
                    {mission.completed && <Check size={14} className="stroke-[3]" />}
                  </button>

                  <div className="flex-1">
                    <h4 className={`text-sm font-black italic tracking-wide uppercase ${mission.completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                      {mission.title}
                    </h4>
                    <p className="text-[9px] text-white/40 uppercase font-bold mt-0.5 leading-normal">{mission.description}</p>
                  </div>

                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                    mission.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {mission.priority}
                  </span>
                </div>
              ))}
            </div>

            {/* Reward Claim Banner */}
            <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 border border-white/5 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">COMPLETION PROGRESS</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full transition-all" 
                      style={{ width: `${(completedDailyCount / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-amber-400">{completedDailyCount}/3 COMPLETED</span>
                </div>
              </div>

              {dailyMissionsBonusClaimed ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-black uppercase text-[10px] tracking-widest px-4 py-2 border border-emerald-500/20 bg-emerald-500/10 rounded-xl">
                  <Check size={14} /> Bonus claimed today!
                </div>
              ) : (
                <button
                  disabled={!isBonusEligible}
                  onClick={() => {
                    claimDailyMissionsBonus();
                    soundService.playSFX('quest_complete');
                  }}
                  className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer ${
                    isBonusEligible 
                      ? 'bg-amber-400 text-black hover:scale-105 shadow-lg shadow-amber-400/30' 
                      : 'bg-white/5 text-white/20 border border-white/15'
                  }`}
                >
                  <Gift size={14} /> CLAIM 1,000 XP BONUS
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM TASKS */}
        {activeTab === 'tasks' && (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 relative z-10 flex flex-col">
            <form onSubmit={handleAddTask} className="flex gap-4 mb-4">
              <input 
                type="text"
                placeholder="New objective..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
              />
              <select 
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3.5 text-white/50 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Med</option>
                <option value="high">High</option>
              </select>
              <button 
                type="submit"
                className="bg-blue-500 text-white p-3.5 rounded-2xl hover:bg-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer"
              >
                <Plus size={20} />
              </button>
            </form>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/20">
                  <ListTodo size={40} className="mb-4 opacity-20" />
                  <div className="text-xs font-black uppercase tracking-[0.3em]">No custom objectives</div>
                </div>
              ) : (
                tasks.map(task => (
                  <motion.div 
                    key={task.id}
                    layout
                    className={`bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all ${task.completed ? 'opacity-40 grayscale' : ''}`}
                  >
                    <button 
                      onClick={() => { toggleTask(task.id); soundService.playSFX('ui_click'); }}
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${task.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/20 hover:border-blue-500'}`}
                    >
                      {task.completed && <Check size={14} />}
                    </button>
                    
                    <div className="flex-1">
                      <div className={`text-sm font-black italic tracking-tight ${task.completed ? 'line-through text-white/30' : 'text-white'}`}>
                        {task.title}
                      </div>
                      <div className="flex gap-4 mt-1">
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-white/20">
                          <Calendar size={10} />
                          {task.dueDate}
                        </div>
                        <div className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'}`}>
                          <AlertCircle size={10} />
                          {task.priority}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => { deleteTask(task.id); soundService.playSFX('ui_click'); }}
                      className="p-2 text-white/10 hover:text-red-500 transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
