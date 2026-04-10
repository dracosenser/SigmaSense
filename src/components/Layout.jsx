// src/components/Layout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { ADMIN_UIDS } from '../lib/firebase'
import { ratingColor } from '../data/topics'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, userData, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const overallRating = userData?.ratings
    ? Math.round(Object.values(userData.ratings).reduce((a,b)=>a+b,0) / Object.values(userData.ratings).length)
    : 1000

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const initial = (userData?.displayName || user?.email || 'G').charAt(0).toUpperCase()

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logoRow} onClick={() => navigate('/')} style={{cursor:'pointer'}}>
          <div className={styles.logoHex}>Σ</div>
          <div>
            <div className={styles.logoText}>SIGMASENSE</div>
            <div className={styles.logoSub}>UIL NUMBER SENSE</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/"          end className={({isActive})=>isActive?styles.navActive:styles.navItem}>HUB</NavLink>
          <NavLink to="/learn"         className={({isActive})=>isActive?styles.navActive:styles.navItem}>LEARN</NavLink>
          <NavLink to="/leaderboard"   className={({isActive})=>isActive?styles.navActive:styles.navItem}>RANKS</NavLink>
          <NavLink to="/fulltest"      className={({isActive})=>isActive?styles.navActive:styles.navItem}>FULL TEST</NavLink>
          <NavLink to="/pvp"           className={({isActive})=>isActive?styles.navActive:styles.navItem}>⚔ PVP</NavLink>
          {isAdmin && <NavLink to="/admin" className={({isActive})=>isActive?styles.navActive:styles.navItem}>ADMIN</NavLink>}
        </nav>

        <div className={styles.userRow}>
          <div className={styles.ratingBadge} style={{color: ratingColor(overallRating)}}>
            {overallRating}
          </div>
          <div className={styles.userChip}>
            <div className={styles.avatar}
              style={{background:`linear-gradient(135deg, #00f0ff, #9d4edd)`}}>
              {userData?.photoURL
                ? <img src={userData.photoURL} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} />
                : initial}
            </div>
            <span className={styles.userName}>{userData?.displayName || 'Trainee'}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>↩ OUT</button>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
