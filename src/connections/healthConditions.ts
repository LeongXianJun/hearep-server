import db from './'
import { firestore } from 'firebase-admin'

const collection = (uid: string) =>
  process.env.NODE_ENV === 'test'
    ? db.collection('test_healthConditions')
    : db.collection('users').doc(uid).collection('healthConditions')

const getHealthConditions = (uid: string, date: Date) => {
  const d = new Date(date)
  const startTarget = firestore.Timestamp.fromMillis(d.getTime() - 7 * 24 * 3600000)
  const endTarget = firestore.Timestamp.fromDate(d)

  return collection(uid)
    .where('date', '>=', startTarget)
    .where('date', '<=', endTarget)
    .get()
    .then(result =>
      result.docs.map(r => {
        const data = r.data()
        return {
          updatedOn: data.date.toDate(),
          option: data.option,
          value: data.value
        }
      })
    )
}
const insertHealthCondition = (uid: string, input: HealthCondition) =>
  collection(uid)
    .add({
      date: firestore.Timestamp.fromDate(new Date(input.date)),
      option: input.option,
      value: parseInt(input.value.toString())
    })
    .then(docRef => {
      // console.log('Document written (del) with ID: ', docRef)
      return { response: 'Insert successfully', docId: docRef.id }
    })
    .catch(err => {
      throw new Error('Error deleting document: ' + err)
    })

export type HealthCondition = {
  date: Date
  option: string
  value: number
}

export const HealthConditionOptions = [
  'Blood Sugar Level',
  'Blood Pressure Level',
  'BMI',
]

export {
  getHealthConditions,
  insertHealthCondition as updateHealthConditions,
}