'use strict';
import * as admin from "firebase-admin";
import {CallableContext} from "firebase-functions/lib/providers/https";
import Timestamp = admin.firestore.Timestamp;

const functions = require("firebase-functions");


module.exports = ({adminInstance, environment}: { adminInstance: admin.app.App, environment: object }) => async (data: any, {auth}: CallableContext): Promise<{ success: boolean, timestamp: Timestamp }> => {
//TODO (later)move auth check to a universal function
  if (!auth || !auth.uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be authenticated to use this endpoint"
    );
  }
  const db = adminInstance.firestore();
  const {leadId} = data;

  if (!leadId) {
    throw new functions.https.HttpsError('failed-precondition', 'leadId is required');
  }

  const obj: any = {};
  const timestamp: Timestamp = admin.firestore.Timestamp.now();
  obj["userVisits." + auth.uid] = timestamp;

  await db.collection("leads")
    .doc(leadId)
    .update(obj);

  return {success: true, timestamp};
};
