'use strict';
import * as admin from "firebase-admin";
import {CallableContext} from "firebase-functions/lib/providers/https";
import {Utils} from "./utils";

const functions = require("firebase-functions");

module.exports = ({adminInstance, environment}: { adminInstance: admin.app.App, environment: object }) => async (data: any, {auth}: CallableContext): Promise<Array<string>> => {
  //TODO (later)move auth check to a universal function
  if (!auth || !auth.uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be authenticated to use this endpoint"
    );
  }

  const util = new Utils(adminInstance, environment);

  if (!Array.isArray(data)) {
    throw new functions.https.HttpsError("failed-precondition", "Expected data to be an array.");
  }
  const docIds: Array<string> = await util.leadsHelperBatch(data);
  return docIds;
};
