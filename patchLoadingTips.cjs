const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newTips = `
        neon_megacity: [
          "TIP: Use Wall-Running to traverse the massive skyscrapers.",
          "TIP: The Undercity holds rare energy weapons, but beware Phase Hunters.",
          "TIP: 456MB UPDATE: Experiment with the new combo system for extra damage."
        ],
        cyber_factory: [
          "TIP: Watch out for active machinery and conveyor belts.",
          "TIP: Hack security terminals to turn the factory defenses against enemies.",
          "TIP: 456MB UPDATE: Elite Titans patrol the deeper assembly lines."
        ],
        abandoned_arena: [
          "TIP: This old arena is unstable. Expect random energy storms and layout changes.",
          "TIP: Search for hidden switches to unlock forgotten laboratories.",
          "TIP: 456MB UPDATE: Adaptive Arena AI learns from your combat style here."
        ],
        neon_wasteland: [
          "TIP: The massive wasteland requires vehicles or high mobility skills to navigate.",
          "TIP: 456MB UPDATE: Giant mechanical bosses spawn near the ruins.",
          "TIP: Watch out for severe gravity anomalies!"
        ],
        sky_arena: [
          "TIP: Falling is fatal. Master double jumps and grapples to stay alive.",
          "TIP: Destroy the energy bridges to isolate Swarm Bots.",
          "TIP: 456MB UPDATE: Experience massive vertical combat in this expansion."
        ],
`;

code = code.replace("minecraft: [", newTips + "        minecraft: [");
fs.writeFileSync('src/App.tsx', code);
console.log('Loading tips patched.');
