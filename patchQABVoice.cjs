const fs = require('fs');
let code = fs.readFileSync('src/components/QuickAccessBar.tsx', 'utf8');

code = code.replace("import { \n  Swords,", "import { \n  Radio, Swords,");
code = code.replace("type TabId = 'skills' | 'inventory' | 'items' | 'armor' | 'staffs' | 'magic' | 'potions' | 'spells' | 'settings';", "type TabId = 'voice' | 'skills' | 'inventory' | 'items' | 'armor' | 'staffs' | 'magic' | 'potions' | 'spells' | 'settings';");
code = code.replace("const TABS: { id: TabId;", "const TABS: { id: TabId;");
code = code.replace("    { id: 'skills'", "    { id: 'voice', label: 'Comms', icon: Radio, color: 'text-cyan-400' },\n    { id: 'skills'");

// It might be easiest to just render VoiceServersModal directly when voice tab is open, but QuickAccessBar renders its own panels.
// I will create a `VoicePanel` in QuickAccessBar.
const voicePanelCall = "{activeTab === 'voice' && <VoicePanel />}";
code = code.replace("{activeTab === 'skills' && <SkillsPanel />}", voicePanelCall + "\n            {activeTab === 'skills' && <SkillsPanel />}");

const voicePanelImpl = `
function VoicePanel() {
  const { voiceServers, activeVoiceServer, joinVoiceServer, leaveVoiceServer, createVoiceServer, isMuted } = useGameStore();
  const [newName, setNewName] = useState('');

  return (
    <div className="flex gap-4 h-full">
      <div className="w-1/3 border-r border-white/10 pr-4 space-y-2">
        <div className="text-cyan-400 font-black uppercase text-xs mb-4">Voice Servers</div>
        {Object.values(voiceServers).map(vs => (
          <button
            key={vs.id}
            onClick={() => joinVoiceServer(vs.id)}
            className={\`w-full text-left p-3 rounded-xl flex items-center justify-between \${activeVoiceServer === vs.id ? 'bg-cyan-500/20 border border-cyan-500/50 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}\`}
          >
            <span className="font-bold text-sm truncate">{vs.name}</span>
            <span className="text-[10px] bg-black/50 px-2 py-1 rounded-full">{Object.keys(vs.participants || {}).length}</span>
          </button>
        ))}
        <form onSubmit={e => { e.preventDefault(); if(newName) { createVoiceServer(newName); setNewName(''); } }} className="flex gap-2 mt-4">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New..." className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white" />
          <button type="submit" className="bg-cyan-600 px-3 rounded text-white font-bold text-xs">+</button>
        </form>
      </div>
      <div className="flex-1 pl-2">
        {activeVoiceServer ? (
          <div className="h-full flex flex-col">
            <h3 className="text-xl font-black text-white italic mb-4">{voiceServers[activeVoiceServer]?.name}</h3>
            <div className="grid grid-cols-3 gap-3 flex-1 content-start">
              {Object.entries(voiceServers[activeVoiceServer]?.participants || {}).map(([id, name]) => (
                <div key={id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-2"><span className="font-bold text-white">{String(name).charAt(0).toUpperCase()}</span></div>
                  <div className="text-xs text-zinc-300 truncate w-full text-center">{name}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 border-t border-white/10 pt-4">
              <button onClick={() => useGameStore.setState(s => ({ isMuted: !s.isMuted }))} className={\`px-4 py-2 rounded font-bold text-xs uppercase \${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'}\`}>
                {isMuted ? 'Muted' : 'Mic On'}
              </button>
              <button onClick={leaveVoiceServer} className="bg-red-500/20 text-red-400 px-4 py-2 rounded font-bold text-xs uppercase">Disconnect</button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-500 font-mono text-sm">Join a voice server to communicate.</div>
        )}
      </div>
    </div>
  );
}
`;
code = code.replace("// PANELS IMPLEMENTATION", "// PANELS IMPLEMENTATION\n" + voicePanelImpl);

fs.writeFileSync('src/components/QuickAccessBar.tsx', code);
console.log('QuickAccessBar.tsx patched with Voice Panel.');
