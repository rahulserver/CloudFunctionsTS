'use strict';

import * as admin from "firebase-admin";
import Timestamp = admin.firestore.Timestamp;

const adminInstance = require("../../utils/test-admin");
const environment = require("../../environments/test");
const context = {adminInstance, environment};
const Func = require("./leads-fix-source-callable");
const db = adminInstance.firestore();
describe('leadsFixSource', () => {
  let func: (data: any, callableContext: any) => Promise<{ success: boolean, timestamp: Timestamp }>;
  const callableContext: any = {
    auth: {
      uid: "test",
    }
  };

  beforeEach(async () => {
    // Put the setup code here
    func = Func(context);
  });

  it("should return error if no leadId is passed", async done => {
    await expect(func(null, callableContext)).rejects.toThrowError();
    done();
  });

  it("should throw error if invalid leadId is passed", async done => {
    await expect(func("blahblahblahleadidwrong", callableContext)).rejects.toThrowError();
    done();
  });

  it("should return success if valid leadId is passed", async done => {
    const resp = await func({leadId: "08JHG89ci2lB4f8M6o8g"}, callableContext);
    expect(resp.success).toEqual(true);
    done();
  });

  it("should write proper timestamp in leadId", async done => {
    const leadId = "08JHG89ci2lB4f8M6o8g";
    const resp = await func({leadId}, callableContext);
    const documentData = (await db.collection("leads").doc(leadId).get()).data();
    expect(documentData[`userVisits`][`${callableContext.auth.uid}`]).toMatchObject(resp.timestamp);
    done();
  });

});
