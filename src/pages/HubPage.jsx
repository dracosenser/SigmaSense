// src/pages/HubPage.jsx
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { TOPICS, RADAR_GROUPS, CAT_COLORS, ratingColor } from '../data/topics'
import RadarChart from '../components/RadarChart'
import styles from './HubPage.module.css'

export default function HubPage() {
  const { userData } = useAuth()
  const navigate = useNavigate()
  const ratings = userData?.ratings || {}
  const sessionCounts = userData?.sessionCounts || {}

  const overallRating = useMemo(() => {
    const vals = TOPICS.map(t => ratings[t.id] || 1000)
    return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)
  }, [ratings])

  const trained = TOPICS.filter(t => (sessionCounts[t.id]||0) > 0).length

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroLabel}>// TRAINING INTERFACE ACTIVE</div>
        <h1 className={styles.heroTitle}>
          <span className={styles.t1}>TRAIN FASTER.</span>
          <span className={styles.t2}>SCORE HIGHER.</span>
        </h1>
        <p className={styles.heroSub}>Adaptive drills for every UIL Number Sense topic. Rating 500–2500.</p>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        {[
          { label: 'OVERALL RATING', value: overallRating, color: ratingColor(overallRating) },
          { label: 'TOTAL SESSIONS',  value: userData?.totalSessions || 0, color: 'var(--cyan)' },
          { label: 'BEST TEST SCORE', value: userData?.bestFullTestScore ?? '—', color: 'var(--gold)' },
          { label: 'TOPICS TRAINED',  value: `${trained}/${TOPICS.length}`, color: 'var(--green)' },
        ].map(s => (
          <div className={styles.statCard} key={s.label}>
            <div className={styles.statVal} style={{color:s.color}}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Radar + legend */}
      <div className={styles.radarRow}>
        <div className={styles.radarWrap}>
          <div className={styles.panelLabel}>SKILL MATRIX</div>
          <RadarChart ratings={ratings} groups={RADAR_GROUPS} size={340} />
        </div>
        <div className={styles.radarLegend}>
          {RADAR_GROUPS.map(gr => {
            const cat = TOPICS.find(t=>t.id===gr.ids[0])?.cat||'misc'
            const color = CAT_COLORS[cat]
            const vals = gr.ids.map(id=>ratings[id]||1000)
            const avg = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)
            return (
              <div className={styles.legItem} key={gr.l} style={{'--acc':color}}>
                <div className={styles.legDot} style={{background:color,boxShadow:`0 0 6px ${color}`}} />
                <span className={styles.legName}>{gr.l}</span>
                <span className={styles.legVal} style={{color:ratingColor(avg)}}>{avg}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Topics */}
      <div className={styles.secHead}>
        <div className="sec-title">// TOPIC MODULES</div>
        <div className="sec-line" />
      </div>
      <div className={styles.topicsGrid}>
        {TOPICS.map((t, i) => {
          const rt = ratings[t.id] || 1000
          const pct = ((rt - 500) / 2000 * 100).toFixed(0)
          const color = CAT_COLORS[t.cat]
          const sessions = sessionCounts[t.id] || 0
          return (
            <div
              key={t.id}
              className={styles.topicCard}
              style={{'--acc': color}}
              onClick={() => navigate(`/practice/${t.id}`)}
            >
              <div className={styles.tcNum}>{String(i+1).padStart(2,'0')} // {t.cl.toUpperCase()}</div>
              <div className={styles.tcName}>{t.name}</div>
              <div className={styles.tcDiff}>
                <span className={styles[`diff${t.diff}`]}>{t.diff === 'EASY' ? '● EASY' : t.diff === 'MED' ? '◆ MED' : '▲ HARD'}</span>
                {sessions > 0 && <span className={styles.sessions}>{sessions} sessions</span>}
              </div>
              <div className={styles.tcBottom}>
                <div className={styles.tcBar}>
                  <div className={styles.tcFill} style={{width:`${pct}%`, background:`linear-gradient(90deg,${color},${color}55)`}} />
                </div>
                <div className={styles.tcVal} style={{color: ratingColor(rt)}}>{rt}</div>
                <div className={styles.tcPlay}>▶</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
