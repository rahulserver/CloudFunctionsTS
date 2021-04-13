import * as admin from "firebase-admin";
import {Lead} from "../../models/classes/lead";
import * as shortid from "shortid";
import DocumentReference = admin.firestore.DocumentReference;

const emailValidator = require("email-validator");
const generalUtils = require("../../utils/general");

const TEN_YEARS_FROM_NOW_MS = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 10);
  return date.getTime()
})();
let metas: any;
let metaUpdated = 0;

export class Utils {
  adminInstance: admin.app.App;
  environment: object;

  constructor(adminInstance: admin.app.App, environment: object) {
    this.adminInstance = adminInstance;
    this.environment = environment;
  }

  async leadsHelper(data: any, merge = true): Promise<Lead> {
    const db = this.adminInstance.firestore();
    const document = await this._leadPreparationForInsert(data);
    if (data.id) {
      const id = data.id;
      delete data["id"];
      await db.collection("leads").doc(id).set(generalUtils.customObjectToJson(document));
      return new Lead({...document, id});
    }
    // insert into the lead collection
    const docRef: DocumentReference = await db.collection("leads").add(generalUtils.customObjectToJson(document));
    return new Lead({...document, id: docRef.id});
  }

  async _leadPreparationForInsert(data: any) {
    await this._leadProcessor(data);
    await this._leadValidator(data);
    if (!data.dateCreated) {
      data.dateCreated = admin.firestore.Timestamp.now();
    }

    if (!data.dateUpdated) {
      data.dateUpdated = admin.firestore.Timestamp.now();
    }

    if (!data.shortId) {
      data.shortId = shortid.generate()
    }
    return data;
  }

  /**
   * A util func to process lead data submitted by user
   * This is more universal func can be used before update,merge & insert...
   * @param data
   * @returns {Promise<*>}
   * @private
   */
  async _leadProcessor(data: any) {
    if (!data.source) {
      if (data.regReferrer) {
        data.source = (await this._getAutoSourceFromReferrer(data.regReferrer));
        if (!data.source)
          delete data.source;
      }
    }

    data.email = data.email.trim().toLowerCase();

    if (data.phone) {
      const number = data.phone
        //delete all non-digit except for +
        .replace(/[^\d+]/g, "")
        //replace leading 00
        .replace(/^00/, "+")
        //support incomplete numbers for common mistakes for Australian numbers.
        .replace(/^61/, "+61").replace(/^\+6104/, "+614")
        //support for Chinese mainland as well.
        .replace(/^86/, "+86");

      delete data.phone;

      if (/^(04|\+614)\d{8}$/.test(number)) {
        data.mobile = number.replace(/^04/, "+614");
      } else {
        data.phone = number;
      }

    }

    if (data.budget) {
      data.budget = data.budget.filter((el: any) => {
        return el !== null;
      });
      if (data.budget.length === 0) {
        delete data.budget;
      }
    }

    if (data.project) {
      data.projects = [data.project];
      //keep project as the original project when created
      // delete data.project;
    }

    /*
    Dont put !data.dateCreated->dateCreated=now() here for more universal use.
     */
    //
    if (data.dateCreated && typeof (data.dateCreated) === "number") {
      // makes sure that the date is converted to epoch in milliseconds
      let ms = data.dateCreated * 1000;
      if (ms > TEN_YEARS_FROM_NOW_MS) {
        ms = ms / 1000;
      }

      data.dateCreated = admin.firestore.Timestamp.fromMillis(ms);
    }

    if (data.dateUpdated && typeof (data.dateCreated) === "number") {
      let ms = data.dateUpdated * 1000;
      if (ms > TEN_YEARS_FROM_NOW_MS) {
        ms = ms / 1000;
      }
      data.dateUpdated = admin.firestore.Timestamp.fromMillis(ms);
    }

    // tslint:disable-next-line:no-parameter-reassignment
    data = generalUtils.removeUndefinedNullsFromObjDeep(data);

    return data;
  }

