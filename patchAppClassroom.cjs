const fs = require('fs');
let code = fs.readFileSync('src/store.ts', 'utf8');

code = code.replace("modals: {\n    voice: false,", "modals: {\n    classroom: false,\n    voice: false,");
code = code.replace("modals: { voice: boolean;", "modals: { classroom: boolean; voice: boolean;");

fs.writeFileSync('src/store.ts', code);
console.log('store.ts patched for classroom modal state.');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const importStatement = "import { ClassroomMode } from './components/ClassroomMode';";
appCode = appCode.replace("import { VoiceServersModal } from './components/VoiceServersModal';", importStatement + "\nimport { VoiceServersModal } from './components/VoiceServersModal';");

const btnHtml = `
              <button 
                onClick={() => setModal('classroom', true)}
                className="bg-amber-500/10 text-amber-400 border-2 border-amber-500/20 px-6 rounded-xl font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2"
              >
                <GraduationCap size={16} /> EDUCATION
              </button>
`;
appCode = appCode.replace("</button>\n              <button \n                onClick={() => setModal('voice'", "</button>\n" + btnHtml + "              <button \n                onClick={() => setModal('voice'");

appCode = appCode.replace("{modals.voice && <VoiceServersModal onClose={() => setModal('voice', false)} />}", "{modals.voice && <VoiceServersModal onClose={() => setModal('voice', false)} />}\n        {modals.classroom && <ClassroomMode onClose={() => setModal('classroom', false)} />}");

if (!appCode.includes("GraduationCap")) {
  appCode = appCode.replace("from 'lucide-react';", "GraduationCap, } from 'lucide-react';");
}

fs.writeFileSync('src/App.tsx', appCode);
console.log('App.tsx patched with education button.');
