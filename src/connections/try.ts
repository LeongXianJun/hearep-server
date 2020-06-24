import db from './'

const tryConnection = () =>
  db.collection('test_healthrecords')
    .get()
    .then((result) => result.docs.map(r => r.data()))
    .catch(err => {
      throw new Error(err)
    })

export {
  tryConnection
}