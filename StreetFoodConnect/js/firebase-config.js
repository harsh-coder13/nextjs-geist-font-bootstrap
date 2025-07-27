// firebase-config.js
// StreetFoodConnect Firebase Configuration
// 
// IMPORTANT: Replace the placeholder values below with your actual Firebase project credentials
// 
// To get these values:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing project
// 3. Go to Project Settings (gear icon)
// 4. Scroll down to "Your apps" section
// 5. Click "Add app" and select Web (</>) 
// 6. Register your app and copy the config values
// 7. Enable Authentication (Email/Password) in Firebase Console
// 8. Enable Realtime Database in Firebase Console
// 9. Set up database rules for read/write access

const firebaseConfig = {
    // Replace with your Firebase project's API key
    apiKey: "YOUR_API_KEY_HERE",
    
    // Replace with your Firebase project's auth domain (usually: your-project-id.firebaseapp.com)
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    
    // Replace with your Firebase Realtime Database URL (usually: https://your-project-id-default-rtdb.firebaseio.com/)
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/",
    
    // Replace with your Firebase project ID
    projectId: "YOUR_PROJECT_ID",
    
    // Replace with your Firebase storage bucket (usually: your-project-id.appspot.com)
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    
    // Replace with your Firebase messaging sender ID
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    
    // Replace with your Firebase app ID
    appId: "YOUR_APP_ID"
};

// Make config available globally for other scripts
window.firebaseConfig = firebaseConfig;

// Example of what the actual config should look like (with dummy values):
/*
const firebaseConfig = {
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "streetfoodconnect-12345.firebaseapp.com",
    databaseURL: "https://streetfoodconnect-12345-default-rtdb.firebaseio.com/",
    projectId: "streetfoodconnect-12345",
    storageBucket: "streetfoodconnect-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};
*/

// Firebase Realtime Database Rules (to be set in Firebase Console):
/*
{
  "rules": {
    "vendors": {
      ".read": true,
      ".write": true
    },
    "contacts": {
      ".read": true,
      ".write": true
    }
  }
}
*/

console.log('Firebase config loaded. Remember to replace placeholder values with actual Firebase credentials!');
