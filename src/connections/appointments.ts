import { db } from './'
import { firestore } from 'firebase-admin'

const collection = () => db.collection(
  process.env.NODE_ENV === 'test'
    ? 'test_appointments'
    : 'appointments'
)

const getWaitingAppointments = () =>
  collection()
    .where('status', 'in', [ 'Accepted', 'Waiting', ])
    .get()
    .then(result => {
      if (result.empty)
        throw new Error('No appointment in the system yet')
      else {
        return result.docs.map(r => {
          const data = r.data()
          return {
            id: r.id, ...data, date: data.date.toDate(), type: data.type,
            status: data.status, patientId: data.patientId, medicalStaffId: data.medicalStaffId,
            ...data.time
              ? {
                time: data.time.toDate()
              }
              : {}
          }
        }).sort((a, b) => b.date.getTime() - a.date.getTime())
      }
    }).then(data => {
      if (data.length > 0)
        return data
      else
        throw new Error('No more appointment in the system')
    })

// for medical staff
const getAppointmentsByMedicalStaff = (uid: string) =>
  collection()
    .where('medicalStaffId', '==', uid)
    .where('status', 'in', [ 'Pending', 'Accepted', 'Rejected', 'Waiting', 'Completed', 'Cancelled' ])
    .get()
    .then(result => {
      if (result.empty)
        throw new Error('No appointment in the system yet')
      else {
        return result.docs.map(r => {
          const data = r.data()
          return {
            id: r.id, ...data, date: data.date.toDate(),
            status: data.status,
            ...data.time
              ? {
                time: data.time.toDate()
              }
              : {}
          }
        }).sort((a, b) => b.date.getTime() - a.date.getTime())
      }
    }).then(data => {
      if (data.length > 0)
        return data
      else
        throw new Error('No more appointment in the system')
    })

// for patient
const getAppointmentsByPatient = (uid: string) =>
  collection()
    .where('patientId', '==', uid)
    .where('status', 'in', [ 'Pending', 'Accepted', 'Rejected', 'Waiting', 'Completed', 'Cancelled' ])
    .get()
    .then(result => {
      if (result.empty)
        throw new Error('No appointment in the system yet')
      else {
        return result.docs.map(r => {
          const data = r.data()
          return {
            id: r.id, ...data, date: data.date.toDate(),
            status: data.status,
            ...data.time
              ? {
                time: data.time.toDate()
              }
              : {}
          }
        }).sort((a, b) => b.date.getTime() - a.date.getTime())
      }
    }).then(data => {
      if (data.length > 0)
        return data
      else
        throw new Error('No more appointment in the system')
    })

const getAnAppointment = (appId: string) =>
  collection()
    .doc(appId)
    .get()
    .then(result => {
      const data = result.data()
      if (data) {
        return {
          id: result.id, ...data, date: data.date.toDate(),
          status: data.status,
          ...data.time
            ? {
              time: data.time.toDate()
            }
            : {}
        }
      } else
        throw new Error('No appointment in the system yet')
    })

const checkCrashedAppointment = async (medicalStaffId: string, time: Date) => {
  const t = new Date(time)
  const startTarget = firestore.Timestamp.fromDate(t)
  const endTarget = firestore.Timestamp.fromMillis(t.getTime() + 1000)
  return await collection()
    .where('medicalStaffId', '==', medicalStaffId)
    .where('status', 'in', [ 'Pending', 'Accepted', 'Completed' ])
    .where('time', '>=', startTarget)
    .where('time', '<=', endTarget)
    .get()
    .then(result => result.empty)
}

const getTurn = async (medicalStaffId: string, date: Date) =>
  await collection()
    .where('medicalStaffId', '==', medicalStaffId)
    .where('type', '==', 'byNumber')
    .where('date', '==', firestore.Timestamp.fromDate(new Date(date)))
    .get()
    .then(result => ({ 'turn': result.docs.length }))

