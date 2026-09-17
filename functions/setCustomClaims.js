const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.setUserCustomClaims = functions.auth.user().onCreate(async (user) => {
  try {
    // Get the user's role from Firestore (set during signup)
    const userDoc = await admin.firestore().collection("users").doc(user.uid).get();
    
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      
      // Set custom claims in Firebase Auth token
      await admin.auth().setCustomUserClaims(user.uid, {
        role: role
      });
      
      console.log(`Custom claims set for user ${user.uid} with role: ${role}`);
    }
  } catch (error) {
    console.error(`Error setting custom claims for user ${user.uid}:`, error);
  }
});

exports.updateUserCustomClaims = functions.firestore
  .document("users/{uid}")
  .onUpdate(async (change, context) => {
    try {
      const newRole = change.after.data().role;
      const uid = context.params.uid;
      
      // Update custom claims whenever role changes
      await admin.auth().setCustomUserClaims(uid, {
        role: newRole
      });
      
      console.log(`Custom claims updated for user ${uid} with role: ${newRole}`);
    } catch (error) {
      console.error(`Error updating custom claims:`, error);
    }
  });
