import React, { useState } from 'react';
import { 
  GraduationCap, BookOpen, Code, Bot, Rocket, Shield, HeartPulse, 
  Sparkles, Compass, Trophy, Users, Award, Play, CheckCircle2, 
  FlaskConical, Cpu, Layers, Music, Palette, Utensils, Sprout, Plane, Anchor, 
  Search, Moon, Calculator, Dna, Zap, ArrowRight, Activity, X, Lightbulb
} from 'lucide-react';
import { useEduStore } from './eduStore';
import { AIBedtimeStoryModal } from './AIBedtimeStoryModal';
import { AdvancedCalculator } from './AdvancedCalculator';

interface EducationExpansionHubProps {
  onClose?: () => void;
}

export function EducationExpansionHub({ onClose }: EducationExpansionHubProps) {
  const [activeTab, setActiveTab] = useState<'grades' | 'academies' | 'labs' | 'bossBattle' | 'analytics'>('grades');
  const [selectedGrade, setSelectedGrade] = useState('Grade 8 (High School)');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedAcademy, setSelectedAcademy] = useState('Coding & AI Academy');
  const [showBedtimeStory, setShowBedtimeStory] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Chemistry Lab Interactive Simulator state
  const [chemElemA, setChemElemA] = useState('H2');
  const [chemElemB, setChemElemB] = useState('O2');
  const [reactionResult, setReactionResult] = useState<string | null>(null);

  // Boss Battle Quiz state
  const [bossHp, setBossHp] = useState(100);
  const [playerScore, setPlayerScore] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const gainXP = useEduStore(state => state.gainXP);

  const gradeLevels = [
    { id: 'preschool', name: 'Preschool & Toddlers', level: 'Ages 2-4', desc: 'Shape recognition, animal sounds & motor skills' },
    { id: 'grade_rrr', name: 'Grade RRR', level: 'Ages 3-4', desc: 'Basic numbers, colors, storytelling & sensory discovery' },
    { id: 'grade_rr', name: 'Grade RR', level: 'Ages 4-5', desc: 'Alphabet phonics, spatial awareness & early math' },
    { id: 'grade_r', name: 'Grade R (Foundation)', level: 'Ages 5-6', desc: 'Pre-reading, simple addition, social skills & drawing' },
    { id: 'grade_1_3', name: 'Grade 1–3 (Primary)', level: 'Foundation Phase', desc: 'Reading fluency, arithmetic, life skills & nature' },
    { id: 'grade_4_7', name: 'Grade 4–7 (Intermediate)', level: 'Senior Primary', desc: 'Natural sciences, geography, history & fractions' },
    { id: 'grade_8_9', name: 'Grade 8–9 (Senior)', level: 'Junior High', desc: 'Algebra, physics basics, biology & technology' },
    { id: 'grade_10_12', name: 'Grade 10–12 (FET / Matric)', level: 'High School', desc: 'Calculus, chemistry, physical science, accounting & IT' },
    { id: 'college', name: 'College / TVET', level: 'Tertiary Diplomas', desc: 'Applied technical diplomas, administration & digital skills' },
    { id: 'university', name: 'University Degrees', level: 'BSc, BEng, BA, MD', desc: 'Advanced engineering, medical sciences, computer science & law' },
    { id: 'trade_school', name: 'Trade Schools', level: 'Vocational', desc: 'Plumbing, electrical wiring, solar installation & automotive' },
    { id: 'adult_ed', name: 'Lifelong Learning', level: 'Adult Education', desc: 'Financial literacy, modern AI tools, languages & entrepreneurship' },
  ];

  const academies = [
    { id: 'coding', name: 'Coding Academy', icon: Code, desc: 'Python, C++, JavaScript, Web3 & Algorithms', color: 'from-cyan-500 to-blue-600' },
    { id: 'ai', name: 'AI & Machine Learning Academy', icon: Bot, desc: 'Neural networks, LLMs, computer vision & ethics', color: 'from-fuchsia-500 to-purple-600' },
    { id: 'robotics', name: 'Robotics Academy', icon: Cpu, desc: 'Arduino, ROS2, servo kinematics & autonomous rovers', color: 'from-amber-500 to-orange-600' },
    { id: 'engineering', name: 'Engineering Academy', icon: Layers, desc: 'Civil, mechanical, CAD modeling & structural physics', color: 'from-blue-500 to-indigo-600' },
    { id: 'medical', name: 'Medical Academy', icon: HeartPulse, desc: 'Human anatomy, surgical procedures, pharmacology & genetics', color: 'from-rose-500 to-pink-600' },
    { id: 'space', name: 'Space Academy', icon: Rocket, desc: 'Orbital mechanics, astrophysics, rocket propulsion & astronomy', color: 'from-sky-500 to-cyan-600' },
    { id: 'business', name: 'Business Academy', icon: Trophy, desc: 'Economics, stock markets, accounting & venture creation', color: 'from-emerald-500 to-teal-600' },
    { id: 'art', name: 'Art Academy', icon: Palette, desc: '3D sculpting, digital painting, UI design & animation', color: 'from-purple-500 to-pink-600' },
    { id: 'music', name: 'Music Academy', icon: Music, desc: 'Sound design, synthesis, audio theory & composition', color: 'from-violet-500 to-fuchsia-600' },
    { id: 'cooking', name: 'Culinary Academy', icon: Utensils, desc: 'Food science, molecular gastronomy & nutrition', color: 'from-amber-400 to-yellow-600' },
    { id: 'farming', name: 'Farming & Bio-Tech Academy', icon: Sprout, desc: 'Hydroponics, sustainable agriculture & genetics', color: 'from-lime-500 to-emerald-600' },
    { id: 'aviation', name: 'Aviation Academy', icon: Plane, desc: 'Aerodynamics, flight navigation & pilot physics', color: 'from-indigo-500 to-blue-600' },
    { id: 'marine', name: 'Marine Science Academy', icon: Anchor, desc: 'Oceanography, marine biology & deep sea exploration', color: 'from-cyan-500 to-teal-600' },
    { id: 'cybersecurity', name: 'Cybersecurity Academy', icon: Shield, desc: 'Ethical hacking, cryptography, firewalls & network defense', color: 'from-red-500 to-rose-600' },
  ];

  const quizQuestions = [
    {
      question: 'What is the powerhouse organelle of a eukaryotic cell?',
      options: ['Ribosome', 'Mitochondria', 'Endoplasmic Reticulum', 'Golgi Body'],
      correct: 1,
      explanation: 'Mitochondria generate most of the chemical energy needed to power the cell via ATP production.'
    },
    {
      question: 'What is Newton’s Second Law equation?',
      options: ['E = mc²', 'F = ma', 'V = IR', 'P = IV'],
      correct: 1,
      explanation: 'Force equals mass multiplied by acceleration (F = ma).'
    },
    {
      question: 'Which element has the atomic number 1 on the Periodic Table?',
      options: ['Helium', 'Oxygen', 'Hydrogen', 'Carbon'],
      correct: 2,
      explanation: 'Hydrogen (H) has 1 proton and atomic number 1.'
    }
  ];

  const handleSimulateReaction = () => {
    if ((chemElemA === 'H2' && chemElemB === 'O2') || (chemElemA === 'O2' && chemElemB === 'H2')) {
      setReactionResult('💥 EXOTHERMIC REACTION: 2H₂ + O₂ → 2H₂O (Water Vapor + 572 kJ Energy Released!)');
    } else if ((chemElemA === 'Na' && chemElemB === 'Cl2') || (chemElemA === 'Cl2' && chemElemB === 'Na')) {
      setReactionResult('✨ CRYSTALLIZATION: 2Na + Cl₂ → 2NaCl (Table Salt Crystal Lattice Formed!)');
    } else {
      setReactionResult('⚡ MIXED COMPOUND SOLUTION: Recombining valence electron shells...');
    }
    gainXP(50);
  };

  const handleAnswerQuiz = (optionIdx: number) => {
    const q = quizQuestions[quizIndex];
    if (optionIdx === q.correct) {
      setBossHp(prev => Math.max(0, prev - 40));
      setPlayerScore(prev => prev + 100);
      gainXP(100);
      setQuizFeedback(`✅ CRITICAL HIT! ${q.explanation}`);
      setTimeout(() => {
        setQuizFeedback(null);
        if (quizIndex < quizQuestions.length - 1) {
          setQuizIndex(prev => prev + 1);
        }
      }, 2500);
    } else {
      setQuizFeedback(`❌ DEFLECTED! Correct answer was "${q.options[q.correct]}". ${q.explanation}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl font-sans select-none overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-zinc-950/95 border border-cyan-500/40 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glowing banner header */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 w-full" />

        {/* Top Header */}
        <div className="p-5 border-b border-white/10 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <GraduationCap className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase italic tracking-wider">NEON ARENA: ULTIMATE EDUCATION EXPANSION</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  INFINITY ACADEMY
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">Preschool to University, 16 Specialized Academies, Interactive Science Labs & AI Tutor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBedtimeStory(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-400/30 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <Moon className="w-4 h-4" />
              <span>AI BEDTIME STORY</span>
            </button>

            <button
              onClick={() => setShowCalculator(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-400/30 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>GRAPHING CALC</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Header Navigation */}
        <div className="grid grid-cols-5 border-b border-white/10 bg-zinc-950/80 text-xs font-black uppercase tracking-wider text-center">
          <button
            onClick={() => setActiveTab('grades')}
            className={`py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'grades' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Grade K–12 & College</span>
          </button>

          <button
            onClick={() => setActiveTab('academies')}
            className={`py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'academies' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-b-2 border-fuchsia-400' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>16 Academies</span>
          </button>

          <button
            onClick={() => setActiveTab('labs')}
            className={`py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'labs' ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-400' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Science Labs</span>
          </button>

          <button
            onClick={() => setActiveTab('bossBattle')}
            className={`py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'bossBattle' ? 'bg-rose-500/10 text-rose-400 border-b-2 border-rose-400' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Quiz Boss Battle</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'analytics' ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* TAB 1: GRADES & CURRICULUM */}
          {activeTab === 'grades' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Complete Curriculum Matrix</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Select your educational tier to load aligned interactive lessons</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 outline-none focus:border-cyan-400"
                  >
                    <option value="English">English</option>
                    <option value="isiZulu">isiZulu</option>
                    <option value="isiXhosa">isiXhosa</option>
                    <option value="Afrikaans">Afrikaans</option>
                    <option value="Sepedi">Sepedi</option>
                    <option value="Setswana">Setswana</option>
                    <option value="Sesotho">Sesotho</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="Mandarin">Mandarin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {gradeLevels.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrade(g.name)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedGrade === g.name
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.15)]'
                        : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black uppercase tracking-wide text-white">{g.name}</h4>
                        <span className="text-[8px] font-mono font-bold bg-white/10 text-cyan-300 px-2 py-0.5 rounded uppercase">{g.level}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2 font-medium leading-relaxed">{g.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-cyan-400">
                      <span>LOAD CURRICULUM</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 16 SPECIALIZED ACADEMIES */}
          {activeTab === 'academies' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">16 Specialized Career Academies</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Master real-world skills through gamified simulation quests</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {academies.map((ac) => {
                  const IconComp = ac.icon;
                  return (
                    <button
                      key={ac.id}
                      onClick={() => setSelectedAcademy(ac.name)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedAcademy === ac.name
                          ? 'bg-fuchsia-500/15 border-fuchsia-400 text-white shadow-[0_0_25px_rgba(217,70,239,0.15)]'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${ac.color} flex items-center justify-center text-white mb-3 shadow-md`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-wide text-white">{ac.name}</h4>
                        <p className="text-[11px] text-zinc-400 mt-1 font-medium leading-relaxed">{ac.desc}</p>
                      </div>

                      <span className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest mt-3 block">
                        ENROLL ACADEMY →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SCIENCE SIMULATION LABS */}
          {activeTab === 'labs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Interactive Science & Math Lab</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Test real chemical reactions and physics laws inside safe 3D simulations</p>
              </div>

              {/* Reaction Simulator Box */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-3xl p-6 space-y-4">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" /> Chemistry Reaction Synthesizer
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Reactant A</label>
                    <select
                      value={chemElemA}
                      onChange={(e) => setChemElemA(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                    >
                      <option value="H2">Hydrogen Gas (H₂)</option>
                      <option value="Na">Sodium Metal (Na)</option>
                      <option value="Cu">Copper Wire (Cu)</option>
                      <option value="C6H12O6">Glucose (C₆H₁₂O₆)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Reactant B</label>
                    <select
                      value={chemElemB}
                      onChange={(e) => setChemElemB(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                    >
                      <option value="O2">Oxygen Gas (O₂)</option>
                      <option value="Cl2">Chlorine Gas (Cl₂)</option>
                      <option value="HNO3">Nitric Acid (HNO₃)</option>
                      <option value="H2O">Water (H₂O)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSimulateReaction}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                >
                  ⚡ SIMULATE REACTION & OBSERVE MOLECULAR BONDS
                </button>

                {reactionResult && (
                  <div className="p-4 bg-amber-500/10 border border-amber-400/30 rounded-2xl text-xs font-bold text-amber-200 animate-pulse">
                    {reactionResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: QUIZ BOSS BATTLE */}
          {activeTab === 'bossBattle' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl">
                <div>
                  <h3 className="text-sm font-black text-rose-300 uppercase tracking-wider">👹 MISCONCEPTION MONSTER BOSS BATTLE</h3>
                  <p className="text-xs text-zinc-400">Answer educational questions correctly to deal damage to the Misconception Boss!</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black text-zinc-500 uppercase">SCORE</span>
                  <p className="text-lg font-mono font-black text-amber-400">{playerScore} PTS</p>
                </div>
              </div>

              {/* Boss Health Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-black text-rose-400 uppercase">
                  <span>Misconception Boss Health</span>
                  <span className="font-mono">{bossHp} / 100 HP</span>
                </div>
                <div className="w-full h-3 bg-zinc-900 rounded-full border border-white/10 overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full transition-all duration-500" 
                    style={{ width: `${bossHp}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              {bossHp > 0 ? (
                <div className="bg-zinc-900/80 border border-white/10 p-6 rounded-3xl space-y-4">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">
                    QUESTION {quizIndex + 1} OF {quizQuestions.length}
                  </span>
                  <h4 className="text-base font-black text-white">{quizQuestions[quizIndex].question}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {quizQuestions[quizIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerQuiz(idx)}
                        className="p-3.5 rounded-2xl border border-white/10 hover:border-rose-400 bg-white/5 hover:bg-rose-500/10 text-left text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {quizFeedback && (
                    <div className="p-3.5 bg-zinc-950 border border-white/10 rounded-2xl text-xs font-bold text-cyan-300">
                      {quizFeedback}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 bg-emerald-500/20 border border-emerald-400 rounded-3xl text-center space-y-3">
                  <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                  <h3 className="text-lg font-black text-white uppercase">MISCONCEPTION BOSS DEFEATED! 🎉</h3>
                  <p className="text-xs text-emerald-200">You earned +300 XP and unlocked the "Master Explorer" Badge!</p>
                  <button
                    onClick={() => {
                      setBossHp(100);
                      setQuizIndex(0);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-widest cursor-pointer"
                  >
                    PLAY AGAIN
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Student Learning Velocity Analytics</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Track retention curves, weekly study velocity, and skill mastery</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-2xl">
                  <span className="text-[10px] font-black text-cyan-400 uppercase">Mastery Velocity</span>
                  <h4 className="text-2xl font-mono font-black text-white mt-1">94.2%</h4>
                  <p className="text-[10px] text-zinc-400 mt-1">+12% from last week</p>
                </div>

                <div className="p-4 bg-fuchsia-500/10 border border-fuchsia-400/30 rounded-2xl">
                  <span className="text-[10px] font-black text-fuchsia-400 uppercase">Memory Retention</span>
                  <h4 className="text-2xl font-mono font-black text-white mt-1">91.8%</h4>
                  <p className="text-[10px] text-zinc-400 mt-1">Spaced repetition active</p>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl">
                  <span className="text-[10px] font-black text-emerald-400 uppercase">Quests Completed</span>
                  <h4 className="text-2xl font-mono font-black text-white mt-1">48 Labs</h4>
                  <p className="text-[10px] text-zinc-400 mt-1">Level 4 Explorer</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showBedtimeStory && (
        <AIBedtimeStoryModal onClose={() => setShowBedtimeStory(false)} />
      )}

      {showCalculator && (
        <AdvancedCalculator onClose={() => setShowCalculator(false)} />
      )}
    </div>
  );
}
