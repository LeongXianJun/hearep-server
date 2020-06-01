import db from './'
import { firestore } from 'firebase-admin'

const collection = () => db.collection(
  process.env.NODE_ENV === 'test'
    ? 'test_users'
    : 'users'
)

const getUser = (userID: string) =>
  collection()
    .where('firebaseID', '==', userID)
    .get()
    .then(result => {
      if (result.empty)
        throw new Error('No such record in the users collection')
      else {
        const user = result.docs[ 0 ]
        return { id: user.id, ...user.data() }
      }
    })
    .catch(err => {
      throw new Error(err)
    })

const insertUser = (type: 'Medical Staff' | 'Patient') => (input: { firebaseID: string, username: string, dob: string, gender: 'M' | 'F', email: string, medicationInstitution?: MedicalInstituition, phoneNumber?: string, occupation?: string }) =>
  collection()
    .add({
      type,
      firebaseID: input.firebaseID,
      username: input.username,
      dob: input.dob,
      gender: input.gender,
      email: input.email,
      ...type === 'Medical Staff'
        ? {
          medicalInstituition: { ...input.medicationInstitution }
        }
        : type === 'Patient'
          ? {
            phoneNumber: input.phoneNumber,
            occupation: input.occupation
          }
          : {}
    })
    .then(docRef => {
      console.log('Document written with ID: ', docRef.id)
      return { response: 'Insert successfully' }
    })
    .catch(err => {
      throw new Error('Error adding document: ' + err)
    })

const updateUser = (input: User) =>
  collection()
    .doc(input.id)
    .set({
      ...input
    })
    .then(docRef => {
      console.log('Document written (mod) with ID: ', docRef)
      return { response: 'Update successfully' }
    })
    .catch(err => {
      throw new Error('Error updating document: ' + err)
    })

const deleteUser = (userID: string) =>
  collection().doc(userID)
    .set({
      deleteAt: firestore.Timestamp.now()
    }, { merge: true })
    .then(docRef => {
      console.log('Document written (del) with ID: ', docRef)
      return { response: 'Delete successfully' }
    })
    .catch(err => {
      throw new Error('Error deleting document: ' + err)
    })

export type User = {
  id: string
  firebaseID: string // auth ID
  username: string
  dob: string
  gender: 'M' | 'F'
  email: string
} & (
    {
      type: 'Medical Staff'
      medicalInstituition: MedicalInstituition
    } | {
      type: 'Patient'
      phoneNumber: string
      occupation?: string
    }
  )

export type MedicalInstituition = {
  role: string
  name: string
  address: string
  department: string
}

export {
  getUser as getU,
  insertUser as insertU,
  updateUser as updateU,
  deleteUser as deleteU
}