// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBexi4VZh8bCzVyBRqSchovpKZN6tcrU5c",
  authDomain: "silvoamhospital-d5a5c.firebaseapp.com",
  projectId: "silvoamhospital-d5a5c",
  storageBucket: "silvoamhospital-d5a5c.appspot.com",
  messagingSenderId: "900264029286",
  appId: "1:900264029286:web:a6d503bbaac17cdcc8d1a7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getFirestore(app);
export const storage = getStorage(app);
// export const analytics = getAnalytics(app);