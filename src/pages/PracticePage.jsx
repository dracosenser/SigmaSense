// src/pages/PracticePage.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { TOPICS, calcNewRating, ratingColor } from '../data/topics'
import { saveTopicResult } from '../lib/db'
import styles from './PracticePage.module.css'

const QS = 10
const MAX_MS = 35000

function checkAnswer(yours, correct) {
  const y = String(yours).trim().replace(/\s/g, '').toLowerCase()
  const c = String(correct).trim().replace(/\s/g, '').toLowerCase()
  if (y === c) return true
  if (!isNaN(y) && !isNaN(c) && Math.abs(parseFloat(y) - parseFloat(c)) < 0.0011) return true
  // fraction equivalents e.g. "3/9" vs "1/3"
  if (y.includes('/') && c.includes('/')) {
    const [yn, yd] = y.split('/').map(Number)
    const [cn, cd] = c.split('/').map(Number)
    if (yn * cd === cn * yd) return true
  }
  return false
}

export default function PracticePage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { userData, setUserData, user } = useAuth()
  const topic = TOPICS.find(t => t.id === topicId)

  const [phase, setPhase]     = useState('practice') // 'practice' | 'results'
  const [questions]           = useState(() => Array.from({length: QS}, () => topic?.gen()))
  const [qIdx, setQIdx]       = useState(0)
  const [answer, setAnswer]   = useState('')
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'wrong'
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [history, setHistory] = useState([])
  const [correct, setCorrect] = useState(0)
  const [times, setTimes]     = useState([])

  const startRef   = useRef(performance.now())
  const timerRef   = useRef(null)
  const inputRef   = useRef(null)
  const waitRef    = useRef(false)

  // Timer
  useEffect(() => {
    startRef.current = performance.now()
    timerRef.current = setInterval(() => {
      const e = performance.now() - startRef.current
      setElapsed(e)
      if (e >= MAX_MS && !waitRef.current) autoSkip()
    }, 50)
    return () => clearInterval(timerRef.current)
  }, [qIdx])

  useEffect(() => {
    inputRef.current?.focus()
    setAnswer('')
    setFeedback(null)
    setCorrectAnswer('')
    setShowHint(false)
    setWaiting(false)
    waitRef.current = false
  }, [qIdx])

  const autoSkip = useCallback(() => {
    clearInterval(timerRef.current)
    const t = performance.now() - startRef.current
    const q = questions[qIdx]
    waitRef.current = true
    setWaiting(true)
    setFeedback('wrong')
    setCorrectAnswer(String(q.a))
    setTimes(prev => [...prev, t])
    setHistory(prev => [...prev, { q: q.q, yours: '(timeout)', correct: String(q.a), ok: false, ms: Math.round(t) }])
    setTimeout(advance, 1600)
  }, [qIdx, questions])

  const submit = useCallback(() => {
    if (waitRef.current) { advance(); return }
    clearInterval(timerRef.current)
    const t = performance.now() - startRef.current
    const q = questions[qIdx]
    const ok = checkAnswer(answer, q.a)
    waitRef.current = true
    setWaiting(true)
    setFeedback(ok ? 'correct' : 'wrong')
    setCorrectAnswer(String(q.a))
    setTimes(prev => [...prev, t])
    if (ok) setCorrect(prev => prev + 1)
    setHistory(prev => [...prev, { q: q.q, yours: answer || '—', correct: String(q.a), ok, ms: Math.round(t) }])
    setTimeout(advance, 1400)
  }, [answer, qIdx, questions])

  const skip = useCallback(() => {
    if (waitRef.current) return
    clearInterval(timerRef.current)
    const t = performance.now() - startRef.current
    const q = questions[qIdx]
    waitRef.current = true
    setWaiting(true)
    setFeedback('wrong')
    setCorrectAnswer(String(q.a))
    setTimes(prev => [...prev, t + 5000])
    setHistory(prev => [...prev, { q: q.q, yours: '(skip)', correct: String(q.a), ok: false, ms: Math.round(t) }])
    setTimeout(advance, 1400)
  }, [qIdx, questions])

  const advance = useCallback(() => {
    setQIdx(prev => {
      const next = prev + 1
      if (next >= QS) {
        setPhase('results')
      }
      return next
    })
  }, [])

  // Save results when done
  useEffect(() => {
    if (phase !== 'results' || !userData) return
    const acc = correct / QS
    const avgMs = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : topic.target
    const sessionCount = userData.sessionCounts?.[topicId] || 0
    const oldRating = userData.ratings?.[topicId] || 1000
    const { newRating, delta, K } = calcNewRating(topic, oldRating, acc, avgMs, sessionCount)

    // Optimistic local update
    const updatedRatings = { ...userData.ratings, [topicId]: newRating }
    const updatedCounts  = { ...userData.sessionCounts, [topicId]: sessionCount + 1 }
    setUserData(prev => ({
      ...prev,
      ratings: updatedRatings,
      sessionCounts: updatedCounts,
      totalSessions: (prev.totalSessions || 0) + 1,
    }))

    // Persist to Firestore
    saveTopicResult(user.uid, topicId, newRating, avgMs, {
      ...userData, ratings: updatedRatings, sessionCounts: updatedCounts
    }).catch(console.error)

    setResultData({ acc, avgMs, newRating, delta, K, oldRating })
  }, [phase])

  const [resultData, setResultData] = useState(null)

  if (!topic) return <div style={{color:'var(--red)',padding:40}}>Topic not found.</div>

  const progress = qIdx / QS
  const frac = Math.min(1, elapsed / MAX_TIME)
  const circ = 251
  const strokeOff = circ * frac
  const timerColor = frac < 0.5 ? '#00f0ff' : frac < 0.75 ? '#ffd700' : '#ff3366'
  const accPct = times.length ? Math.round(correct / times.length * 100) : null
  const avgMs  = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : null
  const liveRating = times.length && userData
    ? calcNewRating(topic, userData.ratings?.[topicId]||1000, correct/times.length, avgMs, userData.sessionCounts?.[topicId]||0).newRating
    : null

  if (phase === 'results' && resultData) {
    return <ResultsScreen
      topic={topic}
      history={history}
      correct={correct}
      total={QS}
      resultData={resultData}
      onRetry={() => navigate(0)}
      onBack={() => navigate('/')}
    />
  }

  const q = questions[qIdx]

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>◀ BACK</button>
        <div className={styles.pTitleBlock}>
          <div className={styles.pTopic}>{topic.name}</div>
          <div className={styles.pSub}>Q {qIdx+1}/{QS} · {topic.cl}</div>
        </div>
        <div className={styles.pStats}>
          <Stat label="ACCURACY" value={accPct !== null ? `${accPct}%` : '—'} color="var(--gold)" />
          <Stat label="AVG MS"   value={avgMs  !== null ? `${avgMs}` : '—'}  color="var(--cyan)" />
          <Stat label="RATING"   value={liveRating ?? (userData?.ratings?.[topicId] || 1000)} color={ratingColor(liveRating ?? 1000)} />
        </div>
      </div>

      {/* Main area */}
      <div className={styles.main}>
        <div className={styles.corner} style={{top:16,left:16,borderTop:'2px solid rgba(0,240,255,0.3)',borderLeft:'2px solid rgba(0,240,255,0.3)'}} />
        <div className={styles.corner} style={{top:16,right:16,borderTop:'2px solid rgba(0,240,255,0.3)',borderRight:'2px solid rgba(0,240,255,0.3)'}} />
        <div className={styles.corner} style={{bottom:16,left:16,borderBottom:'2px solid rgba(0,240,255,0.3)',borderLeft:'2px solid rgba(0,240,255,0.3)'}} />
        <div className={styles.corner} style={{bottom:16,right:16,borderBottom:'2px solid rgba(0,240,255,0.3)',borderRight:'2px solid rgba(0,240,255,0.3)'}} />

        {/* Timer ring */}
        <div className={styles.timerWrap}>
          <svg width="88" height="88" viewBox="0 0 88 88" style={{transform:'rotate(-90deg)'}}>
            <circle cx="44" cy="44" r="40" fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle cx="44" cy="44" r="40" fill="none"
              stroke={timerColor} strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={strokeOff}
              style={{transition:'stroke-dashoffset 0.08s linear, stroke 0.3s'}} />
          </svg>
          <div className={styles.timerInside}>
            <span style={{fontFamily:'Orbitron,sans-serif',fontSize:19,fontWeight:700,color:timerColor}}>
              {(elapsed/1000).toFixed(1)}
            </span>
            <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--text2)',marginTop:1}}>
              {Math.round(elapsed)}ms
            </span>
          </div>
        </div>

        <div className={styles.qNum}>QUESTION {qIdx+1} / {QS}</div>
        <div className={styles.qText}>{q?.q}</div>

        <div className={styles.ansArea}>
          {showHint && <div className={styles.hintBox}>{topic.hint}</div>}

          <div className={styles.hintRow}>
            <button className={styles.hintBtn} onClick={() => setShowHint(v => !v)}>
              💡 {showHint ? 'HIDE' : 'HINT'}
            </button>
            <button className={styles.skipBtn} onClick={skip} disabled={waiting}>
              SKIP ⟶
            </button>
          </div>

          <input
            ref={inputRef}
            className={`${styles.ansInput} ${feedback === 'correct' ? styles.inputOk : feedback === 'wrong' ? styles.inputBad : ''}`}
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="ANSWER"
            disabled={waiting}
            autoComplete="off"
            inputMode="decimal"
          />

          <button className={styles.submitBtn} onClick={submit} disabled={waiting}>
            SUBMIT ANSWER ▶
          </button>

          <div className={`${styles.feedback} ${feedback === 'correct' ? styles.fbOk : feedback === 'wrong' ? styles.fbBad : ''}`}>
            {feedback === 'correct' && `✓ CORRECT · +${Math.round(10000/elapsed*40)}pts`}
            {feedback === 'wrong'   && `✗ Answer: ${correctAnswer}`}
          </div>
        </div>

        {/* Progress */}
        <div className={styles.progWrap}>
          <div className={styles.progLabels}>
            <span>PROGRESS</span>
            <span>{Math.round(progress*100)}%</span>
          </div>
          <div className={styles.progTrack}>
            <div className={styles.progFill} style={{width:`${progress*100}%`}} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{background:'var(--panel)',border:'1px solid var(--border)',padding:'5px 12px',textAlign:'center'}}>
      <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'8px',letterSpacing:'2px',color:'var(--text2)'}}>{label}</div>
      <div style={{fontFamily:'Orbitron,sans-serif',fontSize:'15px',fontWeight:700,color}}>{value}</div>
    </div>
  )
}

