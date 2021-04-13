'use strict';
import * as admin from "firebase-admin";
import {CallableContext} from "firebase-functions/lib/providers/https";
import {Utils} from "./utils";

const functions = require("firebase-functions");


module.exports = ({adminInstance, environment}: { adminInstance: admin.app.App, environment: object }) => async (data: any, {auth}: CallableContext): Promise<string | undefined> => {
  const {leadId} = data;
  if (!leadId) {
    throw new functions.https.HttpsError('failed-precondition', 'leadId is required');
  }
  const util = new Utils(adminInstance, environment);
  return util.fixSource(leadId);
};

