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
          return {
            id: result.id, ...user, dob: user.dob.toDate(),
            ...user.type === 'Medical Staff'
              ? {
                ...user.workingTime?.type === 'byNumber'
                  ? {
                    workingTime: {
                      ...user.workingTime,
                      timeslots: [
                        ...(user.workingTime.timeslots as any[]).map(ts => ({
                          ...ts,
                          startTime: ts.startTime.toDate(),
                          endTime: ts.endTime.toDate(),
                        }))
                      ]
                    }
                  }
                  : {}
              }
              : {}
          }
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
            return [ ...all, { id: r.id, ...data, dob: data.dob.toDate() } ]
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
            return [ ...all, {
              id: r.id, ...data, dob: data.dob.toDate(),
              ...data.workingTime?.type === 'byNumber'
                ? {
                  workingTime: {
                    ...data.workingTime,
                    timeslots: [
                      ...(data.workingTime.timeslots as any[]).map(ts => ({
                        ...ts,
                        startTime: ts.startTime.toDate(),
                        endTime: ts.endTime.toDate(),
                      }))
                    ]
                  }
                }
                : {}
            } ]
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

const insertUser = (type: User[ 'type' ]) => (input: { uid: string, username: string, dob: Date, gender: User[ 'gender' ], email: string, medicalInstituition?: MedicalInstituition, phoneNumber?: string, occupation?: string }) =>
  collection()
    .doc(input.uid)
    .create({
      type,
      username: input.username,
      dob: firestore.Timestamp.fromDate(new Date(input.dob)),
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
      ...input,
      ...input.dob
        ? {
          dob: firestore.Timestamp.fromDate(new Date(input.dob))
        }
        : {}
    })
    .then(docRef => {
      // console.log('Document written (mod) with ID: ', input.id)
      return { response: 'Update successfully' }
    })
    .catch(err => {
      throw new Error('Error updating document: ' + err)
    })

const updateWorkingTime = (uid: string, input: { workingTime: WorkingTime }) =>
  collection()
    .doc(uid)
    .update({
      workingTime: {
        ...input.workingTime,
        ...input.workingTime.type === 'byTime'
          ? {
            timeslots: input.workingTime.timeslots.map(ts => ({
              ...ts, slots: ts.slots.map(s => parseInt(s.toString()))
            }))
          }
          : input.workingTime.type === 'byNumber'
            ? {
              timeslots: [
                ...input.workingTime.timeslots.map(ts => ({
                  ...ts,
                  startTime: firestore.Timestamp.fromDate(new Date(ts.startTime)),
                  endTime: firestore.Timestamp.fromDate(new Date(ts.endTime))
                }))
              ]
            }
            : {}
      }
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
  dob: Date
  gender: 'M' | 'F'
  email: string
} & (
    {
      type: 'Medical Staff'
      medicalInstituition: MedicalInstituition
      workingTime: WorkingTime
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

// Timeslot
export const TimeInterval = [
  { hr: 8, min: 0 },
  { hr: 9, min: 0 },
  { hr: 10, min: 0 },
  { hr: 11, min: 0 },
  { hr: 12, min: 0 },
  { hr: 13, min: 0 },
  { hr: 14, min: 0 },
  { hr: 15, min: 0 },
  { hr: 16, min: 0 },
  { hr: 17, min: 0 }
]

export type WorkingTime = {
  type: 'byTime'
  timeslots: {
    // represent Sunday, Monday, Tuesday and so on
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6
    slots: number[]
  }[]
} | {
  type: 'byNumber'
  timeslots: {
    // represent Sunday, Monday, Tuesday and so on
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6
    startTime: Date
    endTime: Date
  }[]
}

export {
  getUser as getU,
  getAllPatients as getAllP,
  getAllMedicalStaff as getAllMS,
  insertUser as insertU,
  updateUser as updateU,
  updateWorkingTime as updateWT,
  deleteUser as deleteU
}