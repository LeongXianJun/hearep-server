import db from './'
import { firestore } from 'firebase-admin'

const collection = () => db.collection(
  process.env.NODE_ENV === 'test'
    ? 'test_healthrecords'
    : 'healthrecords'
)

const allHR = (patientId: string) =>
  collection()
    .where('patientId', '==', patientId)
    .get()
    .then(result => {
      return result.docs.reduce<FirebaseFirestore.DocumentData[]>((all, r) => {
        const data = r.data()
        if (data.deleteAt === undefined) {
          return [ ...all, {
            id: r.id, ...data, date: data.date.toDate(),
            ...data.refillDate
              ? {
                refillDate: data.refillDate.toDate()
              }
              : {}
          } ]
        } else {
          return all
        }
      }, [])
    }).then(datas => {
      if (datas.length > 0)
        return datas
      else
        throw new Error('No more record in the system yet')
    })

const insertHR = (type: HR[ 'type' ]) => (input: {
  medicalStaffId: string, patientId: string, date: Date, appId?: string, illness?: string, clinicalOpinion?: string, prescriptionId?: string, refillDate?: Date, medications?: Medication[], title?: string, comment?: string, data?: LabTestField[]
}) =>
  collection()
    .add({
      type,
      medicalStaffId: input.medicalStaffId,
      patientId: input.patientId,
      date: firestore.Timestamp.fromDate(new Date(input.date)),
      ...type === 'Health Prescription'
        ? {
          ...input.appId
            ? {
              appId: input.appId,
            }
            : {},
          illness: input.illness,
          clinicalOpinion: input.clinicalOpinion
        }
        : type === 'Medication Record'
          ? {
            prescriptionId: input.prescriptionId,
            refillDate: firestore.Timestamp.fromDate(new Date(input.refillDate ?? new Date())),
            medications: input.medications?.map(m => ({
              ...m,
              dosage: parseInt(m.dosage.toString())
            }))
          }
          : type === 'Lab Test Result'
            ? {
              ...input.appId
                ? {
                  appId: input.appId,
                }
                : {},
              title: input.title,
              comment: input.comment,
              data: input.data
            }
            : {}
    })
    .then(docRef => {
      // console.log('Document written with ID: ', docRef.id)
      return { response: 'Insert successfully', docId: docRef.id }
    })
    .catch(err => {
      throw new Error('Error adding document: ' + err)
    })

const updateHR = (id: string) => (input: {
  illness?: string, clinicalOpinion?: string, refillDate?: Date, medications?: Medication[], title?: string, comment?: string, data?: LabTestField[]
}) =>
  collection()
    .doc(id)
    .update({
      ...input,
      ...input.refillDate
        ? {
          refillDate: firestore.Timestamp.fromDate(new Date(input.refillDate))
        }
        : {},
      ...input.medications
        ? {
          medications: input.medications.map(m => ({
            ...m,
            dosage: parseInt(m.dosage.toString())
          }))
        }
        : {}
    })
    .then(docRef => {
      // console.log('Document written (mod) with ID: ', docRef)
      return { response: 'Update successfully' }
    })
    .catch(err => {
      throw new Error('Error updating document: ' + err)
    })

const deleteHR = (hrid: string) => {
  const batch = db.batch()
  return collection()
    .where('prescriptionId', '==', hrid)
    .get()
    .then(docs =>
      docs.forEach(doc => {
        batch.update(doc.ref, { deleteAt: firestore.Timestamp.now() })
      })
    ).then(() =>
      batch.update(collection().doc(hrid), { deleteAt: firestore.Timestamp.now() })
    ).then(() =>
      batch.commit()
        .then(docRef => {
          // console.log('Document written (del) with ID: ', docRef)
          return { response: 'Delete successfully' }
        })
        .catch(err => {
          throw new Error('Error deleting document: ' + err)
        })
    )

}

export type HR = {
  id: string
  medicalStaffId: string
  patientId: string
  date: Date // doc creation date can be different from the record creation date
} & (
    {
      type: 'Health Prescription'
      appId: string // appointment id
      illness: string
      clinicalOpinion: string
    } | {
      type: 'Medication Record'
      prescriptionId: string
      refillDate: Date
      medications: Medication[]
    } | {
      type: 'Lab Test Result'
      appId: string // appointment id
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