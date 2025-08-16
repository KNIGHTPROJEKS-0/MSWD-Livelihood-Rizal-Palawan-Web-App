import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyB7Gacxs6y2h3ukiSmlWf1xHIhzwmD680I",
  authDomain: "mswd-livelihood-web-app.firebaseapp.com",
  projectId: "mswd-livelihood-web-app",
  storageBucket: "mswd-livelihood-web-app.firebasestorage.app",
  messagingSenderId: "123619422952",
  appId: "1:123619422952:web:bdf1b7ccfe15a969998f5d"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app