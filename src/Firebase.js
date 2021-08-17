import firebase from "firebase/app";
import 'firebase/firestore';

//add firebase
var firebaseConfig = {
  apiKey: "AIzaSyAFITEB4CDNYk8nONsdnHKRD6wwwGxf62Q",
  authDomain: "d3practice-1ec73.firebaseapp.com",
  projectId: "d3practice-1ec73",
  storageBucket: "d3practice-1ec73.appspot.com",
  messagingSenderId: "975226657703",
  appId: "1:975226657703:web:99566cf24a6dd0cbfb7482"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const settings = { timestampsInSnapshots: true, merge: true }
db.settings(settings);
const increment = firebase.firestore.FieldValue;

export default db;
export {increment};