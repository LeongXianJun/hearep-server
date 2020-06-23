import admin from 'firebase-admin'

require('custom-env').env()

const db = admin.firestore(
  admin.initializeApp({
    credential: admin.credential.cert({ ...process.env })
  })
)

export default db
export * from './users'
export * from './healthrecords'
export * from './appointments'
export * from './accessLogs'
export * from './performances'
export * from './healthConditions'