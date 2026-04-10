// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import AuthPage    from './pages/AuthPage'
import HubPage     from './pages/HubPage'
import PracticePage from './pages/PracticePage'
import LearnPage   from './pages/LearnPage'
import LeaderboardPage from './pages/LeaderboardPage'
import FullTestPage from './pages/FullTestPage'
import AdminPage   from './pages/AdminPage'
import PvpPage     from './pages/PvpPage'
import Layout      from './components/Layout'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/auth" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function Loader() {
  return (
    <div style={{
      display:'flex',alignItems:'center',justifyContent:'center',
      minHeight:'100vh',background:'#050a14',
      fontFamily:'Orbitron,sans-serif',fontSize:'12px',letterSpacing:'4px',color:'#00f0ff'
    }}>
      INITIALIZING...
    </div>
  )
}

export default function App() {
  return (
    <>
      <div className="grid-bg" />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<HubPage />} />
          <Route path="practice/:topicId" element={<PracticePage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="fulltest" element={<FullTestPage />} />
          <Route path="pvp" element={<PvpPage />} />
        </Route>
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
