const fs = require('fs');
let code = fs.readFileSync('src/components/BiggestUpdateModal.tsx', 'utf8');

const importStatement = "import { AwakeningEvent } from './AwakeningEvent';";
code = code.replace("import { soundService }", importStatement + "\nimport { soundService }");

const stateCode = `
  const [showEvent, setShowEvent] = React.useState(false);

  if (showEvent) {
    return <AwakeningEvent onComplete={onClose} />;
  }
`;

code = code.replace("const features = [", stateCode + "\n  const features = [");

code = code.replace(
  "onClick={() => { onClose(); soundService.playSFX('ui_click'); }}",
  "onClick={() => { setShowEvent(true); soundService.playSFX('ui_click'); }}"
);

fs.writeFileSync('src/components/BiggestUpdateModal.tsx', code);
console.log('Modal event patched.');
