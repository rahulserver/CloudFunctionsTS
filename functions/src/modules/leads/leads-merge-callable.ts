'use strict';
import * as admin from "firebase-admin";
import {CallableContext} from "firebase-functions/lib/providers/https";
import DocumentData = admin.firestore.DocumentData;
import DocumentReference = admin.firestore.DocumentReference;

const functions = require("firebase-functions");


module.exports = ({adminInstance, environment}: { adminInstance: admin.app.App, environment: object }) => async (data: any, {auth}: CallableContext): Promise<{ lead: DocumentData }> => {
  if (!Array.isArray(data) || !(data.length > 1)) {
    throw new functions.https.HttpsError("failed-precondition", "A valid array of leadIDs of length>=2 is required");
  }

  const db = adminInstance.firestore();

  let documents = (await db.collection('leads').where(admin.firestore.FieldPath.documentId(), 'in', data).get());
  if (documents.empty) {
    throw new functions.https.HttpsError("failed-precondition", `No leads with provided data [${data}]`);
  }
  let docs = documents.docs;
  const mainId = data[0];
  let mainLead: DocumentData, mainLeadRef: DocumentReference<DocumentData>;
  for (let i = 0; i < documents.size; i++) {
    let doc = docs[i];
    if (doc && doc.exists) {
      // this is to make sure the mainLead is the correct one. didn't use documents[0] - not sure if fb will return the result in correct order.
      if (doc.id === mainId) {
        mainLead = doc.data();
        mainLeadRef = doc.ref;
      }
    } else {
      throw new functions.https.HttpsError("failed-precondition", `No lead with id found`);
    }
  }
  let batch = db.batch();
  // merge phones,emails,projects by unique values
  let projects = mainLead!.projects;
  for (let i = 0; i < documents.size; i++) {
    const doc = docs[i];
    if (doc.id === mainId) continue;
    const docData = doc.data();
    for (let k in docData) {
      if (k === 'projects') {
        projects = _.uniq(projects.concat(docData[k]));
      } else {
        const mainVal = mainLead![k];
        //question: is there a better way to find undefined & null?
        if (!mainLead![k] && mainVal !== true && mainVal !== 0) {
          mainLead![k] = docData[k];
        }
      }
      batch.delete(doc.ref);
    }
  }

  batch.set(mainLeadRef!, mainLead!);
  await batch.commit();
  return {lead: mainLead!};
};

