import admin from 'firebase-admin'

require('custom-env').env()

const app = admin.initializeApp({
  credential: admin.credential.cert({
    "projectId": process.env.projectId,
    "privateKey": process.env.privateKey,
    "clientEmail": process.env.clientEmail,
  })
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