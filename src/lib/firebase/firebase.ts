
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage'; // Import Firebase Storage

// Define the structure of essential config keys for easier checking
interface EssentialFirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined; // Add storageBucket as essential
}

const essentialKeys: EssentialFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Include storageBucket
};

let allEssentialKeysPresent = true;
(Object.keys(essentialKeys) as Array<keyof EssentialFirebaseConfig>).forEach((key) => {
  if (!essentialKeys[key]) { // Checks for undefined, null, or empty string
    console.error(
      `Firebase Config Error: NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()} is missing or empty. ` +
      `Please ensure it's set in your .env.local file and that you've restarted the Next.js development server.`
    );
    allEssentialKeysPresent = false;
  }
});

let app: FirebaseApp | undefined; // Explicitly allow app to be undefined initially
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage; // Declare storage

if (getApps().length === 0) {
  if (allEssentialKeysPresent) {
    const fullFirebaseConfig = {
      apiKey: essentialKeys.apiKey!, 
      authDomain: essentialKeys.authDomain!,
      projectId: essentialKeys.projectId!,
      storageBucket: essentialKeys.storageBucket!, // Use from essentialKeys
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
    
    if (!fullFirebaseConfig.appId) {
        console.warn("Firebase Config Warning: NEXT_PUBLIC_FIREBASE_APP_ID is missing or empty. This might be required for some Firebase services.");
    }
    if (!fullFirebaseConfig.messagingSenderId) {
        console.warn("Firebase Config Warning: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is missing or empty.");
    }


    try {
      app = initializeApp(fullFirebaseConfig);
    } catch (error) {
      console.error("Firebase initialization failed with error:", error);
      // app remains undefined
    }
  } else {
    console.error(
      'Firebase initialization was skipped due to missing essential configuration. Please check the console logs above for details.'
    );
    // app remains undefined
  }
} else {
  app = getApp();
}

if (app) {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app); // Initialize storage
} else {
  console.error(
    "Firebase app is not initialized. Auth, Firestore, and Storage services will not be available. " +
    "This is likely due to missing environment variables or an issue during initializeApp()."
  );
  auth = {} as Auth; 
  db = {} as Firestore; 
  storage = {} as FirebaseStorage; // Initialize with dummy if app failed
}

export { app, auth, db, storage }; // Export storage
