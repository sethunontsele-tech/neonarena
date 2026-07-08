import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Send, Brain, Bot, HelpCircle, Volume2, ArrowRight } from 'lucide-react';
import { useEduStore } from './eduStore';
import * as THREE from 'three';

// 1. Interactive Overlay Chat with A.U.R.A
export function AURAChatPanel() {
  const activeDimension = useEduStore(state => state.activeDimension);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'aura'; text: string }>>([
    { sender: 'aura', text: "A.U.R.A Online. Virtual tutoring matrices fully synchronized. Welcome, explorer, to the primary dimensional lobby! Where shall we begin our science adventure today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on active dimension
  const suggestions: Record<string, string[]> = {
    hub: ["What is Infinity Academy?", "Tell me about the different dimensions", "Tell me about the top Quest VR Edu apps"],
    biology: ["How does a human cell work?", "What does the Mitochondria do?", "Tell me about Human Anatomy VR", "How does 3D Organon Virtual Dissection work?"],
    math: ["What are spatial vectors?", "Tell me about geometry equations", "How does Gravity Sketch CAD modeling work?", "What is Open Blocks in VR?"],
    chemistry: ["How do covalent bonds form?", "Explain Energy Encyclopedia VR SMR reactors", "How do turbines and solar towers work?"],
    space: ["What is gravitational time dilation?", "How do planet orbits work?", "Tell me about Titans of Space PLUS galactic tours"],
    physics: ["How does Gravity Lab teach physics circuits?", "What is Newton's Room mixed reality?", "Explain the Galileo Drop experiment"],
    geography: ["Tell me about Wander and Street View in VR", "How does BRINK Traveler do photogrammetry?", "Explain NatGeo Antarctica kayak tours"],
    language: ["How does Noun Town teach languages?", "Explain IMMERSE conversation with AI avatars"],
    coding: ["What is ShapesXR prototyping?", "How does ByteBot code compilation work?"],
    arts: ["How does Open Brush do 3D painting?", "Explain the 48 brush effects in Open Brush"],
    history: ["What is Rosetta Cipher decryption?", "Explore the Ancient Pyramids"]
  };

  const activeSuggestions = suggestions[activeDimension] || suggestions.hub;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/academy/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          subject: activeDimension,
          history: messages.slice(-6) // Send recent context
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { sender: 'aura', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'aura', text: "Transmission error... Relaying secondary cache. My AI neural engines are rebooting. Please ask again in a moment." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'aura', text: "Communication bridge lost. I can still guide you locally: make sure to explore the human cell in the Biology dimension!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-full max-w-md bg-zinc-950/90 border border-cyan-500/30 rounded-3xl overflow-hidden backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] relative">
      {/* Laser header lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
      
      {/* Header */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white tracking-wide uppercase italic">A.U.R.A</h4>
            <span className="text-[8px] font-bold text-cyan-400 tracking-[0.2em] uppercase">Universal Academy Guide</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-cyan-500/15 border border-cyan-400/30 px-2 py-0.5 rounded-full">
          <Brain className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
          <span className="text-[8px] font-mono font-bold text-cyan-300 uppercase">AI TEACHER ACTIVE</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${m.sender === 'user' ? 'text-zinc-500' : 'text-cyan-400'}`}>
              {m.sender === 'user' ? 'OPERATOR (YOU)' : 'A.U.R.A'}
            </span>
            <div className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-100 rounded-tr-none' 
                : 'bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none font-medium'
            }`}>
              <p className="whitespace-pre-line">{m.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-1 animate-pulse">A.U.R.A IS SCANNING DATABASE...</span>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions Area */}
      <div className="px-4 py-2 bg-zinc-950/90 border-t border-white/5 flex gap-1.5 overflow-x-auto whitespace-nowrap custom-scrollbar">
        {activeSuggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(sug)}
            disabled={loading}
            className="flex items-center gap-1 bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 px-2.5 py-1 rounded-full text-[10px] text-zinc-300 hover:text-cyan-300 font-bold tracking-wide transition-all uppercase cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            <span>{sug}</span>
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-3.5 bg-zinc-950 border-t border-white/10 flex items-center gap-2.5">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
          placeholder="Ask A.U.R.A anything about science..."
          disabled={loading}
          className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-cyan-400/40 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 outline-none transition-all"
        />
        <button
          onClick={() => handleSendMessage(inputValue)}
          disabled={loading || !inputValue.trim()}
          className="p-3 bg-cyan-500 text-black hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>
    </div>
  );
}

// 2. Beautiful 3D Floating Mesh component of A.U.R.A. inside the Canvas
export function AURA3DModel() {
  const meshRef = useRef<THREE.Group>(null);
  const auraColor = '#22d3ee'; // cyan-400

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Hover floating animation
    meshRef.current.position.y = Math.sin(time * 1.5) * 0.25 + 2.5;
    
    // Smooth slow rotation of the outer protective panels
    const outerRing = meshRef.current.children[1];
    if (outerRing) {
      outerRing.rotation.y = time * 0.4;
      outerRing.rotation.x = time * 0.2;
    }

    const core = meshRef.current.children[0];
    if (core) {
      // Pulse scale
      const s = 1 + Math.sin(time * 4) * 0.05;
      core.scale.set(s, s, s);
    }
  });

  return (
    <group ref={meshRef} position={[2, 2.5, -3]}>
      {/* 1. Inner core core orb */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={auraColor} 
          emissive={auraColor} 
          emissiveIntensity={1.5} 
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 2. Outer holographic protective panels ring */}
      <group>
        <mesh>
          <torusGeometry args={[0.55, 0.04, 8, 32]} />
          <meshStandardMaterial color={auraColor} roughness={0.1} metalness={0.8} />
        </mesh>
        {/* Little decorative satellites */}
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.15]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
        </mesh>
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.15]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* 3. Concentric horizontal orbital scan lines ring */}
      <gridHelper args={[1.2, 8, auraColor, auraColor]} position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]} />

      {/* 4. Downward scanning laser light cone */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.02, 0.4, 1.2, 16, 1, true]} />
        <meshBasicMaterial 
          color={auraColor} 
          transparent 
          opacity={0.12} 
          side={THREE.DoubleSide} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
