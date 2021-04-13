'use strict';

import * as admin from "firebase-admin";
import DocumentData = admin.firestore.DocumentData;
import DocumentReference = admin.firestore.DocumentReference;

const adminInstance = require("../../utils/test-admin");
const environment = require("../../environments/test");
const context = {adminInstance, environment};
const Func = require("./leads-comment-callable");
const db = adminInstance.firestore();

describe('leadsComment', () => {
  let func: (data: any, callableContext: any) => Promise<{ result: DocumentReference<DocumentData> }>;
  let createdCommentId: string;
  const callableContext: any = {
    auth: {
      uid: "test",
    }
  };

  beforeEach(async () => {
    // Put the setup code here
    func = Func(context);
  });

  it("should return error if no targetId is passed", async done => {
    await expect(func(null, callableContext)).rejects.toThrowError();
    done();
  });

  it("should throw error if invalid targetId is passed", async done => {
    await expect(func("blahblahblahleadidwrong", callableContext)).rejects.toThrowError();
    done();
  });

  it("should return proper result.id when a valid comment is successfully created", async done => {
    const result = await func({
      targetId: "08JHG89ci2lB4f8M6o8g",
      message: "test comment to be deleted"
    }, callableContext);
    createdCommentId = result.result.id;
    console.log(`created comment id ${createdCommentId}`);
    expect(createdCommentId).not.toEqual(null);
    done();
  });

  afterAll(async () => {
    // delete the comment
    await db.collection("comments").doc(createdCommentId).delete();
    console.log(`deleted the comment with id ${createdCommentId}`);
  });
});
