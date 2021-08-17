import Vue from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
// import firebase from "firebase/app";
// import "firebase/firestore";

Vue.config.productionTip = false

// //add firebase
// var firebaseConfig = {
//   apiKey: "AIzaSyAFITEB4CDNYk8nONsdnHKRD6wwwGxf62Q",
//   authDomain: "d3practice-1ec73.firebaseapp.com",
//   projectId: "d3practice-1ec73",
//   storageBucket: "d3practice-1ec73.appspot.com",
//   messagingSenderId: "975226657703",
//   appId: "1:975226657703:web:99566cf24a6dd0cbfb7482"
// };
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();
// const settings = { timestampsInSnapshots: true }
// db.settings(settings);

new Vue({
  render: h => h(App),
}).$mount('#app')
