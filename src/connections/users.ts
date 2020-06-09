import db from './'
import { firestore } from 'firebase-admin'

const collection = () => db.collection(
  process.env.NODE_ENV === 'test'
    ? 'test_users'
    : 'users'
)

const getUser = (uid: string) =>
  collection()
    .doc(uid)
    .get()
    .then(result => {
      const user = result.data()
      if (user) {
        if (user.deleteAt) {
          throw new Error('This account is removed.')
        } else {
          return { id: user.id, ...user }
        }
      } else {
        throw new Error('No such user in the system')
      }
    })

const getAllPatients = () =>
  collection()
    .where('type', '==', 'Patient')
    .get()
    .then(result => {
      if (result.empty)
        throw new Error('No patient in the system yet')
      else {
        return result.docs.reduce<FirebaseFirestore.DocumentData[]>((all, r) => {
          const data = r.data()
          if (data.deleteAt === undefined) {
            return [ ...all, { id: r.id, ...data } ]
          } else {
            return all
          }
        }, [])
      }
    }).then(datas => {
      if (datas.length > 0)
        return datas
      else
        throw new Error('No more patient in the system yet')
    })

const getAllMedicalStaff = () =>
  collection()
    .where('type', '==', 'Medical Staff')
    .get()
    .then(result => {
      if (result.empty)
        throw new Error('No medical staff in the system yet')
      else {
        return result.docs.reduce<FirebaseFirestore.DocumentData[]>((all, r) => {
          const data = r.data()
          if (data.deleteAt === undefined) {
            return [ ...all, { id: r.id, ...data } ]
          } else {
            return all
          }
        }, [])
      }
    }).then(datas => {
      if (datas.length > 0)
        return datas
      else
        throw new Error('No more medical staff in the system yet')
    })

const insertUser = (type: User[ 'type' ]) => (input: { uid: string, username: string, dob: string, gender: User[ 'gender' ], email: string, medicalInstituition?: MedicalInstituition, phoneNumber?: string, occupation?: string }) =>
  collection()
    .doc(input.uid)
    .create({
      type,
      username: input.username,
      dob: input.dob,
      gender: input.gender,
      email: input.email,
      ...type === 'Medical Staff'
        ? {
          medicalInstituition: { ...input.medicalInstituition }
        }
        : type === 'Patient'
          ? {
            phoneNumber: input.phoneNumber,
            occupation: input.occupation
          }
          : {}
    })
    .then(docRef => {
      // console.log('Document written with ID: ', docRef)
      return { response: 'Insert successfully', docId: input.uid }
    })
    .catch(err => {
      throw new Error('Error adding document: ' + err)
    })

const updateUser = (uid: string, input: { username: string, dob: Date, gender: User[ 'gender' ], medicalInstituition?: MedicalInstituition, occupation?: string }) =>
  collection()
    .doc(uid)
    .update({
      ...input
    })
    .then(docRef => {
      // console.log('Document written (mod) with ID: ', input.id)
      return { response: 'Update successfully' }
    })
    .catch(err => {
      throw new Error('Error updating document: ' + err)
    })

const deleteUser = (uid: string) =>
  collection()
    .doc(uid)
    .update({
      deleteAt: firestore.Timestamp.now()
    })
    .then(docRef => {
      // console.log('Document written (del) with ID: ', docRef)
      return { response: 'Delete successfully' }
    })
    .catch(err => {
      throw new Error('Error deleting document: ' + err)
    })

export type User = {
  id: string // similar to firebase auth id
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
  getAllPatients as getAllP,
  getAllMedicalStaff as getAllMS,
  insertUser as insertU,
  updateUser as updateU,
  deleteUser as deleteU
}