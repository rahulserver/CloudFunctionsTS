// @ts-nocheck
'use strict';

import {IUser} from "../../models/interfaces/iuser";

const adminInstance = require("../../utils/test-admin");
const environment = require("../../environments/test");
const context = {adminInstance, environment};
const Func = require("./update-user-callable");
describe('updateUser', () => {
  let func: (data: any, callableContext: any) => Promise<{ success: boolean }>;
  const db = adminInstance.firestore();
  const callableContext: any = {
    auth: {
      uid: "test",
    }
  };

  beforeEach(async () => {
    // Put the setup code here
    func = Func(context);
  });

  const testUserId = "testusertobedeleted";
  const testUser: IUser = {
    dateActivated: new Date(),
    dateInvited: new Date(),
    displayName: "Test Wa",
    email: "test@zest.com",
    name: "Test",
    phoneNumber: 0,
    photoURL: "",
    provider: [
      "google.com"
    ],
    surname: "Wa",
    uid: testUserId
  };

  it("should return success:true for existing user uid", async done => {
    try {
      // create the test user
      await db.collection("users").doc(testUserId).set(testUser);
      const resp = await func(testUser, callableContext);
      expect(resp.success).toEqual(true);
      done();
    } finally {
      await db.collection("users").doc(testUserId).delete();
    }
  });
  it("should return success:false for non existing user uid", async done => {
    const resp = await func({uid: "somenonexistingusieruid"}, callableContext);
    expect(resp.success).toEqual(false);
    done();
  });

  it('should update displayName prop for an existing user', async () => {
    try {
      // create the test user
      await db.collection("users").doc(testUserId).set(testUser);

      // update the displayName of this user
      testUser.displayName = "Testing user";

      // call the function to update this test user
      const resp = await func(testUser, callableContext);
      expect(resp.success).toEqual(true);

      // get the user from db
      const testUserDocData = (await db.collection("users").doc(testUserId).get()).data();
      expect(testUserDocData.displayName).toEqual(testUser.displayName);
    } finally {
      await db.collection("users").doc(testUserId).delete();
    }
  });
});
