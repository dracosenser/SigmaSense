// src/pages/FullTestPage.jsx
// UIL Number Sense Scoring:
//   +5 per correct answer
//   -9 per wrong answer (wrong = answered but incorrect)
//   0 per skipped (skipped = left blank / no answer submitted)
//   Deductions ONLY apply up to the last question ATTEMPTED (answered or wrong).
//   Questions after the last attempt = no penalty.
//
// Example: 40 attempted, 10 wrong → (40×5) - (10×9) = 200 - 90 = 110

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { TOPICS, calcNewRating, ratingColor } from '../data/topics'
import { saveFullTestResult, saveTopicResult } from '../lib/db'
import styles from './FullTestPage.module.css'

const TOTAL_QS  = 80
const TEST_SECS = 600  // 10 minutes

function buildTest(difficulty) {
  const pool = difficulty === 'middle'
    ? TOPICS.filter(t => t.diff !== 'HARD' || ['factoring','sumsq','remexpr'].includes(t.id))
    : TOPICS

  const questions = []
  let ti = 0
  while (questions.length < TOTAL_QS) {
    const t = pool[ti % pool.length]
    const q = t.gen()
    questions.push({ ...q, topicId: t.id, topicName: t.name, cat: t.cat })
    ti++
  }
  // Shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]]
  }
  return questions
}

function calcUILScore(results) {
  // Find last question that was ATTEMPTED (answered — right or wrong, not skipped/unanswered)
  let lastAttempted = -1
  results.forEach((r, i) => {
    if (r.attempted) lastAttempted = i
  })
  if (lastAttempted < 0) return { score: 0, correct: 0, wrong: 0, skipped: 0 }

  let correct = 0, wrong = 0, skipped = 0
  results.slice(0, lastAttempted + 1).forEach(r => {
    if (!r.attempted) { skipped++; return } // blank within range = no deduction BUT it's past "last attempted" if something comes after
    if (r.ok)  correct++
    else       wrong++
  })

  const score = correct * 5 - wrong * 9
  return { score, correct, wrong, skipped: results.length - correct - wrong }
}

function checkAnswer(yours, correct) {
  const y = String(yours).trim().replace(/\s/g, '').toLowerCase()
  const c = String(correct).trim().replace(/\s/g, '').toLowerCase()
  if (!y) return null // empty = not attempted
  if (y === c) return true
  if (!isNaN(y) && !isNaN(c) && Math.abs(parseFloat(y) - parseFloat(c)) < 0.0011) return true
  return false
}

