import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, GraduationCap, X, CheckCircle, Lock, Unlock, Play, FileText, Users, Award, Shield } from 'lucide-react';
import { getAccessToken } from '../firebase';
import { soundService } from '../services/soundService';

const SUBJECTS = Array.from({ length: 100 }, (_, i) => ({
  id: `subj_${i}`,
  name: [
    'Advanced Cybernetics', 'Quantum Mechanics', 'Neon History', 'Zero-G Physics', 
    'Network Security', 'AI Ethics', 'Exoplanetary Botany', 'Nanotech Engineering',
    'Plasma Dynamics', 'Orbital Mechanics'
  ][i % 10] + ` ${Math.floor(i / 10) + 1}01`,
  completed: false,
}));

export function ClassroomMode({ onClose }: { onClose: () => void }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'hub' | 'license' | 'quiz' | 'classroom'>('hub');
  
  const [subjects, setSubjects] = useState(SUBJECTS);
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [quizStep, setQuizStep] = useState(0);

  const fetchCourses = async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Google Workspace token not found. Please sign in again.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('https://classroom.googleapis.com/v1/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.courses) {
        setCourses(data.courses);
      }
    } catch (err) {
      setError('Failed to fetch courses. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const completedCount = subjects.filter(s => s.completed).length;
  const hasLicense = completedCount === 100;

  const handleStartQuiz = (subj: any) => {
    setActiveSubject(subj);
    setQuizStep(0);
    setView('quiz');
    soundService.playSFX('ui_click');
  };

  const handleAnswer = (correct: boolean) => {
    soundService.playSFX(correct ? 'powerup' : 'hit');
    if (quizStep < 9) {
      setQuizStep(prev => prev + 1);
    } else {
      // Completed subject
      setSubjects(prev => prev.map(s => s.id === activeSubject.id ? { ...s, completed: true } : s));
      setView('license');
      soundService.playSFX('killstreak');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-950 border-2 border-emerald-500/30 w-full max-w-6xl h-[85vh] rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.2)] flex overflow-hidden relative"
      >
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-black/40 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 text-emerald-400">
              <GraduationCap size={32} />
              <h2 className="text-xl font-black uppercase tracking-widest leading-tight">Education<br/>Mode</h2>
            </div>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-2">
            <button 
              onClick={() => { setView('hub'); soundService.playSFX('ui_click'); }}
              className={`p-4 rounded-xl font-bold uppercase text-left transition-all ${view === 'hub' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => { setView('classroom'); soundService.playSFX('ui_click'); }}
              className={`p-4 rounded-xl font-bold uppercase text-left transition-all flex items-center gap-2 ${view === 'classroom' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Users size={18} /> Google Classroom
            </button>
            <button 
              onClick={() => { setView('license'); soundService.playSFX('ui_click'); }}
              className={`p-4 rounded-xl font-bold uppercase text-left transition-all flex items-center gap-2 ${view === 'license' || view === 'quiz' ? 'bg-amber-500 text-black' : 'text-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400'}`}
            >
              <Shield size={18} /> Teaching License
            </button>
          </div>
          {hasLicense && (
            <div className="p-4 m-4 bg-amber-500/20 border border-amber-500/50 rounded-xl flex items-center gap-3">
              <Award className="text-amber-400" size={24} />
              <div>
                <div className="text-amber-400 font-black text-xs uppercase">Certified</div>
                <div className="text-white text-[10px]">Neon Arena Educator</div>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full transition-colors z-20 bg-black/50"
          >
            <X size={24} />
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {/* Hub View */}
            {view === 'hub' && (
              <div className="p-8 lg:p-12">
                <h1 className="text-4xl font-black text-white uppercase italic tracking-wider mb-6">Education Hub</h1>
                <p className="text-zinc-400 max-w-2xl text-lg mb-12">Welcome to the Neon Arena Education Module. Here you can connect your Google Classroom to bring your students into immersive 3D learning environments, or earn your official Teaching License by completing 1,000 rigorous academic challenges.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-emerald-500/50 transition-colors group cursor-pointer" onClick={() => setView('classroom')}>
                    <Users className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform" size={48} />
                    <h3 className="text-2xl font-bold text-white mb-2">Google Classroom</h3>
                    <p className="text-zinc-500">Sync your courses, manage rosters, and assign VR expeditions directly to your students.</p>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-8 hover:border-amber-500/50 transition-colors group cursor-pointer" onClick={() => setView('license')}>
                    <Shield className="text-amber-400 mb-6 group-hover:scale-110 transition-transform" size={48} />
                    <h3 className="text-2xl font-bold text-white mb-2">Teaching License</h3>
                    <p className="text-zinc-500">Complete 100 subjects (10 questions each) to unlock the ultimate Educator abilities in-game.</p>
                    <div className="mt-6 bg-black/50 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${(completedCount / 100) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Google Classroom View */}
            {view === 'classroom' && (
              <div className="p-8 lg:p-12">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-4xl font-black text-white uppercase italic tracking-wider">Your Courses</h1>
                  <button onClick={fetchCourses} className="px-6 py-2 bg-emerald-500/20 text-emerald-400 rounded-full font-bold uppercase text-sm hover:bg-emerald-500 hover:text-black transition-colors">
                    Refresh Sync
                  </button>
                </div>
                
                {error && <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl mb-6">{error}</div>}
                
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                    <div className="text-emerald-400 font-mono uppercase tracking-widest">Syncing Workspace...</div>
                  </div>
                ) : courses.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {courses.map(course => (
                      <div key={course.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-1">{course.name}</h3>
                        <p className="text-zinc-400 text-sm mb-4">{course.section || 'No section'}</p>
                        <div className="mt-auto flex gap-2">
                          <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors">
                            View Roster
                          </button>
                          <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors">
                            Assign VR Room
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 text-zinc-500">
                    <Book size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-bold">No courses found</p>
                    <p className="text-sm">Create a course in Google Classroom first.</p>
                  </div>
                )}
              </div>
            )}

            {/* Teaching License View */}
            {view === 'license' && (
              <div className="p-8 lg:p-12">
                <div className="bg-gradient-to-r from-amber-900/40 to-transparent p-8 rounded-3xl border border-amber-500/30 mb-8">
                  <h1 className="text-4xl font-black text-amber-400 uppercase italic tracking-wider mb-2">Teaching License Exam</h1>
                  <p className="text-amber-100/70 mb-6">Prove your mastery across 100 distinct disciplines to earn the Neon Arena Educator Badge. Each subject contains 10 rigorous questions.</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-black/60 rounded-full h-4 overflow-hidden border border-white/10">
                      <div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${(completedCount / 100) * 100}%` }} />
                    </div>
                    <div className="text-amber-400 font-black text-2xl">{completedCount}/100</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subjects.map((subj, idx) => (
                    <button
                      key={subj.id}
                      onClick={() => !subj.completed && handleStartQuiz(subj)}
                      disabled={subj.completed}
                      className={`p-4 rounded-xl border text-left flex flex-col gap-4 transition-all ${
                        subj.completed 
                          ? 'bg-emerald-500/10 border-emerald-500/30 opacity-50 cursor-default'
                          : 'bg-white/5 border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer group'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono text-zinc-500">#{String(idx + 1).padStart(3, '0')}</span>
                        {subj.completed ? <CheckCircle className="text-emerald-500" size={16} /> : <Lock className="text-zinc-600 group-hover:text-amber-500 transition-colors" size={16} />}
                      </div>
                      <div className={`font-bold ${subj.completed ? 'text-emerald-400' : 'text-white'}`}>
                        {subj.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz View */}
            {view === 'quiz' && activeSubject && (
              <div className="p-8 lg:p-12 max-w-4xl mx-auto h-full flex flex-col justify-center">
                <div className="mb-8">
                  <div className="text-amber-400 font-black uppercase tracking-widest mb-2">{activeSubject.name}</div>
                  <div className="flex gap-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={`h-2 flex-1 rounded-full ${i < quizStep ? 'bg-amber-500' : i === quizStep ? 'bg-amber-500/50 animate-pulse' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-12 text-center">
                    Simulated Question {quizStep + 1} for {activeSubject.name}. What is the correct theoretical approach?
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {['Option Alpha', 'Option Beta', 'Option Gamma', 'Option Delta'].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i === 0 || i === 2)}
                        className="p-6 bg-black/40 border border-white/10 rounded-2xl text-left hover:bg-amber-500/20 hover:border-amber-500/50 transition-all group"
                      >
                        <div className="text-amber-500/50 font-black text-sm mb-2 group-hover:text-amber-400">{String.fromCharCode(65 + i)}</div>
                        <div className="text-white font-bold">{opt} - Theoretical framework response matrix.</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Auto-complete cheat for demo purposes since answering 1000 questions manually is impossible here */}
                <button 
                  onClick={() => {
                    setSubjects(prev => prev.map(s => s.id === activeSubject.id ? { ...s, completed: true } : s));
                    setView('license');
                    soundService.playSFX('killstreak');
                  }}
                  className="mx-auto mt-4 text-xs text-zinc-600 hover:text-white uppercase font-mono border-b border-dashed border-zinc-600"
                >
                  [Dev Skip: Force Complete Subject]
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
