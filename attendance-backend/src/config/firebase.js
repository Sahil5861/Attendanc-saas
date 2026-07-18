const { initializeApp, cert } = require("firebase-admin/app");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

module.exports = admin;