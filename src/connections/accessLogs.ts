import db from './'

const collection = () => db.collection(
  process.env.NODE_ENV === 'test'
    ? 'test_accesslogs'
    : 'accesslogs'
)

const allAccessLogs = () =>
  collection()
    .get()
    .then(result => {
      return result.docs.map<FirebaseFirestore.DocumentData>(r => {
        const data = r.data()
        return { ...data, date: r.createTime.toDate() }
      })
    }).then(datas => {
      if (datas.length > 0)
        return datas
      else
        throw new Error('No more record in the system yet')
    })

const insertAccessLog = (input: Log) =>
  collection()
    .add({
      ...input
    })
    .then(docRef => {
      // console.log('Document written with ID: ', docRef.id)
      return { response: 'Insert successfully', docId: docRef.id }
    })
    .catch(err => {
      throw new Error('Error adding document: ' + err)
    })

export type Log = {
  target: string // id of the record owner
  viewedBy: string // id of the viewer
}

export {
  allAccessLogs,
  insertAccessLog
}