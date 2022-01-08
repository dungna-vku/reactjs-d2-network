import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyClJCr_QB9ZDir5fLDiBum42qVGZhnUgmo",
  authDomain: "d2-network.app.com",
  projectId: "d2-network",
  storageBucket: "d2-network.appspot.com",
  messagingSenderId: "439403588318",
  appId: "1:439403588318:web:0f0617f5375adeed3e304f",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

export { auth, db, storage };
