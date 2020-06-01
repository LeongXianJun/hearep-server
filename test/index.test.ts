import admin from 'firebase-admin'

import { post, put } from './supertest'
import db from '../src/connections'
import { tryConnection } from '../src/connections/try'

beforeAll(() => {
  // create testing collections with some data (optional)
})

afterAll(async () => {
  const batch = db.batch()
  const removeAll = (testCollections: string[]) =>
    Promise.all([
      ...testCollections.map(tc => db.collection(tc).get())
    ])
      .then((allC) =>
        allC.reduce<FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]>((a, col) => [ ...a, ...col.docs ], []).forEach(doc => batch.delete(doc.ref))
      )

  // remove all data in each testing collection
  await removeAll([ 'test_users', 'test_healthrecords' ])
    .then(batch.commit)
})

describe('Start', () => {
  // for testing, tid is assigned so token is not needed
  const emailID = 'ghWx2z4BL6Q2wkkXaSk3txGGoTC3'
  const phoneID = 'pMMAqozu55hjd7tiVX5oapUlRSw2'

  describe('Connection', () => {
    it('can connect to firebase admin', () => {
      expect(admin.instanceId).not.toBeNull()
    })

    it('can connect to FireStore', async () => {
      const result = await tryConnection()
      expect(result.length).toBeGreaterThanOrEqual(0)
    })

    it('can call try endpoint', async () => {
      const result = await post('/try')
      expect(result.body).toHaveProperty('result', 'success')
    })
  })

  describe('Users', () => {
    test('Patient Account Creation', async () => {
      const { body: result1 } = await post('/user/create', {
        tid: phoneID,
        user: {
          username: 'Leong Xian Jun',
          dob: '1999-01-16',
          gender: 'M',
          email: 'leongxianjun@gmail.com',
          type: 'Patient',
          phoneNumber: '+60165663878',
          occupation: 'Student'
        }
      })
      expect(result1).toHaveProperty('response', 'Insert successfully')

      const { body: result2 } = await post('/user/get', {
        tid: phoneID
      })
      expect(result2).toHaveProperty('username', 'Leong Xian Jun')
      expect(result2).toHaveProperty('type', 'Patient')
      expect(result2).toHaveProperty('occupation')
    })

    test('Medical Staff Account Creation', async () => {
      const { body: result1 } = await post('/user/create', {
        tid: emailID,
        user: {
          username: 'JoneLeong',
          dob: '1980-06-30',
          gender: 'F',
          email: 'joneleong@gmail.com',
          type: 'Medical Staff',
          medicalInstituition: {
            role: 'Doctor',
            name: 'UTAR Hos',
            address: '11, Jalan Bery, Kajang, Selangor',
            department: 'Emergency Department'
          }
        }
      })
      expect(result1).toHaveProperty('response', 'Insert successfully')

      const { body: result2 } = await post('/user/get', {
        tid: emailID
      })
      expect(result2).toHaveProperty('username', 'JoneLeong')
      expect(result2).toHaveProperty('type', 'Medical Staff')
      expect(result2).toHaveProperty('medicalInstituition')
    })
  })
})

export default true