export default function FullTestPage() {
  const { userData, setUserData, user } = useAuth()
  const navigate = useNavigate()
  const [phase, setPhase]     = useState('setup') // setup | running | results
  const [difficulty, setDiff] = useState('high')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers]     = useState([])   // array of strings, one per question
  const [qIdx, setQIdx]       = useState(0)
  const [timeLeft, setTimeLeft]   = useState(TEST_SECS)
  const [results, setResults]     = useState([])
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  const startTest = () => {
    const qs = buildTest(difficulty)
    setQuestions(qs)
    setAnswers(Array(qs.length).fill(''))
    setQIdx(0)
    setTimeLeft(TEST_SECS)
    setPhase('running')
  }

  // Countdown
  useEffect(() => {
    if (phase !== 'running') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); finishTest(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  useEffect(() => {
    if (phase === 'running') inputRef.current?.focus()
  }, [qIdx, phase])

  const setCurrentAnswer = (val) => {
    setAnswers(prev => {
      const next = [...prev]
      next[qIdx] = val
      return next
    })
  }

  const goNext = useCallback(() => {
    if (qIdx < TOTAL_QS - 1) setQIdx(qIdx + 1)
    else finishTest()
  }, [qIdx])

  const goPrev = () => { if (qIdx > 0) setQIdx(qIdx - 1) }

  const finishTest = useCallback(() => {
    clearInterval(timerRef.current)
    setPhase('results')
  }, [])

  // Build results array when done
  useEffect(() => {
    if (phase !== 'results' || !questions.length) return
    const res = questions.map((q, i) => {
      const raw = answers[i] || ''
      const verdict = checkAnswer(raw, q.a)
      return {
        q: q.q,
        topicId: q.topicId,
        topicName: q.topicName,
        yours: raw,
        correct: String(q.a),
        attempted: verdict !== null,  // null = not attempted
        ok: verdict === true,
      }
    })
    setResults(res)

    // Update ratings per topic
    if (userData) {
      const topicGroups = {}
      res.forEach(r => {
        if (!topicGroups[r.topicId]) topicGroups[r.topicId] = { correct: 0, total: 0 }
        topicGroups[r.topicId].total++
        if (r.ok) topicGroups[r.topicId].correct++
      })

      let updatedRatings    = { ...userData.ratings }
      let updatedCounts     = { ...userData.sessionCounts }
      const { score } = calcUILScore(res)
      if ((userData.bestFullTestScore ?? -9999) < score) {
        // save best score
      }

      Object.entries(topicGroups).forEach(([id, perf]) => {
        const topic = TOPICS.find(t => t.id === id)
        if (!topic) return
        const acc  = perf.correct / perf.total
        const sessionCount = updatedCounts[id] || 0
        const { newRating } = calcNewRating(topic, updatedRatings[id] || 1000, acc, topic.target * 1.2, sessionCount)
        updatedRatings[id] = newRating
        updatedCounts[id]  = sessionCount + 1
      })

      const newScore = Math.max(userData.bestFullTestScore ?? -9999, score)
      setUserData(prev => ({
        ...prev,
        ratings: updatedRatings,
        sessionCounts: updatedCounts,
        totalSessions: (prev.totalSessions || 0) + 1,
        bestFullTestScore: newScore,
      }))

      saveFullTestResult(user.uid, score, { ...userData, ratings: updatedRatings, bestFullTestScore: newScore })
        .catch(console.error)
    }
  }, [phase])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const timerDanger = timeLeft <= 60

  if (phase === 'setup') return <SetupScreen difficulty={difficulty} setDiff={setDiff} onStart={startTest} />
  if (phase === 'results') return <ResultsScreen results={results} onRetry={startTest} onBack={() => navigate('/')} />

  const q = questions[qIdx]

  return (
    <div className={styles.testPage}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.tbLeft}>
          <span className={styles.qLabel}>Q {qIdx+1} / {TOTAL_QS}</span>
          <div className={styles.progBar}>
            <div className={styles.progFill} style={{width:`${(qIdx/TOTAL_QS)*100}%`}} />
          </div>
        </div>
        <div className={styles.timerBig} style={{color: timerDanger ? 'var(--red)' : 'var(--cyan)'}}>
          {mins}:{secs}
        </div>
        <div className={styles.tbRight}>
          <button className={styles.finishBtn} onClick={finishTest}>FINISH EARLY</button>
        </div>
      </div>

      {/* Question area */}
      <div className={styles.qArea}>
        <div className={styles.qMeta}>{q?.topicName?.toUpperCase()}</div>
        <div className={styles.qText}>{q?.q}</div>
        <input
          ref={inputRef}
          className={styles.ansInput}
          type="text"
          value={answers[qIdx]}
          onChange={e => setCurrentAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && goNext()}
          placeholder="—"
          autoComplete="off"
          inputMode="decimal"
        />
        <div className={styles.navRow}>
          <button className={styles.navBtn} onClick={goPrev} disabled={qIdx === 0}>◀ PREV</button>
          <button className={styles.navBtn} onClick={() => { setCurrentAnswer(''); goNext(); }}>SKIP ⟶</button>
          <button className={styles.navBtnPrimary} onClick={goNext}>
            {qIdx === TOTAL_QS - 1 ? 'FINISH ▶' : 'NEXT ▶'}
          </button>
        </div>
        <div className={styles.scoringNote}>
          +5 correct · −9 wrong · 0 skipped · deductions stop at last answered
        </div>
      </div>

      {/* Answer grid */}
      <div className={styles.answerGrid}>
        {answers.map((a, i) => (
          <div
            key={i}
            className={`${styles.ansCell} ${i === qIdx ? styles.ansCellActive : ''} ${a ? styles.ansCellFilled : ''}`}
            onClick={() => setQIdx(i)}
          >
            <span className={styles.ansCellNum}>{i+1}</span>
            {a && <span className={styles.ansCellVal}>{a.slice(0,6)}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function SetupScreen({ difficulty, setDiff, onStart }) {
  return (
    <div className={styles.setupPage}>
      <div className={styles.setupBox}>
        <div className={styles.setupTitle}>10-MINUTE FULL TEST</div>
        <div className={styles.setupSub}>// SIMULATE THE ACTUAL UIL NUMBER SENSE EXAM</div>

        <div className={styles.scoringCard}>
          <div className={styles.scTitle}>UIL OFFICIAL SCORING</div>
          <div className={styles.scRow}><span className={styles.scPlus}>+5</span><span>per correct answer</span></div>
          <div className={styles.scRow}><span className={styles.scMinus}>−9</span><span>per wrong answer (answered but incorrect)</span></div>
          <div className={styles.scRow}><span className={styles.scZero}>0</span><span>per skipped question</span></div>
          <div className={styles.scNote}>
            ⚠ Deductions only apply through the last question you answered.
            Questions after your last attempt are ignored entirely.
          </div>
          <div className={styles.scExample}>
            Example: 40 attempted, 10 wrong → (40×5) − (10×9) = 200 − 90 = <strong>110</strong>
          </div>
        </div>

        <div className={styles.diffLabel}>SELECT DIFFICULTY</div>
        <div className={styles.diffRow}>
          {[
            { k:'middle', label:'MIDDLE SCHOOL', desc:'Basic arithmetic · No calculus' },
            { k:'high',   label:'HIGH SCHOOL',   desc:'All topics · Calculus included' },
          ].map(d => (
            <div
              key={d.k}
              className={`${styles.diffOpt} ${difficulty===d.k ? styles.diffSelected : ''}`}
              onClick={() => setDiff(d.k)}
            >
              {difficulty===d.k && <span className={styles.diffCheck}>✓</span>}
              <div className={styles.diffOptTitle}>{d.label}</div>
              <div className={styles.diffOptDesc}>{d.desc}</div>
            </div>
          ))}
        </div>

        <button className={styles.startBtn} onClick={onStart}>BEGIN TEST ▶</button>
      </div>
    </div>
  )
}

function ResultsScreen({ results, onRetry, onBack }) {
  const { score, correct, wrong, skipped } = calcUILScore(results)
  const attempted = results.filter(r => r.attempted).length

  return (
    <div className={styles.resultsPage}>
      <div className={styles.resBox}>
        <div className={styles.resTitle}>TEST COMPLETE</div>
        <div className={styles.resScoreBig} style={{color: score >= 200 ? 'var(--green)' : score >= 100 ? 'var(--gold)' : score >= 0 ? 'var(--cyan)' : 'var(--red)'}}>
          {score}
        </div>
        <div className={styles.resScoreFormula}>
          {attempted}×5 − {wrong}×9 = {correct*5} − {wrong*9} = {score}
        </div>

        <div className={styles.resStats}>
          <ResStat label="CORRECT"   value={correct}  color="var(--green)" />
          <ResStat label="WRONG"     value={wrong}    color="var(--red)" />
          <ResStat label="SKIPPED"   value={skipped}  color="var(--text2)" />
          <ResStat label="ATTEMPTED" value={attempted} color="var(--cyan)" />
        </div>

        <div className={styles.breakdown}>
          <div className={styles.bkHead}>
            <span>#</span><span style={{flex:1}}>QUESTION</span>
            <span style={{width:80,textAlign:'center'}}>YOUR ANS</span>
            <span style={{width:80,textAlign:'center'}}>CORRECT</span>
          </div>
          <div className={styles.bkBody}>
            {results.map((r, i) => (
              <div className={`${styles.bkRow} ${r.ok ? styles.bkOk : r.attempted ? styles.bkBad : ''}`} key={i}>
                <span className={styles.bkNum}>{i+1}</span>
                <span className={styles.bkQ}>{r.q.slice(0,48)}</span>
                <span className={styles.bkYours} style={{color: r.ok ? 'var(--green)' : r.attempted ? 'var(--red)' : 'var(--text3)'}}>
                  {r.yours || '—'}
                </span>
                <span className={styles.bkCorrect}>{r.correct}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.resBtns}>
          <button className="btn btn-primary"   onClick={onRetry}>RETRY TEST</button>
          <button className="btn btn-secondary" onClick={onBack}>BACK TO HUB</button>
        </div>
      </div>
    </div>
  )
}

function ResStat({ label, value, color }) {
  return (
    <div style={{background:'var(--panel2)',border:'1px solid var(--border)',padding:'14px',textAlign:'center'}}>
      <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'8px',letterSpacing:'3px',color:'var(--text2)',marginBottom:4}}>{label}</div>
      <div style={{fontFamily:'Orbitron,sans-serif',fontSize:'22px',fontWeight:700,color}}>{value}</div>
    </div>
  )
}
