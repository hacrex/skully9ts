'use strict';

const { initializeApp, getApp, getApps } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD80CUiiEFMa0YRlTZx6E-GbD7NZ-dzgNs",
  authDomain: "skully9ts.firebaseapp.com",
  databaseURL: "https://skully9ts-default-rtdb.firebaseio.com",
  projectId: "skully9ts",
  storageBucket: "skully9ts.firebasestorage.app",
  messagingSenderId: "785152782972",
  appId: "1:785152782972:web:40b6d18feb7785bc750ff9",
  measurementId: "G-FVKL4993LB"
};

// Initialize Firebase
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore(getApp());

module.exports = db;