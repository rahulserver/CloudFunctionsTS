'use strict';
import * as admin from "firebase-admin";
import {CallableContext} from "firebase-functions/lib/providers/https";
import DocumentData = admin.firestore.DocumentData;
import DocumentReference = admin.firestore.DocumentReference;

const functions = require("firebase-functions");


module.exports = ({adminInstance, environment}: { adminInstance: admin.app.App, environment: object }) => async (data: any, {auth}: CallableContext): Promise<{ result: DocumentReference<DocumentData> }> => {
  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be authenticated to use this endpoint"
    );
  }

  const {targetId, message, action} = data;
  // validations

  if (!targetId) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "targetId is a required param"
    );
  }

  if (!message) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "message is a required param"
    );
  }

  const db = adminInstance.firestore();

  // update the lead dateUpdated first to ensure that the document exists. Will throw error if not
  await db.collection("leads").doc(targetId).update({
    dateUpdated: admin.firestore.Timestamp.now(),
    dateLastCommented: admin.firestore.Timestamp.now(),
    lastCommentedBy: auth.uid
  });
  // persist the comment in the collection
  const result: DocumentReference<DocumentData> = await
    db
      .collection("comments")
      .add({
        location: `leads/${targetId}`,
        action: action ?? null,
        user: auth.uid,
        dateCreated: admin.firestore.Timestamp.now(),
        message,
      });
  return {result: result};
};

