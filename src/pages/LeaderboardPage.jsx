// src/pages/LeaderboardPage.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getLeaderboard, getCategoryLeaderboard } from '../lib/db'
import { CAT_COLORS, CAT_LABELS, ratingColor } from '../data/topics'
import styles from './LeaderboardPage.module.css'

const TABS = [
  { key: 'overall',    label: 'OVERALL' },
  { key: 'fulltest',   label: 'FULL TEST' },
  { key: 'mult',       label: 'MULTIPLY' },
  { key: 'div',        label: 'DIVISION' },
  { key: 'mem',        label: 'MEMORY' },
  { key: 'alg',        label: 'ALGEBRA' },
  { key: 'calc',       label: 'CALCULUS' },
  { key: 'fib',        label: 'FIBONACCI' },
  { key: 'base',       label: 'BASES' },
  { key: 'misc',       label: 'MISC' },
]

const AVATAR_COLORS = ['#00f0ff','#00ff88','#ffd700','#ff3366','#9d4edd','#ff9f43','#54a0ff','#ff6b9d']

function avatarColor(name) {
  return AVATAR_COLORS[(name || '?').charCodeAt(0) % AVATAR_COLORS.length]
}

export default function LeaderboardPage() {
  const { user, userData } = useAuth()
  const [tab, setTab]     = useState('overall')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    load(tab)
  }, [tab])

  async function load(t) {
    setLoading(true); setError('')
    try {
      let data
      if (t === 'overall') {
        data = await getLeaderboard('overallRating', 50)
      } else if (t === 'fulltest') {
        data = await getLeaderboard('bestFullTestScore', 50)
        data = data.filter(d => d.bestFullTestScore != null)
      } else {
        data = await getCategoryLeaderboard(t, 50)
      }
      setEntries(data)
    } catch(e) {
      setError('Failed to load leaderboard. Check your Firebase rules.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getValue = (entry, t) => {
    if (t === 'overall')  return entry.overallRating ?? '—'
    if (t === 'fulltest') return entry.bestFullTestScore ?? '—'
    return entry.categoryRatings?.[t] ?? '—'
  }

  const catColor = CAT_COLORS[tab] || 'var(--cyan)'

  return (
    <div className={styles.page}>
      <div className={styles.title}>// GLOBAL LEADERBOARD</div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            style={tab === t.key ? { borderBottomColor: CAT_COLORS[t.key] || 'var(--cyan)', color: CAT_COLORS[t.key] || 'var(--cyan)' } : {}}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>LOADING...</div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>
          No entries yet. Complete sessions to appear on the leaderboard!
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>#</th>
              <th className={styles.th}>PLAYER</th>
              <th className={styles.th} style={{color: catColor}}>
                {tab === 'overall' ? 'OVERALL RATING' : tab === 'fulltest' ? 'BEST SCORE' : CAT_LABELS[tab]?.toUpperCase() + ' RATING'}
              </th>
              <th className={styles.th}>SESSIONS</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const rank = i + 1
              const isYou = entry.uid === user?.uid
              const val = getValue(entry, tab)
              const rankDisplay = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank
              return (
                <tr key={entry.uid} className={`${styles.row} ${isYou ? styles.youRow : ''}`}>
                  <td className={styles.td}>
                    <span className={`${styles.rank} ${rank<=3 ? styles[`rank${rank}`] : ''}`}>
                      {rankDisplay}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}
                        style={{background: avatarColor(entry.displayName)}}>
                        {entry.photoURL
                          ? <img src={entry.photoURL} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} />
                          : (entry.displayName || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.playerName}>{entry.displayName || 'Anonymous'}</span>
                      {isYou && <span className={styles.youTag}>YOU</span>}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.ratingVal} style={{color: typeof val === 'number' ? ratingColor(val) : 'var(--text2)'}}>
                      {val}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.sessions}>{entry.totalSessions ?? 0}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
