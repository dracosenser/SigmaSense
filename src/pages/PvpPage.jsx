// src/pages/PvpPage.jsx
// PvP Arena — uses Firestore as a real-time matchmaking & game state store.
// Both players see the same question simultaneously. First to answer correctly wins the round.
// Best of 7 rounds per match.

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/AuthContext'
import { TOPICS, ratingColor } from '../data/topics'
import { db } from '../lib/firebase'
import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, where, orderBy, limit, getDocs, serverTimestamp, deleteDoc
} from 'firebase/firestore'
import styles from './PvpPage.module.css'

const ROUNDS = 7
const ROUND_TIME_MS = 15000

function pickQuestion() {
  const t = TOPICS.filter(t => t.diff !== 'HARD')[Math.floor(Math.random() * TOPICS.filter(t=>t.diff!=='HARD').length)]
  return t.gen()
}

export default function PvpPage() {
  const { user, userData } = useAuth()
  const [phase, setPhase]   = useState('lobby')  // lobby | searching | matched | playing | results
  const [matchId, setMatchId] = useState(null)
  const [match, setMatch]   = useState(null)
  const [answer, setAnswer] = useState('')
  const [roundResult, setRoundResult] = useState(null) // 'win'|'lose'|'tie'
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_MS)
  const timerRef = useRef(null)
  const unsubRef = useRef(null)
  const inputRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(timerRef.current)
    unsubRef.current?.()
    if (matchId) leaveMatch(matchId, user.uid)
  }, [matchId])

  // Subscribe to match updates
  useEffect(() => {
    if (!matchId) return
    unsubRef.current?.()
    unsubRef.current = onSnapshot(doc(db, 'pvp_matches', matchId), snap => {
      if (!snap.exists()) { setPhase('lobby'); return }
      setMatch(snap.data())
    })
    return () => unsubRef.current?.()
  }, [matchId])

  // Watch match state changes
  useEffect(() => {
    if (!match) return
    if (match.status === 'active' && phase !== 'playing') {
      setPhase('playing')
      startRoundTimer()
    }
    if (match.status === 'finished' && phase !== 'results') {
      clearInterval(timerRef.current)
      setPhase('results')
    }
  }, [match?.status])

  // Watch round answers
  useEffect(() => {
    if (!match || match.status !== 'active') return
    const round = match.rounds?.[match.currentRound]
    if (!round) return
    const myAns   = round.answers?.[user.uid]
    const theirId = getOpponentId()
    const theirAns = round.answers?.[theirId]
    if (myAns !== undefined && theirAns !== undefined) {
      // Both answered — evaluate
      clearInterval(timerRef.current)
      const myOk    = myAns.ok
      const theirOk = theirAns.ok
      if (myOk && !theirOk)       setRoundResult('win')
      else if (!myOk && theirOk)  setRoundResult('lose')
      else if (myOk && theirOk)   setRoundResult(myAns.ms < theirAns.ms ? 'win' : myAns.ms > theirAns.ms ? 'lose' : 'tie')
      else                        setRoundResult('tie')
    }
  }, [match?.rounds, match?.currentRound])

  function getOpponentId() {
    return match?.players?.find(id => id !== user.uid)
  }

  function startRoundTimer() {
    clearInterval(timerRef.current)
    setTimeLeft(ROUND_TIME_MS)
    const start = Date.now()
    timerRef.current = setInterval(() => {
      const remaining = ROUND_TIME_MS - (Date.now() - start)
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        setTimeLeft(0)
        submitTimeout()
      } else {
        setTimeLeft(remaining)
      }
    }, 50)
  }

  async function findMatch() {
    setPhase('searching')
    try {
      // Look for open match
      const q = query(collection(db, 'pvp_matches'),
        where('status', '==', 'waiting'),
        where('players', 'array-contains', 'ANY'), // workaround: just check open games
        limit(1))
      const snap = await getDocs(query(collection(db, 'pvp_matches'),
        where('status', '==', 'waiting'), limit(5)))

      let joined = false
      for (const d of snap.docs) {
        const data = d.data()
        if (data.players?.includes(user.uid)) continue  // don't join own game
        if (data.players?.length < 2) {
          // Join this match
          const questions = Array.from({length: ROUNDS}, () => pickQuestion())
          await updateDoc(d.ref, {
            players: [...data.players, user.uid],
            playerNames: { ...data.playerNames, [user.uid]: userData?.displayName || 'Player' },
            status: 'active',
            rounds: questions.map((q, i) => ({
              n: i,
              q: q.q,
              a: String(q.a),
              answers: {},
            })),
            currentRound: 0,
          })
          setMatchId(d.id)
          joined = true
          break
        }
      }

      if (!joined) {
        // Create new match
        const ref = await addDoc(collection(db, 'pvp_matches'), {
          status: 'waiting',
          players: [user.uid],
          playerNames: { [user.uid]: userData?.displayName || 'Player' },
          scores: { [user.uid]: 0 },
          rounds: [],
          currentRound: 0,
          createdAt: serverTimestamp(),
        })
        setMatchId(ref.id)
      }
    } catch(e) {
      console.error('PvP error:', e)
      setPhase('lobby')
    }
  }

  async function submitAnswer() {
    if (!match || match.status !== 'active') return
    const round = match.rounds[match.currentRound]
    if (!round) return
    const userAnswer = answer.trim()
    const start = Date.now()
    const ok = String(userAnswer).toLowerCase() === String(round.a).toLowerCase()
      || (!isNaN(userAnswer) && !isNaN(round.a) && Math.abs(parseFloat(userAnswer) - parseFloat(round.a)) < 0.0011)

    clearInterval(timerRef.current)

    await updateDoc(doc(db, 'pvp_matches', matchId), {
      [`rounds.${match.currentRound}.answers.${user.uid}`]: {
        val: userAnswer,
        ok,
        ms: ROUND_TIME_MS - timeLeft,
      }
    })
    setAnswer('')
  }

  async function submitTimeout() {
    if (!match) return
    await updateDoc(doc(db, 'pvp_matches', matchId), {
      [`rounds.${match.currentRound}.answers.${user.uid}`]: {
        val: '',
        ok: false,
        ms: ROUND_TIME_MS,
      }
    }).catch(() => {})
  }

  async function nextRound() {
    if (!match) return
    const nextR = match.currentRound + 1
    // Update scores
    const round = match.rounds[match.currentRound]
    const opId  = getOpponentId()
    const myAns = round.answers[user.uid]
    const theirAns = round.answers[opId]
    const myWin  = myAns?.ok && (!theirAns?.ok || myAns.ms < theirAns.ms)
    const oppWin = theirAns?.ok && (!myAns?.ok || theirAns.ms < myAns.ms)

    const newScores = { ...match.scores }
    if (myWin) newScores[user.uid] = (newScores[user.uid] || 0) + 1
    if (oppWin) newScores[opId] = (newScores[opId] || 0) + 1

    if (nextR >= ROUNDS) {
      await updateDoc(doc(db, 'pvp_matches', matchId), { scores: newScores, status: 'finished' })
    } else {
      await updateDoc(doc(db, 'pvp_matches', matchId), {
        scores: newScores,
        currentRound: nextR,
      })
      setRoundResult(null)
      setAnswer('')
      startRoundTimer()
    }
  }

  async function leaveMatch(mid, uid) {
    try {
      const snap = await getDocs(query(collection(db, 'pvp_matches'), where('status', '==', 'waiting')))
      snap.docs.forEach(async d => {
        if (d.id === mid && d.data().players.includes(uid)) {
          await deleteDoc(d.ref)
        }
      })
    } catch {}
  }

  async function cancelSearch() {
    if (matchId) await leaveMatch(matchId, user.uid)
    setMatchId(null)
    setPhase('lobby')
  }

  const myScore  = match?.scores?.[user.uid] || 0
  const oppId    = getOpponentId()
  const oppScore = match?.scores?.[oppId] || 0
  const oppName  = match?.playerNames?.[oppId] || 'Opponent'
  const currentRound = match?.rounds?.[match?.currentRound]
  const timerPct = timeLeft / ROUND_TIME_MS
  const timerColor = timerPct > 0.5 ? '#00f0ff' : timerPct > 0.25 ? '#ffd700' : '#ff3366'

  // Final results
  const iWon = phase === 'results' && myScore > oppScore

  return (
    <div className={styles.page}>
      {phase === 'lobby' && (
        <div className={styles.lobbyBox}>
          <div className={styles.arenaTitle}>⚔ PVP ARENA</div>
          <div className={styles.arenaSub}>Challenge other players in real-time number sense battles</div>
          <div className={styles.rules}>
            <div className={styles.ruleRow}>Best of {ROUNDS} rounds</div>
            <div className={styles.ruleRow}>Both players see the same question simultaneously</div>
            <div className={styles.ruleRow}>First correct answer wins the round. Ties go to fastest.</div>
            <div className={styles.ruleRow}>{ROUND_TIME_MS/1000}s per question — unanswered counts as wrong</div>
          </div>
          <button className={styles.findBtn} onClick={findMatch}>FIND MATCH ▶</button>
        </div>
      )}

      {phase === 'searching' && (
        <div className={styles.lobbyBox}>
          <div className={styles.searchingTitle}>SEARCHING FOR OPPONENT</div>
          <div className={styles.searchAnim}>
            <div className={styles.searchDot} style={{animationDelay:'0s'}} />
            <div className={styles.searchDot} style={{animationDelay:'0.2s'}} />
            <div className={styles.searchDot} style={{animationDelay:'0.4s'}} />
          </div>
          <div className={styles.searchSub}>Waiting for another player to join…</div>
          <button className={styles.cancelBtn} onClick={cancelSearch}>CANCEL</button>
        </div>
      )}

      {(phase === 'playing' || phase === 'matched') && match && (
        <div className={styles.arena}>
          {/* Score header */}
          <div className={styles.scoreHeader}>
            <div className={styles.playerScore}>
              <div className={styles.playerLabel}>YOU</div>
              <div className={styles.scoreNum} style={{color:'var(--cyan)'}}>{myScore}</div>
            </div>
            <div className={styles.vsBlock}>
              <div className={styles.roundLabel}>ROUND {(match.currentRound||0)+1} / {ROUNDS}</div>
              <div className={styles.vsText}>VS</div>
            </div>
            <div className={styles.playerScore}>
              <div className={styles.playerLabel}>{oppName}</div>
              <div className={styles.scoreNum} style={{color:'var(--red)'}}>{oppScore}</div>
            </div>
          </div>

          {/* Timer bar */}
          <div className={styles.timerBar}>
            <div className={styles.timerFill}
              style={{width:`${timerPct*100}%`, background: timerColor, transition:'width 0.05s linear'}} />
          </div>

          {/* Round result overlay */}
          {roundResult && (
            <div className={styles.roundOverlay}>
              <div className={styles.roundResultText}
                style={{color: roundResult==='win'?'var(--green)':roundResult==='lose'?'var(--red)':'var(--gold)'}}>
                {roundResult === 'win' ? '✓ YOU WIN THIS ROUND!' : roundResult === 'lose' ? '✗ OPPONENT WINS' : '= TIE'}
              </div>
              <div className={styles.roundAnswerReveal}>
                Correct answer: <strong>{currentRound?.a}</strong>
              </div>
              <button className={styles.nextRoundBtn} onClick={nextRound}>
                {(match.currentRound||0)+1 >= ROUNDS ? 'SEE RESULTS' : 'NEXT ROUND ▶'}
              </button>
            </div>
          )}

          {!roundResult && (
            <div className={styles.qBox}>
              <div className={styles.arenaQ}>{currentRound?.q}</div>
              <input
                ref={inputRef}
                className={styles.arenaInput}
                type="text"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitAnswer()}
                placeholder="ANSWER"
                autoComplete="off"
                inputMode="decimal"
                autoFocus
              />
              <button className={styles.arenaSubmit} onClick={submitAnswer}>
                SUBMIT ▶
              </button>
              {match.rounds?.[match.currentRound]?.answers?.[user.uid] !== undefined && (
                <div className={styles.waitingMsg}>Answer submitted — waiting for opponent…</div>
              )}
            </div>
          )}
        </div>
      )}

      {phase === 'results' && match && (
        <div className={styles.lobbyBox}>
          <div className={styles.finalResult} style={{color: iWon ? 'var(--green)' : 'var(--red)'}}>
            {iWon ? '🏆 VICTORY!' : myScore === oppScore ? '= DRAW' : '✗ DEFEAT'}
          </div>
          <div className={styles.finalScore}>{myScore} — {oppScore}</div>
          <div className={styles.finalNames}>
            You vs {oppName}
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <button className={styles.findBtn} onClick={() => { setPhase('lobby'); setMatch(null); setMatchId(null); }}>
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
