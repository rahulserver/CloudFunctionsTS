'use strict';
import * as admin from "firebase-admin";
import {CallableContext} from "firebase-functions/lib/providers/https";
import {Lead} from "../../models/classes/lead";

const functions = require("firebase-functions");

const {Utils} = require("./utils");

module.exports = ({adminInstance, environment}: { adminInstance: admin.app.App, environment: object }) => async (data: any, {auth}: CallableContext): Promise<Lead> => {
  //TODO (later)move auth check to a universal function
  if (!auth || !auth.uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be authenticated to use this endpoint"
    );
  }
  const util = new Utils(adminInstance, environment);
  const payload = data;
  payload.type = "MAN";
  // payload.createdBy = auth!.uid;
  const lead: Lead = await util.leadsHelper(payload);
  console.log("lead", lead);
  return lead;
};
