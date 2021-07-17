import firebase from 'firebase';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8N7aCavXP8KouGtIhMpGatJ2zQCGtHHA",
  authDomain: "discord-clone-dcaab.firebaseapp.com",
  projectId: "discord-clone-dcaab",
  storageBucket: "discord-clone-dcaab.appspot.com",
  messagingSenderId: "672721432901",
  appId: "1:672721432901:web:5464348afd537654054e2c",
  measurementId: "G-7QK2TZML27",
};


const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();

const auth = firebase.auth();

const provider = new firebase.auth.GoogleAuthProvider();

const storageRef = firebase.storage().ref();

export { auth, provider, db , storageRef};