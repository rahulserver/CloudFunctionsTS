export interface IUser {
  uid?: string,
  dateActivated?: Date
  dateInvited?: Date,
  displayName?: string,
  email?: string,
  name?: string,
  phoneNumber?: number,
  photoURL?: string,
  provider?: Array<string>,
  surname?: string,
}
