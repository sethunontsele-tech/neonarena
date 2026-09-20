const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace("Gift } from 'lucide-react';", "Gift, GraduationCap } from 'lucide-react';");

fs.writeFileSync('src/App.tsx', appCode);
