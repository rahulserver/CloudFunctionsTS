'use strict';
import {Lead} from "../../models/classes/lead";

const adminInstance = require("../../utils/test-admin");
const environment = require("../../environments/test");
const context = {adminInstance, environment};
const Func = require("./leads-add-callable");
const db = adminInstance.firestore();
describe('leadsAdd', () => {
  let func: (data: any, callableContext: any) => Promise<Lead>;
  let createdLeadId: any;
  const callableContext: any = {
    auth: {
      uid: "test",
    }
  };

  beforeEach(async () => {
    // Put the setup code here
    func = Func(context);
  });

  it("should create a new lead when a lead object with no id is passed", async done => {
    let leadObj: Lead;
    leadObj = new Lead({email: "test@jest.com", name: "Test Lead Jest", project: "HIVE"});
    const outputLead: Lead = await func(leadObj, callableContext);
    createdLeadId = outputLead.id;
    expect(outputLead.id?.length).toBeGreaterThan(0);
    done();
  });

  afterAll(async () => {
    if (!!createdLeadId) {
      // clean db
      await db.collection("leads").doc(createdLeadId).delete();
    }
  })
});
