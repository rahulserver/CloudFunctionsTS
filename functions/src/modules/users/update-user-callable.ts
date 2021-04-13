'use strict';
import * as admin from "firebase-admin";
import {CallableContext} from "firebase-functions/lib/providers/https";

module.exports = ({adminInstance, environment}: { adminInstance: admin.app.App, environment: object }) =>
  /**
   *
   * @param data
   * @param auth
   */
  async (data: any, {auth}: CallableContext): Promise<{ success:boolean}> => {
    const uid = data.uid;
    const db = admin.firestore();
    const doc = await db.collection("users").doc(uid).get();
    const user = doc.data();
    if (user) {
      if (user.dateActivated) {
        // delete dateActivated to prevent overwrite this field for an already activated user
        delete data["dateActivated"];
      } else {
        data.dateActivated = admin.firestore.Timestamp.now();
      }
      await db
        .collection("users")
        .doc(uid)
        .update({
          ...data
        });
      return {success: true};
    } else {
      return {success: false};
    }
  };
