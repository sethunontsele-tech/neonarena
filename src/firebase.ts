import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { initializeFirestore, doc, getDoc, setDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs, where, Timestamp, addDoc, getDocFromServer, arrayUnion, arrayRemove, writeBatch } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling to improve reliability in test environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

export type RankType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'neon_elite';

export interface ClanData {
  id: string;
  name: string;
  tag: string;          // 2-4 characters, shown as [TAG]
  color: string;        // hex color for clan banner
  ownerId: string;
  memberIds: string[];
  clanXP: number;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  gamertag: string;
  avatarUrl: string;
  clanId?: string | null;
  customization: {
    skin: string;
    color: string;
    pattern: string;
    accessories: string[];
    weaponSkin: string;
    banner: string;
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
  rank: {
    current: RankType;
    points: number;
    peak: RankType;
    seasonWins: number;
  };
  progression: {
    level: number;
    xp: number;
    weaponXP: Record<string, number>;
    weaponLevels: Record<string, number>;
  };
  economy: {
    credits: number;
    inventory: string[]; // IDs of owned skins, etc.
  };
  battlePass: {
    tier: number;
    xp: number;
    isPremium: boolean;
  };
  social: {
    friends: string[];
    incomingRequests: string[];
    outgoingRequests: string[];
  };
  trophies: Trophy[];
  savedLoadout?: string[];
  isAdmin?: boolean;
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface UpdateRecommendation {
  id: string;
  uid: string;
  gamertag: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  aiResponse: string;
  timestamp: any;
}

export interface MatchRecord {
  id: string;
  date: any;
  duration: number;
  mode: string;
  map: string;
  isRanked: boolean;
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
    rankPointsGained: number;
    xpGained: number;
  }[];
  replayData?: string;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    return handleFirestoreError(error, 'get', `users/${uid}`);
  }
}

export async function saveUserProfile(profile: Partial<UserProfile>) {
  if (!auth.currentUser) return;
  const docRef = doc(db, "users", auth.currentUser.uid);
  try {
    await setDoc(docRef, profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, 'update', `users/${auth.currentUser.uid}`);
  }
}

export async function saveLoadoutPreset(uid: string, loadout: string[]) {
  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, { savedLoadout: loadout }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, 'update', `users/${uid}`);
  }
}

export async function getLoadoutPreset(uid: string): Promise<string[] | null> {
  const profile = await getUserProfile(uid);
  return profile?.savedLoadout || null;
}

export type PlayerStats = UserProfile['stats'] & { 
  kills: number; 
  deaths: number; 
  wins: number; 
  gamesPlayed: number; 
  totalShots: number; 
  totalHits: number; 
  isAdmin?: boolean;
};

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

export async function updateGameStats(uid: string, stats: { kills: number; deaths: number; wins: number; totalShots: number; totalHits: number; score: number; }) {
  const userRef = doc(db, "users", uid);
  try {
    await setDoc(userRef, {
      stats: {
        totalKills: increment(stats.kills),
        totalDeaths: increment(stats.deaths),
        totalWins: increment(stats.wins),
        totalGames: increment(1),
        totalShots: increment(stats.totalShots),
        totalHits: increment(stats.totalHits),
        totalScore: increment(stats.score),
      }
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, 'update', `users/${uid}`);
  }
}

export const createClan = async (ownerId: string, name: string, tag: string, color: string) => {
  const clanRef = doc(collection(db, 'clans'));
  const clan: ClanData = {
    id: clanRef.id,
    name,
    tag,
    color,
    ownerId,
    memberIds: [ownerId],
    clanXP: 0,
    createdAt: Date.now()
  };
  try {
    const batch = writeBatch(db);
    batch.set(clanRef, clan);
    batch.update(doc(db, 'users', ownerId), { clanId: clanRef.id });
    await batch.commit();
    return clanRef.id;
  } catch (err) {
    handleFirestoreError(err, 'write', `clans/${clanRef.id}`);
  }
};

export const getClan = async (id: string): Promise<ClanData | null> => {
  try {
    const d = await getDoc(doc(db, 'clans', id));
    return d.exists() ? d.data() as ClanData : null;
  } catch (err) {
    handleFirestoreError(err, 'get', `clans/${id}`);
  }
};

export const joinClan = async (userId: string, clanId: string) => {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'clans', clanId), { memberIds: arrayUnion(userId) });
    batch.update(doc(db, 'users', userId), { clanId });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, 'write', `clans/${clanId}`);
  }
};

export const leaveClan = async (userId: string, clanId: string) => {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'clans', clanId), { memberIds: arrayRemove(userId) });
    batch.update(doc(db, 'users', userId), { clanId: null });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, 'write', `clans/${clanId}`);
  }
};

