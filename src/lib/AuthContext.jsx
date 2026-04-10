// src/lib/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, googleProvider, githubProvider, ADMIN_UIDS } from './firebase'
import { getOrCreateUser } from './db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)        // Firebase user
  const [userData, setUserData] = useState(null) // Firestore user doc
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const data = await getOrCreateUser(firebaseUser)
          setUser(firebaseUser)
          setUserData(data)
          setIsAdmin(ADMIN_UIDS.includes(firebaseUser.uid) || data.role === 'admin')
        } catch (e) {
          console.error('Error loading user data:', e)
          setUser(firebaseUser)
          setUserData(null)
        }
      } else {
        setUser(null)
        setUserData(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const refreshUserData = async () => {
    if (!user) return
    const data = await getOrCreateUser(user)
    setUserData(data)
  }

  const loginEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const signupEmail = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    return cred
  }

  const loginGoogle = () => signInWithPopup(auth, googleProvider)
  const loginGithub = () => signInWithPopup(auth, githubProvider)

  const logout = () => signOut(auth)

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  return (
    <AuthContext.Provider value={{
      user, userData, setUserData, loading, isAdmin,
      loginEmail, signupEmail, loginGoogle, loginGithub,
      logout, resetPassword, refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
