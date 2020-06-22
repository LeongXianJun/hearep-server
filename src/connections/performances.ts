import db from './'
import { firestore } from 'firebase-admin'

const appCollection = () => db.collection(
  process.env.NODE_ENV === 'test'
    ? 'test_appointments'
    : 'appointments'
)

// appointment handled, new app, average consulation time, average waiting time
const performance = (medicalStaffId: string, date: Date) => {
  const d = new Date(date)
  const startTarget = firestore.Timestamp.fromMillis(d.getTime() - 7 * 24 * 360000)
  const endTarget = firestore.Timestamp.fromDate(d)

  return Promise.all([
    appCollection()
      .where('medicalStaffId', '==', medicalStaffId)
      .where('status', 'in', [ 'Pending', 'Accepted', 'Rejected', 'Waiting', 'Completed', 'Cancelled' ])
      .where('date', '>=', startTarget)
      .where('date', '<=', endTarget)
      .get()
      .then(result => {
        if (result.empty)
          throw new Error('No appointment in the system yet')
        else {
          return result.docs.map(r => {
            const data = r.data()
            return {
              id: r.id, ...data, date: data.date.toDate(),
              status: data.status, updatedOn: r.updateTime.toDate(), type: data.type,
              ...data.time
                ? {
                  time: data.time.toDate()
                }
                : {}
            }
          })
        }
      }),
  ]).then(([ allApp ]) => ({ allApp }))
}

export {
  performance
}