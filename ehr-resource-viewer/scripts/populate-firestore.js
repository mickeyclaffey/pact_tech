require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const sampleData = require('../sample-data.json');

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function populateFirestore() {
  console.log('Starting to populate Firestore with sample data...');
  
  try {
    const resourcesRef = collection(db, 'resourceWrappers');
    
    for (let i = 0; i < sampleData.length; i++) {
      const resource = sampleData[i];
      console.log(`Adding document ${i + 1}/${sampleData.length}: ${resource.resource.metadata.resourceType}`);
      
      await addDoc(resourcesRef, resource);
    }
    
    console.log(`✅ Successfully added ${sampleData.length} documents to Firestore!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding documents:', error);
    process.exit(1);
  }
}

populateFirestore();