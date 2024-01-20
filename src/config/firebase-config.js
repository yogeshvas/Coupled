import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC29iPrEN823V_quTYIq9u8Xik7Owz6njY",
  authDomain: "chitchat-b9b0e.firebaseapp.com",
  projectId: "chitchat-b9b0e",
  storageBucket: "chitchat-b9b0e.appspot.com",
  messagingSenderId: "137798275219",
  appId: "1:137798275219:web:0b13ddc8fd99e0f7cb3d66",
  measurementId: "G-PB15764RS9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(app);
