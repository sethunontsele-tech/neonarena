import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Sparkles, Send, Brain, Volume2, VolumeX, Minimize2, Maximize2, 
  HelpCircle, Languages, BookOpen, Lightbulb, Zap, X, Palette, RefreshCw
} from 'lucide-react';
import { useEduStore } from './eduStore';

export function FloatingAITutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'aura'; text: string; hints?: string[] }>>([
    { 
      sender: 'aura', 
      text: "Greetings, cadet! I am A.U.R.A, your floating learning companion. Ask me any math equation, scientific concept, or language translation!",
      hints: ["Try asking: 'Explain photosynthesis'", "Try asking: 'What is E=mc^2?'", "Try asking: 'Translate hello to isiZulu'"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState<'cyan' | 'amber' | 'fairy' | 'dragon'>('cyan');
  const [language, setLanguage] = useState('English');
  const [subject, setSubject] = useState('General Science');
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const speakText = (text: string) => {
    if (!isVoiceActive || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_#🌌]/g, '');
    const ut = new SpeechSynthesisUtterance(clean);
    ut.rate = 0.95;
    ut.pitch = 1.0;
    window.speechSynthesis.speak(ut);
  };

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/academy/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          subject,
          gradeLevel: 'Grade 1–12 & University',
          language
        })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setMessages(prev => [...prev, { sender: 'aura', text: data.reply }]);
        speakText(data.reply);
      } else {
        const fallbackMsg = `A.U.R.A analysis for "${text}": Every concept breaks down into key principles. Ask me to break it into 3 simple steps!`;
        setMessages(prev => [...prev, { sender: 'aura', text: fallbackMsg }]);
        speakText(fallbackMsg);
      }
    } catch (e) {
      const fallbackMsg = `A.U.R.A local answer for "${text}": In science, observation leads to hypotheses. Let's explore together!`;
      setMessages(prev => [...prev, { sender: 'aura', text: fallbackMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none font-sans">
      {!isOpen ? (
        /* Floating Avatar Button */
        <button
          onClick={() => setIsOpen(true)}
          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform hover:scale-110 active:scale-95 cursor-pointer relative ${
            avatarStyle === 'cyan' ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300' :
            avatarStyle === 'amber' ? 'bg-amber-950/90 border-amber-400 text-amber-300' :
            avatarStyle === 'fairy' ? 'bg-fuchsia-950/90 border-fuchsia-400 text-fuchsia-300' :
            'bg-emerald-950/90 border-emerald-400 text-emerald-300'
          }`}
        >
          <Bot className="w-7 h-7 animate-bounce" />
          {/* Active status indicator */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center text-[7px] font-black text-black">
            AI
          </span>
        </button>
      ) : (
        /* Expanded Floating Tutor Window */
        <div className="w-80 sm:w-96 h-[500px] bg-zinc-950/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.2)] backdrop-blur-2xl flex flex-col overflow-hidden relative">
          {/* Laser header */}
          <div className="h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 w-full" />

          {/* Header */}
          <div className="p-3.5 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white tracking-wider uppercase italic">A.U.R.A TUTOR</h4>
                <span className="text-[8px] text-cyan-400 uppercase font-mono tracking-widest">FLOATING COMPANION</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice toggle */}
              <button
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isVoiceActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/10 text-zinc-500'
                }`}
                title="Toggle Voice Speech Synthesis"
              >
                {isVoiceActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Avatar Style toggle */}
              <button
                onClick={() => {
                  const styles: Array<'cyan' | 'amber' | 'fairy' | 'dragon'> = ['cyan', 'amber', 'fairy', 'dragon'];
                  const nextIndex = (styles.indexOf(avatarStyle) + 1) % styles.length;
                  setAvatarStyle(styles[nextIndex]);
                }}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-zinc-300 transition-all cursor-pointer"
                title="Change Avatar Theme"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Config Bar */}
          <div className="px-3 py-1.5 bg-zinc-950 border-b border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Languages className="w-3 h-3 text-cyan-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-cyan-300 outline-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="isiZulu">isiZulu</option>
                <option value="isiXhosa">isiXhosa</option>
                <option value="Afrikaans">Afrikaans</option>
                <option value="Sepedi">Sepedi</option>
                <option value="Setswana">Setswana</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-fuchsia-400" />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-transparent text-fuchsia-300 outline-none cursor-pointer"
              >
                <option value="General Science">Science</option>
                <option value="Mathematics">Math</option>
                <option value="Coding & AI">Coding</option>
                <option value="Physics & Engineering">Physics</option>
                <option value="Medical & Biology">Medical</option>
              </select>
            </div>
          </div>

          {/* Messages Body */}
          <div ref={scrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-3 custom-scrollbar text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-100 rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none font-medium'
                }`}>
                  <p className="whitespace-pre-line text-xs">{m.text}</p>

                  {/* Progressive Hints list */}
                  {m.hints && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                      <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-400" /> Smart Suggestions
                      </span>
                      {m.hints.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(h.replace("Try asking: '", "").replace("'", ""))}
                          className="block text-left text-[9px] text-cyan-300/80 hover:text-cyan-200 hover:underline"
                        >
                          • {h}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none w-max">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                <span className="text-[9px] font-mono text-cyan-300 uppercase">A.U.R.A THINKS...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-zinc-950 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask A.U.R.A in ${language}...`}
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-40 rounded-xl transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