export const getTopClans = async (count: number = 10): Promise<ClanData[]> => {
  try {
    const q = query(collection(db, 'clans'), orderBy('clanXP', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as ClanData);
  } catch (err) {
    handleFirestoreError(err, 'list', 'clans');
  }
};

export const searchUsers = async (query: string): Promise<UserProfile[]> => {
  const q = query.toLowerCase();
  const usersRef = collection(db, 'users');
  try {
    const snapshot = await getDocs(usersRef);
    return snapshot.docs
      .map(doc => doc.data() as UserProfile)
      .filter(u => 
        (u.gamertag?.toLowerCase() || '').includes(q) || 
        (u.displayName?.toLowerCase() || '').includes(q)
      );
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};

export const sendFriendRequest = async (fromUid: string, toUid: string) => {
  const fromRef = doc(db, 'users', fromUid);
  const toRef = doc(db, 'users', toUid);
  
  const batch = writeBatch(db);
  batch.update(fromRef, {
    'social.outgoingRequests': arrayUnion(toUid)
  });
  batch.update(toRef, {
    'social.incomingRequests': arrayUnion(fromUid)
  });
  await batch.commit();
};

export const acceptFriendRequest = async (myUid: string, friendUid: string) => {
  const myRef = doc(db, 'users', myUid);
  const friendRef = doc(db, 'users', friendUid);
  
  const batch = writeBatch(db);
  batch.update(myRef, {
    'social.friends': arrayUnion(friendUid),
    'social.incomingRequests': arrayRemove(friendUid)
  });
  batch.update(friendRef, {
    'social.friends': arrayUnion(myUid),
    'social.outgoingRequests': arrayRemove(myUid)
  });
  await batch.commit();
};

export const rejectFriendRequest = async (myUid: string, friendUid: string) => {
  const myRef = doc(db, 'users', myUid);
  const friendRef = doc(db, 'users', friendUid);
  
  const batch = writeBatch(db);
  batch.update(myRef, {
    'social.incomingRequests': arrayRemove(friendUid)
  });
  batch.update(friendRef, {
    'social.outgoingRequests': arrayRemove(myUid)
  });
  await batch.commit();
};

export const getFriends = async (uid: string): Promise<UserProfile[]> => {
  const user = await getUserProfile(uid);
  if (!user?.social?.friends || user.social.friends.length === 0) return [];
  
  const friends: UserProfile[] = [];
  for (const fUid of user.social.friends) {
    const f = await getUserProfile(fUid);
    if (f) friends.push(f);
  }
  return friends;
};

export const getFriendRequests = async (uid: string): Promise<UserProfile[]> => {
  const user = await getUserProfile(uid);
  if (!user?.social?.incomingRequests || user.social.incomingRequests.length === 0) return [];
  
  const requests: UserProfile[] = [];
  for (const rUid of user.social.incomingRequests) {
    const r = await getUserProfile(rUid);
    if (r) requests.push(r);
  }
  return requests;
};

export async function recordMatch(match: Omit<MatchRecord, 'id'>): Promise<MatchRecord> {
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
  
  return matchData as MatchRecord;
}

export async function getMatchHistory(uid: string): Promise<MatchRecord[]> {
  const snapshot = await getDocs(collection(db, "matches"));
  const getTime = (date: any) => {
    if (!date) return 0;
    if (typeof date.toMillis === 'function') return date.toMillis();
    if (typeof date.toDate === 'function') return date.toDate().getTime();
    if (date instanceof Date) return date.getTime();
    return new Date(date).getTime();
  };
  return snapshot.docs
    .map(doc => doc.data() as MatchRecord)
    .filter(m => m.players.some(p => p.uid === uid))
    .sort((a, b) => getTime(b.date) - getTime(a.date))
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
          weaponSkin: 'default',
          banner: 'default'
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
        },
        rank: {
          current: 'bronze',
          points: 0,
          peak: 'bronze',
          seasonWins: 0
        },
        progression: {
          level: 1,
          xp: 0,
          weaponXP: {},
          weaponLevels: {}
        },
        economy: {
          credits: 0,
          inventory: []
        },
        battlePass: {
          tier: 1,
          xp: 0,
          isPremium: false
        },
        social: {
          friends: [],
          incomingRequests: [],
          outgoingRequests: []
        },
        trophies: []
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

export async function submitRecommendation(rec: Omit<UpdateRecommendation, 'id' | 'timestamp'>) {
  try {
    const recRef = collection(db, "recommendations");
    const docRef = await addDoc(recRef, {
      ...rec,
      timestamp: Timestamp.now(),
      status: 'pending'
    });
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting recommendation", error);
    throw error;
  }
}

export async function getTrophies(): Promise<Trophy[]> {
  try {
    const snapshot = await getDocs(collection(db, "trophies"));
    return snapshot.docs.map(doc => doc.data() as Trophy);
  } catch (error) {
    console.error("Error fetching trophies", error);
    return [];
  }
}

export async function addClanXP(clanId: string, amount: number): Promise<void> {
  const ref = doc(db, 'clans', clanId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { clanXP: (snap.data().clanXP || 0) + amount });
  }
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  if (error.code === 'permission-denied' || error.message?.includes('insufficient permissions')) {
    const authInfo = auth.currentUser ? {
      userId: auth.currentUser.uid,
      email: auth.currentUser.email || '',
      emailVerified: auth.currentUser.emailVerified,
      isAnonymous: auth.currentUser.isAnonymous,
      providerInfo: auth.currentUser.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || '',
      })),
    } : {
      userId: 'anonymous',
      email: '',
      emailVerified: false,
      isAnonymous: true,
      providerInfo: [],
    };

    const errorInfo: FirestoreErrorInfo = {
      error: error.message || 'Permission denied',
      operationType: operation,
      path,
      authInfo,
    };

    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection successful.");
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || (error as any).code === 'unavailable')) {
      console.error("Please check your Firebase configuration. The client is offline or backend unavailable.");
    }
  }
}
testConnection();
