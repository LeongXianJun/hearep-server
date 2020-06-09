import admin from 'firebase-admin'

import db from '../src/connections'
import { get, post, put } from './supertest'
import { tryConnection } from '../src/connections/try'

// for testing, tid is assigned so token is not needed
const emailId = '7CoiMZzrXYfB41ofBE7fdiZtSYB3' // represent medical staff
const phoneId = '1XteR8apJhNFTCSseha075TCnFs2' // represent patient

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
    .then(() => batch.commit())
})

describe('Connection', () => {
  it('can connect to firebase admin', () => {
    expect(admin.instanceId).not.toBeNull()
  })

  it('can connect to FireStore', async () => {
    const result = await tryConnection()
    expect(result.length).toBeGreaterThanOrEqual(0)
  })

  it('connect to server', async () => {
    const result = await get('/')
    expect(result.body).toHaveProperty('name', 'todoman-backend')
  })

  it('can call try endpoint', async () => {
    const result = await post('/try', emailId)
    expect(result.body).toHaveProperty('result', 'success')
  })
})

// this section may affect the following part of the testing
describe('User Endpoints', () => {
  it('fetch not existing account', async () => {
    const { body: result } = await post('/user/get', emailId)
    expect(result).toHaveProperty('errors', 'No such user in the system')
  })

  it('fetch patients from empty database', async () => {
    const { body: result } = await post('/patient/all', emailId)
    expect(result).toHaveProperty('errors', 'No patient in the system yet')
  })

  it('Patient Account Creation to Account Removal', async () => {
    // Create Account via Web
    const { body: result1 } = await post('/user/create', phoneId, {
      user: {
        username: 'Leong Xian Jun',
        dob: new Date('1999-01-16'),
        gender: 'M',
        email: 'leongxianjun@gmail.com',
        type: 'Patient',
        phoneNumber: '+60165663878',
        occupation: 'Student'
      }
    })
    expect(result1).toHaveProperty('response', 'Insert successfully')

    const { body: result2 } = await post('/user/get', phoneId)
    expect(result2).toHaveProperty('username', 'Leong Xian Jun')
    expect(result2).toHaveProperty('type', 'Patient')
    expect(result2).toHaveProperty('occupation')
  })

  it('Medical Staff Account Creation', async () => {
    const { body: result1 } = await post('/user/create', emailId, {
      user: {
        username: 'JoneLeong',
        dob: new Date('1980-06-30'),
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

    const { body: result2 } = await post('/user/get', emailId)
    expect(result2).toHaveProperty('username', 'JoneLeong')
    expect(result2).toHaveProperty('type', 'Medical Staff')
    expect(result2).toHaveProperty('medicalInstituition')


    // Update Profile
    const newName = 'Mendy'
    const { body: result3 } = await put('/user/update', emailId, {
      user: {
        username: newName,
        dob: new Date('1999-01-16'),
        type: 'Medical Staff',
        medicalInstituition: {
          name: undefined,
          department: 'IT'
        }
      }
    })
    expect(result3).toHaveProperty('response', 'Update successfully')

    const { body: result4 } = await post('/user/get', emailId)
    expect(result4).toHaveProperty('username', newName)

    // Remove the account
    const { body: result5 } = await put('/user/delete', emailId)
    expect(result5).toHaveProperty('response', 'Delete successfully')

    const { body: result6 } = await post('/user/get', emailId)
    expect(result6).toHaveProperty('errors', 'This account is removed.')
  })

  it('get all of Patient Accounts', async () => {
    const { body: result } = await post('/patient/all', emailId)
    expect(result).toHaveLength(1)
  })

  it('remove the last patient account', async () => {
    const { body: result1 } = await put('/user/delete', phoneId)
    expect(result1).toHaveProperty('response', 'Delete successfully')

    const { body: result2 } = await post('/patient/all', emailId)
    expect(result2).toHaveProperty('errors', 'No more patient in the system yet')
  })
})

describe.only('Health Record', () => {
  it('from insertion to deletion', async () => {
    // insert a record
    const { body: result1 } = await post('/healthrecords/insert', emailId, {
      healthRecord: {
        patientId: phoneId,
        date: new Date('1999-01-16'),
        type: 'Health Prescription',
        appId: '123',
        illness: 'Coding non stop',
        clinicalOpinion: 'Take more rest and have a balance diet'
      }
    })
    expect(result1).toHaveProperty('response', 'Insert successfully')

    const { body: result2 } = await post('/healthrecords/medicalstaff', emailId, {
      patientId: phoneId
    })
    expect(result2).toHaveProperty('Health Prescription')
    expect(result2[ 'Health Prescription' ]).toHaveLength(1)
    expect(result2[ 'Health Prescription' ][ 0 ]).toHaveProperty('medicalStaffId', emailId)

    const { body: result3 } = await post('/healthrecords/patient', phoneId)
    expect(result3[ 'Health Prescription' ]).toHaveLength(1)
    expect(result3[ 'Health Prescription' ][ 0 ]).toHaveProperty('patientId', phoneId)

    // update the record
    const { id: hpid, type, clinicalOpinion } = result2[ 'Health Prescription' ][ 0 ]
    const { body: result4 } = await put('/healthrecords/update', emailId, {
      healthRecord: {
        id: hpid, type,
        clinicalOpinion: clinicalOpinion + '\nDrink more water'
      }
    })
    expect(result4).toHaveProperty('response', 'Update successfully')

    const { body: result5 } = await post('/healthrecords/medicalstaff', emailId, {
      patientId: phoneId
    })
    expect(result5).toHaveProperty('Health Prescription')
    expect(result5[ 'Health Prescription' ]).toHaveLength(1)
    expect(result5[ 'Health Prescription' ][ 0 ]).toHaveProperty('clinicalOpinion', 'Take more rest and have a balance diet\nDrink more water')

    // add new medication record
    const { body: result6 } = await post('/healthrecords/insert', emailId, {
      healthRecord: {
        patientId: phoneId,
        date: new Date(),
        type: 'Medication Record',
        prescriptionId: hpid,
        refillDate: new Date('2020-05-28'),
        medications: [
          {
            medicine: 'Penicillin',
            dosage: 10,
            usage: '1 every 6 hours after meal is taken',
          }
        ]
      }
    })
    expect(result6).toHaveProperty('response', 'Insert successfully')

    const { body: result7 } = await post('/healthrecords/medicalstaff', emailId, {
      patientId: phoneId
    })
    expect(result7).toHaveProperty('Health Prescription')
    expect(result7[ 'Health Prescription' ]).toHaveLength(1)
    expect(result7[ 'Health Prescription' ][ 0 ]).toHaveProperty('medicationRecords')
    expect(result7[ 'Health Prescription' ][ 0 ][ 'medicationRecords' ]).toHaveLength(1)
    expect(result7[ 'Health Prescription' ][ 0 ][ 'medicationRecords' ][ 0 ][ 'medications' ]).toEqual([
      {
        medicine: 'Penicillin',
        dosage: '10',
        usage: '1 every 6 hours after meal is taken',
      }
    ])

    // remove the record
    const { body: result8 } = await put('/healthrecords/delete', emailId, {
      id: hpid
    })
    expect(result8).toHaveProperty('response', 'Delete successfully')

    const { body: result9 } = await post('/healthrecords/medicalstaff', emailId, {
      patientId: phoneId
    })
    expect(result9).toHaveProperty('errors', 'No more record in the system yet')
  })

  it('insert lab test', async () => {
    const { body: result1 } = await post('/healthrecords/insert', emailId, {
      healthRecord: {
        patientId: phoneId,
        date: new Date(),
        type: 'Lab Test Result',
        appId: 'abc123',
        title: 'Blood Test',
        comment: 'Quite Healthy',
        data: [
          {
            field: 'Blood Pressure',
            value: '28',
            normalRange: '25 - 36'
          }
        ]
      }
    })
    expect(result1).toHaveProperty('response', 'Insert successfully')

    const { body: result2 } = await post('/healthrecords/medicalstaff', emailId, {
      patientId: phoneId
    })
    expect(result2).toHaveProperty('Health Prescription')
    expect(result2).toHaveProperty('Lab Test Result')

    expect(result2[ 'Health Prescription' ]).toHaveLength(0)
    expect(result2[ 'Lab Test Result' ]).toHaveLength(1)

    const LT = result2[ 'Lab Test Result' ][ 0 ]
    expect(LT).toHaveProperty('title', 'Blood Test')
    expect(LT).toHaveProperty('data')

    const { body: result3 } = await post('/healthrecords/patient', phoneId)
    expect(result3).toHaveProperty('Health Prescription')
    expect(result3).toHaveProperty('Lab Test Result')

    expect(result3[ 'Health Prescription' ]).toHaveLength(0)
    expect(result3[ 'Lab Test Result' ]).toHaveLength(1)

    const LTPatient = result3[ 'Lab Test Result' ][ 0 ]
    expect(LTPatient).toHaveProperty('title', 'Blood Test')
    expect(LTPatient).toHaveProperty('data')
  })
})

export default true