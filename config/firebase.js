const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');
const firebaseConfig = require('./firebase-config');

// Firebase configuration is now imported from firebase-config.js
console.log('Using Firebase config:', {
  apiKey: firebaseConfig.apiKey ? "******" : undefined,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket
});

// Initialize Firebase
let storage;
try {
  const firebaseApp = initializeApp(firebaseConfig);
  storage = getStorage(firebaseApp);
  console.log('Firebase Storage initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  // Create a mock storage object that will return errors when used
  storage = {
    _isMock: true,
    error: error
  };
}

module.exports = { storage }; 