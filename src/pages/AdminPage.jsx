// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllUsers } from '../lib/db'
import { TOPICS, ratingColor } from '../data/topics'
import { useAuth } from '../lib/AuthContext'
import styles from './AdminPage.module.css'

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [expanded, setExpanded] = useState(null)
  const [sortBy, setSortBy] = useState('sessions')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const all = await getAllUsers()
      setUsers(all)
    } catch(e) {
      console.error('Admin load error:', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = users
    .filter(u =>
      !search ||
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.uid?.includes(search)
    )
    .sort((a, b) => {
      if (sortBy === 'sessions') return (b.totalSessions||0) - (a.totalSessions||0)
      if (sortBy === 'rating') {
        const ra = a.ratings ? Math.round(Object.values(a.ratings).reduce((x,y)=>x+y,0)/Object.values(a.ratings).length) : 1000
        const rb = b.ratings ? Math.round(Object.values(b.ratings).reduce((x,y)=>x+y,0)/Object.values(b.ratings).length) : 1000
        return rb - ra
      }
      if (sortBy === 'joined') return (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0)
      return 0
    })

  const totalUsers    = users.length
  const totalSessions = users.reduce((a,u) => a+(u.totalSessions||0), 0)
  const avgRating     = users.length
    ? Math.round(users.map(u => u.ratings
        ? Math.round(Object.values(u.ratings).reduce((x,y)=>x+y,0)/Object.values(u.ratings).length)
        : 1000
      ).reduce((a,b)=>a+b,0) / users.length)
    : 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>◀ BACK TO HUB</button>
        <div className={styles.title}>⚙ ADMIN DASHBOARD</div>
        <div className={styles.uid}>UID: {user?.uid?.slice(0,12)}…</div>
      </div>

      {/* Overview */}
      <div className={styles.overview}>
        {[
          { label: 'TOTAL USERS',    value: totalUsers,    color: 'var(--cyan)' },
          { label: 'TOTAL SESSIONS', value: totalSessions, color: 'var(--green)' },
          { label: 'AVG RATING',     value: avgRating,     color: ratingColor(avgRating) },
        ].map(s => (
          <div className={styles.overviewCard} key={s.label}>
            <div className={styles.overviewVal} style={{color:s.color}}>{s.value}</div>
            <div className={styles.overviewLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search by name, email, or UID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.sortRow}>
          {['sessions','rating','joined'].map(s => (
            <button
              key={s}
              className={`${styles.sortBtn} ${sortBy===s ? styles.sortActive : ''}`}
              onClick={() => setSortBy(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
          <button className={styles.refreshBtn} onClick={load}>↺ REFRESH</button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>LOADING USERS...</div>
      ) : (
        <div className={styles.userList}>
          {filtered.map(u => {
            const overall = u.ratings
              ? Math.round(Object.values(u.ratings).reduce((x,y)=>x+y,0)/Object.values(u.ratings).length)
              : 1000
            const isExpanded = expanded === u.uid
            const joined = u.createdAt?.seconds
              ? new Date(u.createdAt.seconds * 1000).toLocaleDateString()
              : '—'
            const lastSeen = u.lastSeen?.seconds
              ? new Date(u.lastSeen.seconds * 1000).toLocaleString()
              : '—'

            return (
              <div className={styles.userCard} key={u.uid}>
                <div className={styles.userRow} onClick={() => setExpanded(isExpanded ? null : u.uid)}>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{u.displayName || 'Unknown'}</div>
                    <div className={styles.userEmail}>{u.email}</div>
                    <div className={styles.userUid}>{u.uid}</div>
                  </div>
                  <div className={styles.userStats}>
                    <Stat label="RATING"   value={overall}             color={ratingColor(overall)} />
                    <Stat label="SESSIONS" value={u.totalSessions||0}  color="var(--cyan)" />
                    <Stat label="BEST TEST" value={u.bestFullTestScore ?? '—'} color="var(--gold)" />
                    <Stat label="JOINED"   value={joined}               color="var(--text2)" />
                    <Stat label="LAST SEEN" value={lastSeen.slice(0,10)} color="var(--text2)" />
                  </div>
                  <div className={styles.expandArrow}>{isExpanded ? '▲' : '▼'}</div>
                </div>

                {isExpanded && u.ratings && (
                  <div className={styles.expanded}>
                    <div className={styles.expandTitle}>TOPIC RATINGS</div>
                    <div className={styles.topicGrid}>
                      {TOPICS.map(t => {
                        const rt = u.ratings[t.id] || 1000
                        const sessions = u.sessionCounts?.[t.id] || 0
                        return (
                          <div className={styles.topicRow} key={t.id}>
                            <span className={styles.topicName}>{t.name}</span>
                            <div className={styles.topicBar}>
                              <div className={styles.topicFill}
                                style={{width:`${((rt-500)/2000*100)}%`, background: ratingColor(rt)+'66'}} />
                            </div>
                            <span className={styles.topicVal} style={{color:ratingColor(rt)}}>{rt}</span>
                            <span className={styles.topicSess}>{sessions}×</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className={styles.miniStat}>
      <div className={styles.miniLabel}>{label}</div>
      <div className={styles.miniVal} style={{color}}>{value}</div>
    </div>
  )
}
