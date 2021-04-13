'use strict';
import * as admin from "firebase-admin";
import UserRecord = admin.auth.UserRecord;

const adminInstance = require("../../utils/test-admin");
const environment = require("../../environments/test");
const context = {adminInstance, environment};
const Func = require("./validate-user-callable");
const auth = adminInstance.auth();
describe('validateUser', () => {
  let func: (data: any, callableContext: any) => Promise<{ valid: boolean, id: string | null }>;
  let createdUser: UserRecord;
  // TODO: create this existing user from test itself rather than existing once the user interface is finalized
  const existingActivatedUserId = "TCKb0wl3SNPPWBHdjRBXIXtF9j53";
  const callableContext: any = {
    auth: {
      uid: "test",
    }
  };

  beforeEach(async () => {
    // Put the setup code here
    func = Func(context);
  });

  it("should return valid:false for the created user in this test as it does not exist in users collection", async done => {
    // create a test user
    createdUser = await auth.createUser({
      email: "testabc@gmail.com",
      password: "testabc"
    });
    console.log("Created the test user");
    const response = await func({email: createdUser.email}, callableContext);
    await auth.deleteUser(createdUser.uid);
    console.log("deleted the createdUser");
    expect(response.valid).toBe(false);
    done();
  });
  it("should return valid:true for the existing user", async done => {
    const existingUser: UserRecord = await auth.getUser(existingActivatedUserId);
    const response = await func({email: existingUser.email}, callableContext);
    expect(response.valid).toBe(true);
    done();
  });

});
