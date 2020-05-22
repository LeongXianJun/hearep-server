import db from './'

const tryConnection = () =>
  db.collection('healthrecords').get()
    .then((result) => {
      result.forEach(r =>
        console.log(JSON.stringify(r.data()))
      )
    })
    .catch(err => 
      console.log(err)
    )

export {
  tryConnection
}