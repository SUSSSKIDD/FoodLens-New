const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccount.json'); // Download from Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
