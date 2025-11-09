import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAQuN-QCokg7HyX5RGaw83TgmFs7ptzN1E",
  authDomain: "mockme-63e50.firebaseapp.com",
  projectId: "mockme-63e50",
  storageBucket: "mockme-63e50.firebasestorage.app",
  messagingSenderId: "490132899709",
  appId: "1:490132899709:web:059c260346647d12462e14",
  measurementId: "G-YVQ5PD7055"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };