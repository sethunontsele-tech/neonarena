const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const scopesCode = `
export const googleProvider = new GoogleAuthProvider();
const classroomScopes = [
  'https://www.googleapis.com/auth/classroom.addons.student',
  'https://www.googleapis.com/auth/classroom.addons.teacher',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
  'https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly',
  'https://www.googleapis.com/auth/classroom.guardianlinks.students',
  'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/classroom.profile.photos',
  'https://www.googleapis.com/auth/classroom.push-notifications',
  'https://www.googleapis.com/auth/classroom.rosters',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  'https://www.googleapis.com/auth/classroom.topics',
  'https://www.googleapis.com/auth/classroom.topics.readonly'
];
classroomScopes.forEach(s => googleProvider.addScope(s));

let cachedAccessToken = null;
export const getAccessToken = () => cachedAccessToken;

import { onAuthStateChanged } from "firebase/auth";
onAuthStateChanged(auth, (user) => {
  if (!user) cachedAccessToken = null;
});
`;
code = code.replace("export const googleProvider = new GoogleAuthProvider();", scopesCode);
code = code.replace("const result = await signInWithPopup(auth, googleProvider);", "const result = await signInWithPopup(auth, googleProvider);\n    const credential = GoogleAuthProvider.credentialFromResult(result);\n    if (credential && credential.accessToken) { cachedAccessToken = credential.accessToken; }");
code = code.replace("export async function logout() {\n  await signOut(auth);\n}", "export async function logout() {\n  await signOut(auth);\n  cachedAccessToken = null;\n}");

fs.writeFileSync('src/firebase.ts', code);
console.log('Patched Firebase auth');
