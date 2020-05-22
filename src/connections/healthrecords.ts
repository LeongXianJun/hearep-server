import db from './'
import { resolve } from 'dns'

const collection = () => db.collection('healthrecords')

const convertor: FirebaseFirestore.FirestoreDataConverter<HR> = {
  fromFirestore: (data) => ({
    id: data.id,
    type: data.type
  }),
  toFirestore: (obj: HR) => ({
    type: obj.type
  })
}

interface HR {
  id: string
  type: string
}

const allHR = () => 
  collection()
    // .where('deleteAt', '==', null)
    .withConverter(convertor)
    .get()
    .then((result) => {
      return result.docs.map(r =>
        r.data()
      )
    })
    .catch(err => 
      console.log(err)
    )

const insertHR = (input: { type: string }) =>
  collection()
    .add({
      type: input.type
    })
    .then(docRef => {
      console.log('Document written with ID: ', docRef.id)
      return { response: 'Insert successfully' }
    })
    .catch(err => {
      console.error('Error adding document: ', err)
    })

const updateHR = (input: HR) => 
  collection()
    .doc(input.id)
    .withConverter(convertor)
    .set({
      ...input
    })
    .then(docRef => {
      console.log('Document written with ID: ', docRef)
    })
    .catch(err => {
      console.error('Error updating document: ', err)
    })

const deleteHR = (input: HR) => 
  collection().doc(input.id)
    .set({
      deleteAt: FirebaseFirestore.FieldValue.serverTimestamp()
    }, { merge: true })
    .then(docRef => {
      console.log('Document written with ID: ', docRef)
    })
    .catch(err => {
      console.error('Error deleting document: ', err)
    })

export {
  allHR,
  insertHR,
  updateHR,
  deleteHR
}