import admin from 'firebase-admin'

require('custom-env').env()

const db = admin.firestore(
  admin.initializeApp({
    credential: admin.credential.cert({ ...process.env })
  })
)

export default db