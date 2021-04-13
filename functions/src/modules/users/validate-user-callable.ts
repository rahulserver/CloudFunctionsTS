'use strict';
import * as admin from "firebase-admin";
import {CallableContext} from "firebase-functions/lib/providers/https";
const functions = require("firebase-functions");
module.exports = ({adminInstance, environment}: { adminInstance: admin.app.App, environment: object }) => async (data: any, {auth}: CallableContext): Promise<{ valid: boolean, id: string | null }> => {
  const email = data.email;
  if(!email) {
    throw new functions.https.HttpsError('failed-precondition','email is required to call this function');
  }
  const db = adminInstance.firestore();
  console.log("email", email);
  const doc = await db.collection("users").where("email", "==", email).get();
  if (!doc.empty) {
    return {valid: true, id: doc.docs[0].id};
  } else {
    return {valid: false, id: null};
  }
};