  /**
   * Must run after leadProcessor.
   * @param data
   * @returns {Promise<*>}
   * @private
   */
  async _leadValidator(data: any) {
    /*
    makes more sense to me throw generic Error here. the http errors should be throw within the http calls.
     */
    if (!data.project && (!data.projects || !data.projects.length)) {
      throw new Error(
        `Project is Mandatory.`
      );
    }

    if (!(data.name && data.name.trim().length > 0)) {
      throw new Error(
        "Name is mandatory."
      );
    }
    if (!(data.email && data.email.trim().length > 0)) {
      throw new Error(
        `Email is mandatory. ${JSON.stringify(data)}`
      );
    }
    if (!emailValidator.validate(data.email)) {
      throw new Error(`Provided email ${data.email} is not valid`)
    }

    if (data.phone) {
      if (data.phone.length < 8) {
        throw new Error(
          `The provided type ${data.phone} is not valid.`
        );
      }
    }
    //// code below needs metas
    await this.updateMeta();

    for (let i = 0; i < data.projects; i++) {
      const curProject = data.projects[i];
      if (!metas.projects[curProject]) {
        throw new Error(
          `The project ${curProject} is  not valid`
        );
      }
    }

    if (data.source) {
      const sources = Object.values(metas.leads["sources"]).map((it: any) => it.value);
      if (sources.indexOf(data.source) < 0) {
        throw new Error(
          `The provided source ${data.source} is not valid.`
        );
      }
    }
    if (data.type) {
      const types = Object.keys(metas.leads["types"]);
      if (types.indexOf(data.type) < 0) {
        throw new Error(
          `The provided type ${data.type} is not valid.`
        );
      }
    }
    return data;
  }

  /**
   * Cache metas for better performance when doing batch
   * @returns {Promise<*>}
   */
  async updateMeta() {
    const now = new Date().getTime();
    const rtDb = admin.database();
    //metas cached for 5 minutes
    const update = !metas || (now - metaUpdated > 30000);
    if (update) {
      metas = (
        await rtDb.ref("_meta").once('value')
      ).val();
      metaUpdated = now;
    }
    return metas;
  }

  async _getAutoSourceFromReferrer(referrer: string): Promise<string | undefined> {
    return this.adminInstance.database().ref("_meta/leads/sourcePatterns").once('value').then((snap) => {
      const sourcePatterns = snap.val();
      console.log("referrer", referrer, sourcePatterns);
      return Object.keys(sourcePatterns).find(key => sourcePatterns[key].filter((pattern: string) => referrer.indexOf(pattern) > -1).length > 0);
    });
  }

  async leadsHelperBatch(data: any, merge = true): Promise<Array<string>> {
    const db = this.adminInstance.firestore();
    const docIds: Array<string> = [];
    await db.runTransaction(async (t) => {
      // now the write operation
      for (let i = 0; i < data.length; i++) {
        let curLead = data[i];
        // eslint-disable-next-line no-await-in-loop
        curLead = await this._leadPreparationForInsert(curLead);

        const document = {
          ...curLead,
          type: "IMP",
        };
        const docId = db.collection("leads").doc();
        // eslint-disable-next-line no-await-in-loop
        await t.set(docId, document);
        docIds.push(docId.id);
      }
    });
    return docIds;
  }

  async fixSource(leadId: any): Promise<(string | undefined)> {
    let db = this.adminInstance.firestore();
    // find the lead
    let lead = (await db.collection("leads").doc(leadId).get()).data();
    let autoSource = undefined;
    if (lead && lead.regReferrerDomain) {
      autoSource = await this._getAutoSourceFromReferrer(lead.regReferrerDomain);
      if (autoSource) {
        // update the lead source
        await db.collection("leads").doc(leadId).update({
          source: autoSource
        });
        return autoSource;
      }
    }
    return autoSource;
  }
}

