import firebase from 'firebase';


const  firebaseConfig = {
  apiKey: "AIzaSyBPBYhgSs83--_FPTz5VrmdgwFB5m51dMY",
  authDomain: "big-whale-monitor.firebaseapp.com",
  projectId: "big-whale-monitor",
  storageBucket: "big-whale-monitor.appspot.com",
  messagingSenderId: "1004702123061",
  appId: "1:1004702123061:web:0e481505682c24cdd59d7c",
  measurementId: "G-PZTLH8T3TE"
};

  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

export default firebase;

export const database = firebase.database();
export const auth = firebase.auth();
export const storage = firebase.storage();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();