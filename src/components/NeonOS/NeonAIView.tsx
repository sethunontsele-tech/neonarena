import React, { useState } from 'react';
import { 
  Bot, Sparkles, Send, Code, FileText, Image, Mic, Terminal, 
  HelpCircle, CheckCircle2, Copy, RefreshCw, Zap
} from 'lucide-react';
import { soundService } from '../../services/soundService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'neon_ai';
  text: string;
  time: string;
  category?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    sender: 'neon_ai',
    text: 'Greetings Commander. I am Neon AI, your integrated system intelligence layer across Neon OS, Emperor, and Arena Gaming. How may I assist your operations today?',
    time: 'Just now',
    category: 'System'
  }
];

export const NeonAIView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'assistant' | 'coding' | 'writer' | 'troubleshoot'>('assistant');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    soundService.playSFX('ui_click');
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    // Generate local intelligence response
    setTimeout(() => {
      soundService.playSFX('powerup');
      let responseText = '';
      if (mode === 'coding') {
        responseText = `// Neon OS Kernel Shader / Logic Hook\nexport function optimizeShaderPipeline() {\n  console.log("Analyzing 3D viewport geometry...");\n  return { frustumCulling: true, lodDistance: 250, vSync144: true };\n}\n\n// Verified: Buffer efficiency elevated by 38.4%.`;
      } else if (mode === 'troubleshoot') {
        responseText = `Hardware Diagnostic Result for query "${currentInput}":\n• GPU Thermal: 52°C (Optimal)\n• RAM Pool: 5.4 / 16 GB allocated\n• NVMe Latency: 0.12ms\n• Network: Direct socket fiber online. No packet anomalies detected.`;
      } else if (mode === 'writer') {
        responseText = `Draft for your Emperor Creator Reel:\n"Step inside Sector 7 where gravity is an illusion and velocity is survival. Neon Arena V2 brings high-octane parkour and massive combined armor into one unified digital world. Are you ready to pilot the future?"`;
      } else {
        responseText = `Command executed: "${currentInput}". Integrated intelligence layer synchronized across all 21 Neon OS modules. Battery, storage, and rendering pipelines are balanced for peak responsiveness.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'neon_ai',
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: mode.toUpperCase()
        }
      ]);
    }, 600);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white font-mono select-none overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-teal-500/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/10 border border-teal-500/40 rounded-xl text-teal-400">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-teal-400 uppercase tracking-tight">NEON AI INTELLIGENCE LAYER</h2>
              <span className="text-[10px] font-black bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/40">
                SYSTEM NEURAL ENGINE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Writing Assistance • Code Generation • System Diagnostics • Automated File Organization
            </p>
          </div>
        </div>

        {/* AI Modes */}
        <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
          {[
            { id: 'assistant', label: 'Assistant' },
            { id: 'coding', label: 'Code Gen' },
            { id: 'writer', label: 'Creative' },
            { id: 'troubleshoot', label: 'Diagnostics' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id as any); soundService.playSFX('ui_tab'); }}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all ${
                mode === m.id ? 'bg-teal-400 text-black font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 text-[10px] text-zinc-500">
              <span className="font-bold">{msg.sender === 'user' ? 'COMMANDER' : 'NEON AI CORE'}</span>
              <span>•</span>
              <span>{msg.time}</span>
              {msg.category && (
                <span className="bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded text-[9px]">
                  {msg.category}
                </span>
              )}
            </div>

            <div
              className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-teal-500 text-black font-medium shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                  : 'bg-zinc-900 border border-white/10 text-zinc-200'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Prompt Box */}
      <div className="p-4 bg-zinc-900 border-t border-white/10">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask Neon AI (${mode.toUpperCase()} mode enabled)...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-teal-300 placeholder-zinc-500 focus:outline-none focus:border-teal-400"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-teal-400 hover:bg-teal-300 text-black font-black text-xs uppercase rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Send size={14} />
            <span>Engage</span>
          </button>
        </form>
      </div>
    </div>
  );
};
