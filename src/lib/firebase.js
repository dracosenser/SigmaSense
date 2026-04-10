import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAXC1Z0S30R1LvfXYAMs1FIuMsJH5yO5aI",
  authDomain: "sigmasense-7c852.firebaseapp.com",
  projectId: "sigmasense-7c852",
  storageBucket: "sigmasense-7c852.firebasestorage.app",
  messagingSenderId: "940811667695",
  appId: "1:940811667695:web:51668ef9d0708a403a731a"
}

export const ADMIN_UIDS = []

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()

googleProvider.setCustomParameters({ prompt: 'select_account' })