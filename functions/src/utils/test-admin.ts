import * as admin from "firebase-admin";
const serviceAccountTest = require("../config/serviceAccountTest.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountTest),
  databaseURL: "https://my-app-dev.firebaseio.com"
});

module.exports = admin;
