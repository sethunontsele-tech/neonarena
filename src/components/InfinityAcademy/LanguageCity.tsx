import React, { useState } from 'react';
import * as THREE from 'three';
import { useEduStore } from './eduStore';
import { Html } from '@react-three/drei';

interface LanguagePhrase {
  native: string;
  phonetic: string;
  meaning: string;
  desc: string;
}

export function LanguageCity() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [activeLangKey, setActiveLangKey] = useState<'es' | 'fr' | 'ja'>('es');
  const [activePhraseIdx, setActivePhraseIdx] = useState(0);

  const languagesList = {
    es: {
      name: 'Spanish',
      phrases: [
        { native: 'Hola', phonetic: 'OH-lah', meaning: 'Hello', desc: 'The universal, friendly greeting spoken by over 500 million people across Spain and Latin America.' },
        { native: 'Gracias', phonetic: 'GRAH-syahs', meaning: 'Thank You', desc: 'Expressing gratitude; derived from the Latin "gratia", meaning grace or favor.' },
        { native: 'Amigo', phonetic: 'ah-MEE-goh', meaning: 'Friend', desc: 'Indicating comradeship or deep social bond.' }
      ]
    },
    fr: {
      name: 'French',
      phrases: [
        { native: 'Bonjour', phonetic: 'bohn-ZHOOR', meaning: 'Hello / Good Day', desc: 'A compound of "bon" (good) and "jour" (day). The formal daily greeting in France.' },
        { native: 'Merci', phonetic: 'mair-SEE', meaning: 'Thank You', desc: 'An elegant expression of thanks, originating from Old French word for mercy or recompense.' },
        { native: 'Enchanté', phonetic: 'ahn-shahn-TAY', meaning: 'Delighted to meet you', desc: 'Directly translates to "enchanted" or "charmed" when introducing oneself.' }
      ]
    },
    ja: {
      name: 'Japanese',
      phrases: [
        { native: 'こんにちは (Konnichiwa)', phonetic: 'kon-nee-chee-WAH', meaning: 'Hello / Good Afternoon', desc: 'Originated as a part of a sentence meaning "Today is..." or "As for today..." in old Japanese speech.' },
        { native: 'ありがとう (Arigatou)', phonetic: 'ah-ree-gah-TOH', meaning: 'Thank You', desc: 'Derived from "arigatashi", meaning "difficult to exist", representing deep appreciation for rare kindness.' },
        { native: '絆 (Kizuna)', phonetic: 'kee-zoo-NAH', meaning: 'Enduring Bond', desc: 'A beautiful word representing the invisible connection and caring relationships between people.' }
      ]
    }
  };

  const activeLanguage = languagesList[activeLangKey];
  const currentPhrase = activeLanguage.phrases[activePhraseIdx];

  const languageFacts = {
    id: `lang_${activeLangKey}_phrase_${activePhraseIdx}`,
    name: `${activeLanguage.name}: ${currentPhrase.native}`,
    category: 'Universal Linguistics',
    description: `Native representation: "${currentPhrase.native}" which translates directly to "${currentPhrase.meaning}". Phonetic pronunciation: [${currentPhrase.phonetic}].`,
    funFact: currentPhrase.desc
  };

  const selectLanguage = (key: 'es' | 'fr' | 'ja') => {
    setActiveLangKey(key);
    setActivePhraseIdx(0);
    discoverObject(`lang_${key}`);
  };

  const handleScanPhrase = () => {
    setSelectedObject(languageFacts);
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Language City Lights */}
      <pointLight position={[-10, 10, -5]} intensity={1.5} color="#14b8a6" />
      <pointLight position={[10, 10, 5]} intensity={1.5} color="#2dd4bf" />

      {/* Grid Floor */}
      <gridHelper args={[12, 12, '#14b8a6', '#042f2e']} position={[0, 0.01, 0]} />

      {/* --- CENTRAL MONUMENT: LEXICON CYLINDER TOWER --- */}
      <group position={[0, 1.2, -1.8]}>
        {/* Futuristic glowing Lexicon Cylinder Column */}
        <mesh onClick={handleScanPhrase}>
          <cylinderGeometry args={[0.7, 0.8, 2.4, 32]} />
          <meshStandardMaterial 
            color="#0f766e" 
            roughness={0.1} 
            metalness={0.9} 
          />
        </mesh>

        {/* Glowing floating rings around tower representing phonetic waves */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.6, 0]}>
          <torusGeometry args={[0.9, 0.02, 8, 48]} />
          <meshBasicMaterial color="#2dd4bf" transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
          <torusGeometry args={[0.92, 0.02, 8, 48]} />
          <meshBasicMaterial color="#2dd4bf" transparent opacity={0.2} />
        </mesh>

        {/* Floating primary text label over the tower */}
        <Html distanceFactor={8} position={[0, 1.6, 0]} center>
          <div className="bg-zinc-950/95 border border-teal-400/40 px-3.5 py-1.5 rounded-2xl text-[8px] font-black uppercase text-teal-300 tracking-wider whitespace-nowrap shadow-2xl flex flex-col items-center">
            <span className="text-[7px] text-zinc-500 font-bold uppercase mb-0.5">Translation Anchor</span>
            <span className="text-white text-base font-bold font-sans">{currentPhrase.native}</span>
          </div>
        </Html>
      </group>

      {/* Language translation tool console UI */}
      <Html position={[-1.2, 1.8, 1.2]} center distanceFactor={10}>
        <div className="bg-zinc-950/90 border border-teal-500/30 p-5 rounded-3xl w-60 flex flex-col gap-4 shadow-2xl backdrop-blur-xl pointer-events-auto select-none">
          <div className="border-b border-white/10 pb-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Lexicon Translator</h4>
            <p className="text-[8px] font-bold text-teal-400 uppercase">Phonetic speech mapping</p>
          </div>

          {/* Language selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black text-zinc-500 uppercase">Select Target Language</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['es', 'fr', 'ja'] as Array<'es' | 'fr' | 'ja'>).map((key) => {
                const active = activeLangKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => selectLanguage(key)}
                    className={`px-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border ${
                      active
                        ? 'bg-teal-600 text-white border-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                        : 'bg-white/5 text-zinc-400 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {languagesList[key].name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phrase select */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black text-zinc-500 uppercase">Select Lexical Node</span>
            <div className="flex flex-col gap-1">
              {activeLanguage.phrases.map((phrase, idx) => {
                const active = activePhraseIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActivePhraseIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-left text-[9px] font-black uppercase tracking-wider transition-all border flex justify-between items-center ${
                      active
                        ? 'bg-teal-500/20 border-teal-400 text-white'
                        : 'bg-white/5 text-zinc-500 border-transparent hover:border-white/5'
                    }`}
                  >
                    <span>{phrase.native.length > 10 ? phrase.native.slice(0, 8) + '...' : phrase.native}</span>
                    <span className="text-[8px] text-teal-300 font-bold">{phrase.meaning}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Decryption Screen */}
          <div className="bg-black/60 border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-[7px] font-black text-zinc-500 uppercase">Phonetic Spelling</span>
              <span className="text-[8px] text-teal-300 font-mono font-bold">[{currentPhrase.phonetic}]</span>
            </div>
            <p className="text-[8px] text-zinc-400 leading-normal mt-1">{currentPhrase.desc}</p>
          </div>

          <button
            onClick={handleScanPhrase}
            className="w-full bg-teal-500 text-black font-black text-[9px] uppercase tracking-widest py-2 rounded-xl hover:bg-white transition-all cursor-pointer shadow-[0_0_15px_rgba(20,184,166,0.2)]"
          >
            🔊 VOCAL TRANSLATION SCAN
          </button>
        </div>
      </Html>
    </group>
  );
}
