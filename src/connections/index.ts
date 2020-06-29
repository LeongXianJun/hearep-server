import admin from 'firebase-admin'

require('custom-env').env()

const app = admin.initializeApp({
  credential: admin.credential.cert({ ...process.env })
})

const db = admin.firestore(app)

const messaging = admin.messaging(app)

export {
  db,
  messaging
}
export * from './users'
export * from './healthrecords'
export * from './appointments'
export * from './accessLogs'
export * from './performances'
export * from './healthConditions'