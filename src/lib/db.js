// src/lib/db.js
import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, orderBy, limit, getDocs, serverTimestamp,
  where, runTransaction
} from 'firebase/firestore'
import { db } from './firebase'

// ── Schema ──────────────────────────────────────────────────────────────────
// users/{uid}:
//   displayName, username, email, photoURL, role ('user'|'admin')
//   ratings: { [topicId]: number }        // 500–2500
//   sessionCounts: { [topicId]: number }  // times practiced
//   totalSessions: number
//   bestFullTestScore: number | null
//   avgMsPerTopic: { [topicId]: number }
//   createdAt, lastSeen
//
// leaderboard/{uid}:
//   uid, displayName, photoURL
//   overallRating, categoryRatings: { [cat]: number }
//   bestFullTestScore, totalSessions
//   updatedAt
// ─────────────────────────────────────────────────────────────────────────────

export const TOPIC_IDS = [
  'foiling','mult11','mult101','mult25','mult75','near100','sq5','sq5059',
  'equidist','reverses','doublehalf','endin5','mixednums','diffsq','sumsq',
  'consqsq','factoring','rem4','rem9','rem11','remexpr','div9trick',
  'squares','cubes','pow2','fracs','seriessum','fibonacci','fibsums','fibprops',
  'divisors','trig','combperm','gcdlcm','bases','repdec','modular','factorial',
  'sqroots','limits','derivs','integrals','logs','complex','probsets','polygons'
]

function defaultRatings() {
  return Object.fromEntries(TOPIC_IDS.map(id => [id, 1000]))
}
function defaultSessionCounts() {
  return Object.fromEntries(TOPIC_IDS.map(id => [id, 0]))
}

export async function getOrCreateUser(firebaseUser) {
  const ref = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    // Update lastSeen
    await updateDoc(ref, { lastSeen: serverTimestamp() })
    return snap.data()
  }
  // New user
  const userData = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Trainee',
    username: (firebaseUser.email?.split('@')[0] || firebaseUser.uid.slice(0, 8)).toLowerCase(),
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || null,
    role: 'user',
    ratings: defaultRatings(),
    sessionCounts: defaultSessionCounts(),
    totalSessions: 0,
    bestFullTestScore: null,
    avgMsPerTopic: {},
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  }
  await setDoc(ref, userData)
  await updateLeaderboard(firebaseUser.uid, userData)
  return userData
}

export async function saveTopicResult(uid, topicId, newRating, avgMs, userData) {
  const ref = doc(db, 'users', uid)
  const newCount = (userData.sessionCounts?.[topicId] || 0) + 1
  const newTotal = (userData.totalSessions || 0) + 1
  await updateDoc(ref, {
    [`ratings.${topicId}`]: newRating,
    [`sessionCounts.${topicId}`]: newCount,
    [`avgMsPerTopic.${topicId}`]: avgMs,
    totalSessions: newTotal,
    lastSeen: serverTimestamp(),
  })
  // Compute category ratings for leaderboard
  const updatedRatings = { ...userData.ratings, [topicId]: newRating }
  const updatedData = { ...userData, ratings: updatedRatings, totalSessions: newTotal }
  await updateLeaderboard(uid, updatedData)
}

export async function saveFullTestResult(uid, score, userData) {
  const ref = doc(db, 'users', uid)
  const best = Math.max(userData.bestFullTestScore || -999, score)
  await updateDoc(ref, {
    bestFullTestScore: best,
    totalSessions: (userData.totalSessions || 0) + 1,
    lastSeen: serverTimestamp(),
  })
  const updatedData = { ...userData, bestFullTestScore: best }
  await updateLeaderboard(uid, updatedData)
}

export async function updateLeaderboard(uid, userData) {
  const cats = ['mult','div','mem','alg','fib','misc','base','calc']
  const TOPIC_CATS = {
    mult:['foiling','mult11','mult101','mult25','mult75','near100','sq5','sq5059','equidist','reverses','doublehalf','endin5','mixednums'],
    div: ['rem4','rem9','rem11','remexpr','div9trick'],
    mem: ['squares','cubes','pow2','fracs','seriessum','divisors','trig'],
    alg: ['diffsq','sumsq','consqsq','factoring','combperm','logs','complex'],
    fib: ['fibonacci','fibsums','fibprops'],
    misc:['gcdlcm','repdec','modular','factorial','sqroots','probsets','polygons'],
    base:['bases'],
    calc:['limits','derivs','integrals'],
  }
  const ratings = userData.ratings || {}
  const categoryRatings = {}
  cats.forEach(cat => {
    const ids = TOPIC_CATS[cat]
    const vals = ids.map(id => ratings[id] || 1000)
    categoryRatings[cat] = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)
  })
  const allVals = Object.values(ratings)
  const overallRating = Math.round(allVals.reduce((a,b)=>a+b,0)/allVals.length)

  await setDoc(doc(db, 'leaderboard', uid), {
    uid,
    displayName: userData.displayName || 'Trainee',
    photoURL: userData.photoURL || null,
    overallRating,
    categoryRatings,
    bestFullTestScore: userData.bestFullTestScore || null,
    totalSessions: userData.totalSessions || 0,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function getLeaderboard(sortField = 'overallRating', limitN = 50) {
  const q = query(
    collection(db, 'leaderboard'),
    orderBy(sortField, 'desc'),
    limit(limitN)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

export async function getCategoryLeaderboard(cat, limitN = 50) {
  const q = query(
    collection(db, 'leaderboard'),
    orderBy(`categoryRatings.${cat}`, 'desc'),
    limit(limitN)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

// Admin only
export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => d.data())
}

export async function updateDisplayName(uid, displayName) {
  await updateDoc(doc(db, 'users', uid), { displayName })
  await updateDoc(doc(db, 'leaderboard', uid), { displayName })
}
