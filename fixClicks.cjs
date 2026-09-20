const fs = require('fs');
let code = fs.readFileSync('src/components/BiggestUpdateModal.tsx', 'utf8');

code = code.replace(
  "onClick={() => { setShowEvent(true); soundService.playSFX('ui_click'); }}",
  "onClick={() => { onClose(); soundService.playSFX('ui_click'); }}"
);

code = code.replace(
  "onClick={() => { onClose(); soundService.playSFX('ui_click'); }}",
  "onClick={() => { onClose(); soundService.playSFX('ui_click'); }}" // actually wait, they will be both onClose now
);
