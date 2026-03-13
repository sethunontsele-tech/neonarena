import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs, where, Timestamp } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  uid: string;
  displayName: string;
  gamertag: string;
  avatarUrl: string;
  customization: {
    skin: string;
    color: string;
    pattern: string;
    accessories: string[];
    weaponSkin: string;
  };
  stats: {
    totalKills: number;
    totalDeaths: number;
    totalWins: number;
    totalGames: number;
    totalShots: number;
    totalHits: number;
    winStreak: number;
    maxWinStreak: number;
    totalScore: number;
  };
}

export interface MatchRecord {
  id: string;
  date: any;
  duration: number;
  mode: string;
  map: string;
  players: {
    uid: string;
    displayName: string;
    kills: number;
    deaths: number;
    assists: number;
    score: number;
    accuracy: number;
    team: string;
    result: 'win' | 'loss' | 'draw';
  }[];
  replayData?: string;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function saveUserProfile(profile: Partial<UserProfile>) {
  if (!auth.currentUser) return;
  const docRef = doc(db, "users", auth.currentUser.uid);
  await setDoc(docRef, profile, { merge: true });
}

export type PlayerStats = UserProfile['stats'] & { kills: number; deaths: number; wins: number; gamesPlayed: number; totalShots: number; totalHits: number; };

export async function getPlayerStats(uid: string): Promise<any> {
  const profile = await getUserProfile(uid);
  if (!profile) return null;
  return {
    ...profile.stats,
    kills: profile.stats.totalKills,
    deaths: profile.stats.totalDeaths,
    wins: profile.stats.totalWins,
    gamesPlayed: profile.stats.totalGames,
    totalShots: profile.stats.totalShots,
    totalHits: profile.stats.totalHits
  };
}

export async function updateGameStats(uid: string, stats: { kills: number; deaths: number; wins: number; totalShots: number; totalHits: number; }) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    stats: {
      totalKills: increment(stats.kills),
      totalDeaths: increment(stats.deaths),
      totalWins: increment(stats.wins),
      totalGames: increment(1),
      totalShots: increment(stats.totalShots),
      totalHits: increment(stats.totalHits),
    }
  }, { merge: true });
}

export async function recordMatch(match: Omit<MatchRecord, 'id'>) {
  const matchRef = doc(collection(db, "matches"));
  const matchData = { ...match, id: matchRef.id, date: Timestamp.now() };
  await setDoc(matchRef, matchData);

  // Update stats for each player
  for (const player of match.players) {
    const userRef = doc(db, "users", player.uid);
    const isWin = player.result === 'win';
    
    await setDoc(userRef, {
      stats: {
        totalKills: increment(player.kills),
        totalDeaths: increment(player.deaths),
        totalWins: increment(isWin ? 1 : 0),
        totalGames: increment(1),
        totalScore: increment(player.score),
        totalShots: increment(0), // Would need more data
        totalHits: increment(0),
        winStreak: isWin ? increment(1) : 0,
      }
    }, { merge: true });

    // Handle max win streak separately if needed or just update it
    const profile = await getUserProfile(player.uid);
    if (profile && profile.stats.winStreak > profile.stats.maxWinStreak) {
      await updateDoc(userRef, { "stats.maxWinStreak": profile.stats.winStreak });
    }
  }
}

export async function getMatchHistory(uid: string): Promise<MatchRecord[]> {
  const q = query(
    collection(db, "matches"),
    where("players", "array-contains-any", [{ uid }]), // This might not work as expected with objects
    orderBy("date", "desc"),
    limit(20)
  );
  // Alternative: query all and filter in JS if array-contains with objects is tricky
  const snapshot = await getDocs(collection(db, "matches"));
  return snapshot.docs
    .map(doc => doc.data() as MatchRecord)
    .filter(m => m.players.some(p => p.uid === uid))
    .sort((a, b) => b.date.toMillis() - a.date.toMillis())
    .slice(0, 20);
}

export async function getLeaderboard(metric: string = "totalKills"): Promise<UserProfile[]> {
  const q = query(
    collection(db, "users"),
    orderBy(`stats.${metric}`, "desc"),
    limit(10)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as UserProfile);
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const profile = await getUserProfile(user.uid);
    if (!profile) {
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || "Unknown Player",
        gamertag: user.displayName?.split(' ')[0] || "Player",
        avatarUrl: user.photoURL || "",
        customization: {
          skin: 'neon',
          color: '#00ffff',
          pattern: 'none',
          accessories: [],
          weaponSkin: 'default'
        },
        stats: {
          totalKills: 0,
          totalDeaths: 0,
          totalWins: 0,
          totalGames: 0,
          totalShots: 0,
          totalHits: 0,
          winStreak: 0,
          maxWinStreak: 0,
          totalScore: 0
        }
      };
      await saveUserProfile(newProfile);
    }
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
}
