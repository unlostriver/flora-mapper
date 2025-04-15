import {initializeApp} from "firebase/app"
import {getFirestore} from "firebase/firestore"
import {getAuth, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth"
import {useState, useEffect} from "react"

const app = initializeApp({
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
})

export const firebaseAuth = getAuth(app)
export const useFirebaseUser = f => {
    const [user, setUser] = useState(null)
    useEffect(() => {
        const unsub = onAuthStateChanged(firebaseAuth, (newUser) => {
            setUser(newUser)
            f?.(newUser)
        })
        return unsub
    }, [])
    return user
}
export const firebasePasswordSignIn = (email, password) => signInWithEmailAndPassword(firebaseAuth, email, password)

export const firestore = getFirestore(app)