// perform by patient only
const insertAppointment = (type: Appointment[ 'type' ]) => (uid: string, input: { medicalStaffId: string, date: Date, address: string, time?: Date, turn?: number }) =>
  collection()
    .add({
      type,
      patientId: uid,
      medicalStaffId: input.medicalStaffId,
      date: firestore.Timestamp.fromDate(new Date(input.date)),
      address: input.address,
      ...type === 'byTime'
        ? {
          status: 'Pending',
          time: firestore.Timestamp.fromDate(new Date(input.time ?? new Date()))
        }
        : type === 'byNumber'
          ? {
            status: 'Waiting',
            turn: input.turn ? parseInt(input.turn?.toString()) : undefined
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

const rescheduleAppointment = (oldId: string) => (type: Appointment[ 'type' ]) => (uid: string, input: { medicalStaffId: string, date: Date, address: string, time?: Date, turn?: number }) => {
  const batch = db.batch()
  // delete old app
  batch.update(collection().doc(oldId), {
    status: 'Rescheduled',
    cancelledOn: firestore.Timestamp.now(),
    cancelledBy: uid
  })

  const newRef = collection().doc()
  // insert new app
  batch.create(newRef, {
    type,
    patientId: uid,
    medicalStaffId: input.medicalStaffId,
    date: firestore.Timestamp.fromDate(new Date(input.date)),
    address: input.address,
    ...type === 'byTime'
      ? {
        status: 'Pending',
        time: firestore.Timestamp.fromDate(new Date(input.time ?? new Date()))
      }
      : type === 'byNumber'
        ? {
          status: 'Waiting',
          turn: input.turn ? parseInt(input.turn?.toString()) : undefined
        }
        : {}
  })

  return batch.commit()
    .then(docRef => {
      // console.log('Document written (mod) with ID: ', docRef)
      return { response: 'Reschedule successfully', docId: newRef.id }
    })
    .catch(err => {
      throw new Error('Error rescheduling document: ' + err)
    })
}

const updateStatus = (id: string) => (uid: string, input: { status: 'Pending' | 'Accepted' | 'Rejected' | 'Waiting' | 'Completed' | 'Cancelled' }) =>
  collection()
    .doc(id)
    .update({
      ...input,
      ...input.status === 'Rejected' || input.status === 'Cancelled'
        ? {
          cancelledOn: firestore.Timestamp.now(),
          cancelledBy: uid
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

// cancelBy contains the id of the patient who call this method
const cancelAppointment = (uid: string, appId: string) =>
  collection()
    .doc(appId)
    .update({
      status: 'Cancelled',
      cancelledOn: firestore.Timestamp.now(),
      cancelledBy: uid
    })
    .then(docRef => {
      // console.log('Document written (del) with ID: ', docRef)
      return { response: 'Cancel successfully' }
    })
    .catch(err => {
      throw new Error('Error cancelling document: ' + err)
    })

const getOccupiedSlots = (medicalStaffId: string, date: Date) => {
  const t = new Date(date),
    startDate = firestore.Timestamp.fromDate(t),
    endDate = firestore.Timestamp.fromMillis(t.getTime() + 7 * 24 * 3600 * 1000)
  return collection()
    .where('medicalStaffId', '==', medicalStaffId)
    .where('status', 'in', [ 'Pending', 'Accepted', 'Completed' ])
    .where('time', '>=', startDate)
    .where('time', '<=', endDate)
    .get()
    .then(result =>
      result.docs.map(r => ({
        time: r.data().time.toDate()
      }))
    )
}

/**
 * Patient reschedules appointment will remove the previous appointment and create a new one
 */
export type Appointment = {
  id: string
  patientId: string
  medicalStaffId: string
  date: Date // doc creation time can be different from appointmetn scheduled date
  address: string // need because the doctor may transfer to another. Some may work in multiple location
} & (
    {
      type: 'byTime'
      status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Rescheduled' | 'Cancelled'
      time: Date
    } | {
      type: 'byNumber'
      status: 'Waiting' | 'Completed' | 'Cancelled'
      turn: number
    }
  )

export {
  getWaitingAppointments,
  getAppointmentsByMedicalStaff as getAppointmentsByMS,
  getAppointmentsByPatient as getAppointmentsByP,
  getAnAppointment as getAppointment,
  insertAppointment as insertApp,
  rescheduleAppointment as rescheduleApp,
  updateStatus,
  cancelAppointment as cancelApp,
  checkCrashedAppointment,
  getTurn,
  getOccupiedSlots
}