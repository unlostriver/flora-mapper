import {initializeApp} from "firebase/app"
import {collection, getFirestore} from "firebase/firestore"
import {getStorage, ref} from "firebase/storage"
import {initializeAuth, onAuthStateChanged, getReactNativePersistence, signInWithEmailAndPassword} from "firebase/auth"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"
import {useState, useEffect} from "react"

const firebaseApp = initializeApp({
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
})

export const firebaseAuth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})
export const useFirebaseUser = f => {
    const [user, setUser] = useState(firebaseAuth.currentUser)
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

export const firestore = getFirestore(firebaseApp)
export const firestoreCollection = path => collection(firestore, path)

export const firebaseStorage = getStorage()
export const firebaseStorageRef = path => ref(firebaseStorage, path)

