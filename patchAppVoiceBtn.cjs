const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importStatement = "import { VoiceServersModal } from './components/VoiceServersModal';";
code = code.replace("import { BiggestUpdateModal } from './components/BiggestUpdateModal';", importStatement + "\nimport { BiggestUpdateModal } from './components/BiggestUpdateModal';");

const btnHtml = `
              <button 
                onClick={() => setModal('voice', true)}
                className="bg-indigo-500/10 text-indigo-400 border-2 border-indigo-500/20 px-6 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2"
              >
                <Radio size={16} /> VOICE SERVERS
              </button>
`;
code = code.replace("</button>\n              <button \n                onClick={() => setModal('update'", "</button>" + btnHtml + "\n              <button \n                onClick={() => setModal('update'");

code = code.replace("{modals.update && <BiggestUpdateModal onClose={() => setModal('update', false)} />}", "{modals.update && <BiggestUpdateModal onClose={() => setModal('update', false)} />}\n        {modals.voice && <VoiceServersModal onClose={() => setModal('voice', false)} />}");

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched with voice button and modal.');
