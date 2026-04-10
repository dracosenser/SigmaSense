# SigmaSense — Full Stack Setup Guide

## Tech Stack
- **Frontend:** React + Vite
- **Auth:** Firebase Auth (Email/Password + Google + GitHub)
- **Database:** Firestore (real-time, cross-device)
- **Hosting:** Firebase Hosting
- **PvP:** Firestore real-time listeners

---

## Step 1: Install dependencies
```bash
cd sigmasense
npm install
```

## Step 2: Create Firebase project
1. Go to https://console.firebase.google.com
2. **Add project** → name it `sigmasense` → Continue → Create project
3. Click the **</>** (Web) icon → name it `sigmasense-web` → Register app
4. Copy the `firebaseConfig` object

## Step 3: Configure Firebase
Open `src/lib/firebase.js` and replace:
```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",          // ← paste your values
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

## Step 4: Enable Authentication
In Firebase Console → Build → **Authentication** → Get Started:
- Enable **Email/Password**
- Enable **Google** (pick your support email)
- Enable **GitHub** (requires a GitHub OAuth app — see below)

### GitHub OAuth (optional):
1. Go to github.com/settings/developers → New OAuth App
2. Homepage URL: `https://YOUR_PROJECT.firebaseapp.com`
3. Callback URL: `https://YOUR_PROJECT.firebaseapp.com/__/auth/handler`
4. Copy Client ID & Secret into Firebase GitHub provider settings

## Step 5: Create Firestore Database
Build → **Firestore Database** → Create database → Start in **production mode** → choose region → Enable

### Paste these Firestore Security Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own data
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    // Leaderboard — anyone logged in can read, only owner can write their entry
    match /leaderboard/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    // PvP matches — any logged-in user can create/read/update
    match /pvp_matches/{matchId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 6: Set yourself as Admin
1. Run the app: `npm run dev`
2. Sign up with your account
3. Open browser DevTools → Application → IndexedDB → find your UID
4. Open `src/lib/firebase.js` and add your UID:
```js
export const ADMIN_UIDS = [
  "YOUR_UID_HERE"
]
```

## Step 7: Create Firestore Indexes
In Firebase Console → Firestore → **Indexes** tab → Add these composite indexes:

| Collection | Fields | Order |
|---|---|---|
| `leaderboard` | `overallRating` DESC | |
| `leaderboard` | `bestFullTestScore` DESC | |
| `leaderboard` | `categoryRatings.mult` DESC | |
| `leaderboard` | `categoryRatings.div` DESC | |
| `leaderboard` | `categoryRatings.mem` DESC | |
| `leaderboard` | `categoryRatings.alg` DESC | |
| `leaderboard` | `categoryRatings.calc` DESC | |
| `leaderboard` | `categoryRatings.fib` DESC | |
| `leaderboard` | `categoryRatings.base` DESC | |
| `leaderboard` | `categoryRatings.misc` DESC | |
| `pvp_matches` | `status` ASC, `createdAt` DESC | |

> **Note:** When you first run a query that needs an index, Firebase will show a link in the browser console to auto-create it. Click those links as you use each leaderboard tab.

## Step 8: Run locally
```bash
npm run dev
# Opens at http://localhost:5173
```

## Step 9: Deploy to Firebase Hosting (free)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# → select "dist" as public directory
# → configure as single-page app: YES
# → don't overwrite index.html: NO
npm run build
firebase deploy
```
Your app will be live at `https://YOUR_PROJECT.web.app`

---

## UIL Scoring
- **+5** per correct answer
- **−9** per wrong answer (answered but incorrect)
- **0** per skipped question
- Deductions **stop** at the last question you attempted (answered right or wrong)
- Questions after your last attempt = no penalty

*Example: 40 attempted, 10 wrong → 40×5 − 10×9 = 200 − 90 = **110***

## Rating System (Chess K-factor)
- Each topic has its own **target time** (easy topics ~2.5s, hard ~10s)
- Each topic has its own **base K factor** (easy topics K≈120, hard K≈270)
- **K decreases as you play more** (like chess): after 30 sessions, K = 40% of base
- Formula: `score = accuracy×0.62 + speed_score×0.38`
- `delta = (score − 0.5) × K`
- Rating clamped to [500, 2500]
