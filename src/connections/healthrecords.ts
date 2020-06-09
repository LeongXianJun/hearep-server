import db from './'
import { firestore } from 'firebase-admin'

const collection = () => db.collection(
  process.env.NODE_ENV === 'test'
    ? 'test_healthrecords'
    : 'healthrecords'
)

const allHR = () =>
  collection()
    // .where('deleteAt', '==', null)
    .get()
    .then(result => {
      return result.docs.map(r =>
        r.data()
      )
    })
    .catch(err => {
      throw new Error(err)
      return [] as HR[]
    })

const insertHR = (input: { type: string, medicalStaffID: string, patientID: string }) =>
  collection()
    .add({
      type: input.type,
      medicalStaffID: input.medicalStaffID,
      patientID: input.patientID
    })
    .then(docRef => {
      console.log('Document written with ID: ', docRef.id)
      return { response: 'Insert successfully' }
    })
    .catch(err => {
      throw new Error('Error adding document: ' + err)
    })

const updateHR = (input: HR) =>
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

const deleteHR = (HRID: string) =>
  collection().doc(HRID)
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

export type HR = {
  id: string
  medicalStaffID: string
  patientID: string
  date?: Date
  deleteAt?: firestore.Timestamp
} & ({
  type: 'Health Prescription'
  appID: string // appointment ID
  illness: string
  clinicalOpinion: string
} | {
  type: 'Medication Record'
  prescriptionID: string
  medications: Medication[]
} | {
  type: 'Lab Test Result'
  appID: string // appointment ID
  title: string
  comment: string
  data: LabTestField[]
}
  )

export type Medication = {
  medicine: string
  dosage: number
  usage: string
}

export type LabTestField = {
  field: string
  value: string
  normalRange: string
}

export {
  allHR,
  insertHR,
  updateHR,
  deleteHR
}