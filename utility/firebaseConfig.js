import { initializeApp } from "firebase/app";
import {initializeAuth, getReactNativePersistence} from "firebase/auth"
import {getFirestore} from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA4cSQ_rEgesQcp3wGsRbIIZ20IOPPCHts",
    authDomain: "bankify-c41b9.firebaseapp.com",
    projectId: "bankify-c41b9",
    storageBucket: "bankify-c41b9.firebasestorage.app",
    messagingSenderId: "515145498601",
    appId: "1:515145498601:web:b381e057000192258dd578"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//InitializeAuth persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
})

//Initialize Firestore
const db = getFirestore(app)

export {auth, db}
