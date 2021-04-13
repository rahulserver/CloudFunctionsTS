'use strict';

import {IPerson} from "../../models/interfaces/iperson";

const adminInstance = require("../../utils/test-admin");
const environment = require("../../environments/test");
const context = {adminInstance, environment};
const Func = require("./leads-batch-add-callable");
const db = adminInstance.firestore();
describe('leadsBatchAdd', () => {
  // data: any because in real life scenario the callable could receive any kind of data
  let func: (data: any, callableContext: any) => Promise<Array<string>>;
  const leads: Array<IPerson> = [
    {
      email: "test1@gmail.com",
      name: "test1",
      project: "HIVE"
    },
    {
      email: "test2@gmail.com",
      name: "test2",
      project: "KENT"
    },
    {
      email: "test3@gmail.com",
      name: "test3",
      project: "HM"
    }
  ];

  let leadIds: Array<string> = [];

  const callableContext: any = {
    auth: {
      uid: "test",
    }
  };

  beforeEach(async () => {
    // Put the setup code here
    func = Func(context);
  });

  it("should return doc id array equal to input data array length", async done => {
    leadIds = await func(leads, callableContext);
    expect(leadIds.length).toEqual(leads.length);
    done();
  });

  afterAll(async () => {
    for (let i = 0; i < leadIds.length; i++) {
      const leadId = leadIds[i];
      await db.collection("leads").doc(leadId).delete();
    }
  });
});
