import { motion } from 'motion/react';
import { X, Check, ListTodo, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { useGameStore, GameTask } from '../store';
import { useState } from 'react';
import { soundService } from '../services/soundService';

export const TaskModal = ({ onClose }: { onClose: () => void }) => {
  const tasks = useGameStore(state => state.tasks);
  const addTask = useGameStore(state => state.addTask);
  const editTask = useGameStore(state => state.editTask);
  const deleteTask = useGameStore(state => state.deleteTask);
  const toggleTask = useGameStore(state => state.toggleTask);
  
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

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

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] pointer-events-auto p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-2xl flex flex-col shadow-[0_0_100px_rgba(59,130,246,0.1)] relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter leading-none mb-2">OPERATIONS LOG</h2>
            <div className="flex gap-4 items-center">
              <div className="h-1 w-24 bg-blue-500" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Combat Objectives & Tasks</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="group flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white hover:text-black transition-all"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <form onSubmit={handleAddTask} className="flex gap-4 mb-8 relative z-10">
          <input 
            type="text"
            placeholder="New objective..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all"
          />
          <select 
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white/50 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="low">Low</option>
            <option value="medium">Med</option>
            <option value="high">High</option>
          </select>
          <button 
            type="submit"
            className="bg-blue-500 text-white p-4 rounded-2xl hover:bg-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            <Plus size={24} />
          </button>
        </form>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 relative z-10">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/20">
              <ListTodo size={48} className="mb-4 opacity-20" />
              <div className="text-xs font-black uppercase tracking-[0.3em]">No active objectives</div>
            </div>
          ) : (
            tasks.map(task => (
              <motion.div 
                key={task.id}
                layout
                className={`bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-6 transition-all ${task.completed ? 'opacity-40 grayscale' : ''}`}
              >
                <button 
                  onClick={() => { toggleTask(task.id); soundService.playSFX('ui_click'); }}
                  className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/20 hover:border-blue-500'}`}
                >
                  {task.completed && <Check size={16} />}
                </button>
                
                <div className="flex-1">
                  <div className={`text-lg font-black italic tracking-tight ${task.completed ? 'line-through text-white/30' : 'text-white'}`}>
                    {task.title}
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/20">
                      <Calendar size={12} />
                      {task.dueDate}
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'}`}>
                      <AlertCircle size={12} />
                      {task.priority}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { deleteTask(task.id); soundService.playSFX('ui_click'); }}
                  className="p-3 text-white/10 hover:text-red-500 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
