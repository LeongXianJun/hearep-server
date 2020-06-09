import db from './'

const tryConnection = () =>
  db.collection('healthrecords').get()
    .then((result) => result.docs.map(r => r.data()))
    .catch(err => {
      throw new Error(err)
    })

export {
  tryConnection
}