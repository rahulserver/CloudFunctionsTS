import * as admin from "firebase-admin";
import * as functions from 'firebase-functions';

const {leadsAdd, leadsBatchAdd, leadsVisit, leadsComment} = require("./modules/leads");
const {validateUser, updateUser} = require("./modules/users");
const environment = require("./environments/prod");
admin.initializeApp();

const context = {adminInstance: admin, environment};
exports.leadsAdd = functions.https.onCall(leadsAdd(context));
exports.leadsBatchAdd = functions.https.onCall(leadsBatchAdd(context));
exports.leadsVisit = functions.https.onCall(leadsVisit(context));
exports.leadsComment = functions.https.onCall(leadsComment(context));
exports.validateUser = functions.https.onCall(validateUser(context));
exports.updateUser = functions.https.onCall(updateUser(context));
