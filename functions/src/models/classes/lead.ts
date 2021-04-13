import {IPerson} from "../interfaces/iperson";

export class Lead implements IPerson {
  dateCreated?: Date;
  dateImported?: Date;
  dateUpdated?: Date;
  email: string;
  emailStatus?: string;
  emailStatusUpdate?: Date;
  id?: string;
  importId?: string;
  importedBy?: string;
  midName?: string;
  mobile?: string;
  name: string;
  phone?: string;
  shortId?: string;
  surname?: string;
  project: string;

  constructor({dateCreated, dateImported, dateUpdated, email, emailStatus, emailStatusUpdate, id, importId, importedBy, midName, mobile, name, phone, shortId, surname, project}: Lead) {
    this.dateCreated = dateCreated;
    this.dateImported = dateImported;
    this.dateUpdated = dateUpdated;
    this.email = email;
    this.emailStatus = emailStatus;
    this.emailStatusUpdate = emailStatusUpdate;
    this.id = id;
    this.importId = importId;
    this.importedBy = importedBy;
    this.midName = midName;
    this.mobile = mobile;
    this.name = name;
    this.phone = phone;
    this.shortId = shortId;
    this.surname = surname;
    this.project = project;
  }

}
