import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwBmQp30NYs0UTGSwzY8EDLY8RZ50wbrc",
  authDomain: "order-delivery.firebaseapp.com",
  projectId: "order-delivery-42632",
  storageBucket: "order-delivery-42632.appspot.com",
  messagingSenderId: "681271076964",
  appId: "1:681271076964:android:fd0153982d5f0dd8c75771"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();

export { firebase, auth, firestore };