function ResultsScreen({ topic, history, correct, total, resultData, onRetry, onBack }) {
  const { acc, avgMs, newRating, delta, K, oldRating } = resultData
  const sign = delta >= 0 ? '+' : ''
  return (
    <div className={styles.resultsPage}>
      <div className={styles.resPanel}>
        <div className={styles.resLabel}>SESSION COMPLETE</div>
        <div className={styles.resTopic}>{topic.name}</div>
        <div className={styles.resRating} style={{color: ratingColor(newRating)}}>{newRating}</div>
        <div className={styles.resDelta}>
          <span style={{color: delta >= 0 ? 'var(--green)' : 'var(--red)'}}>{sign}{delta} rating pts</span>
          <span style={{color:'var(--text3)',marginLeft:12}}>K={K} · Target {(topic.target/1000).toFixed(1)}s</span>
        </div>

        <div className={styles.resGrid}>
          <ResStatBox label="CORRECT"  value={`${correct}/${total}`}               color="var(--green)" />
          <ResStatBox label="ACCURACY" value={`${Math.round(acc*100)}%`}           color="var(--gold)" />
          <ResStatBox label="AVG TIME" value={`${avgMs}ms`}                        color="var(--cyan)" />
        </div>

        <div className={styles.qHist}>
          {history.map((h, i) => (
            <div className={styles.qHistRow} key={i}>
              <div className={styles.qHistDot} style={{background: h.ok ? 'var(--green)' : 'var(--red)'}} />
              <div className={styles.qHistQ}>{h.q.slice(0,42)}</div>
              <div className={styles.qHistAns} style={{color: h.ok ? 'var(--green)' : 'var(--red)'}}>
                {h.ok ? `✓ ${h.yours}` : `✗ ${h.correct}`}
              </div>
              <div className={styles.qHistMs}>{h.ms}ms</div>
            </div>
          ))}
        </div>

        <div className={styles.resBtns}>
          <button className="btn btn-primary" onClick={onRetry}>RETRY TOPIC</button>
          <button className="btn btn-secondary" onClick={onBack}>BACK TO HUB</button>
        </div>
      </div>
    </div>
  )
}

function ResStatBox({ label, value, color }) {
  return (
    <div style={{background:'var(--panel2)',border:'1px solid var(--border)',padding:'14px',textAlign:'center'}}>
      <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'8px',letterSpacing:'3px',color:'var(--text2)',marginBottom:5}}>{label}</div>
      <div style={{fontFamily:'Orbitron,sans-serif',fontSize:'22px',fontWeight:700,color}}>{value}</div>
    </div>
  )
}
