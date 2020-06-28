import admin from 'firebase-admin'

import { db } from '../src/connections'
import { get, post, put } from './supertest'
import { tryConnection } from '../src/connections/try'

// for testing, tid is assigned so token is not needed
const emailId = '7CoiMZzrXYfB41ofBE7fdiZtSYB3' // represent medical staff
const phoneId = '1XteR8apJhNFTCSseha075TCnFs2' // represent patient

const today = new Date(2020, 5, 10)

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
        allC.reduce<FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]>((a, col) => [ ...a, ...col.docs ], [])
          .forEach(doc => batch.delete(doc.ref))
      )

  /** 
   * remove all data in each testing collection
   */
  await removeAll([ 'test_users', 'test_healthrecords', 'test_appointments', 'test_accesslogs', 'test_healthConditions' ])
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
describe('User', () => {
  it('fetch not existing account', async () => {
    const { body: result } = await post('/user/get', emailId)
    expect(result).toHaveProperty('errors', 'No such user in the system')
  })

  it('fetch patients from empty database', async () => {
    const { body: result } = await post('/patient/all', emailId)
    expect(result).toHaveProperty('errors', 'No patient in the system yet')
  })

  it('Patient Account Creation', async () => {
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

  it('Medical Staff Account Creation and Update', async () => {
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

    // update device token
    const deviceToken = 'Mendy'
    const { body: result4 } = await put('/user/device', emailId, { deviceToken })
    expect(result4).toHaveProperty('response', 'Update successfully')

    const { body: result5 } = await post('/user/get', emailId)
    expect(result5).toHaveProperty('username', newName)
    expect(result5).toHaveProperty('deviceToken', deviceToken)
  })

  it('get all of Patient Accounts', async () => {
    const { body: result } = await post('/patient/all', emailId)
    expect(result).toHaveLength(1)
  })
})

describe('Health Record', () => {
  it('from insertion to deletion', async () => {
    // insert a record
    const { body: result1 } = await post('/healthrecords/insert', emailId, {
      healthRecord: {
        patientId: phoneId,
        date: new Date('1999-01-16'),
        type: 'Health Prescription',
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
        date: today,
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
        dosage: 10,
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
  }, 10000)

  it('insert lab test', async () => {
    const { body: result1 } = await post('/healthrecords/insert', emailId, {
      healthRecord: {
        patientId: phoneId,
        date: today,
        type: 'Lab Test Result',
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

describe('Appointment (byTime)', () => {
  it('Schedule an appointment with medical staff who has not set working time', async () => {
    const { body: result1 } = await post('/appointment/insert', phoneId, {
      appointment: {
        medicalStaffId: emailId,
        date: today,
        address: '666, Jalan UTAR, UTAR, Malaysia',
        type: 'byTime',
        time: new Date(2020, 6, 15, 13)
      }
    })
    expect(result1).toHaveProperty('errors', 'This medical staff does not set his/her working time yet')
  })

  // have to run with the users test case
  it('Update Working Time', async () => {
    const { body: result1 } = await post('/workingTime/timeinterval', emailId)
    expect(result1).toHaveLength(10)

    const { body: result2 } = await put('/workingTime/update', emailId, {
      workingTime: {
        type: 'byTime',
        timeslots: [
          { day: 1, slots: [ 1, 2, 3, 4, 5, 6, 7 ] },
          { day: 2, slots: [ 1, 2, 3, 4, 5, 6, 7 ] },
          { day: 3, slots: [ 5, 6, 7, 8, 9 ] },
          { day: 4, slots: [ 1, 2, 3, 4, 5, 6, 7 ] },
          { day: 5, slots: [ 1, 2, 3, 4, 5, 6, 7 ] },
          { day: 6, slots: [ 1, 2, 3, 4, 5 ] }
        ]
      }
    })
    expect(result2).toHaveProperty('response', 'Update successfully')

    // check available timeslot
    const { body: result3 } = await post('/workingTime/get', phoneId, {
      medicalStaffId: emailId,
      date: new Date(2020, 6, 14)
    })
    expect(result3).toHaveLength(6)
  })

  it('Schedule an appointment with a not available timeslot', async () => {
    const { body: result1 } = await post('/appointment/insert', phoneId, {
      appointment: {
        medicalStaffId: emailId,
        date: today,
        address: '666, Jalan UTAR, UTAR, Malaysia',
        type: 'byTime',
        time: new Date(2020, 6, 15, 10)
      }
    })
    expect(result1).toHaveProperty('errors', 'This medical staff is not available in this timeslot')
  })

  it('Complete Appointment Lifecycle (byTime)', async () => {
    // 1. Patient create an appointment
    const { body: result1 } = await post('/appointment/insert', phoneId, {
      appointment: {
        medicalStaffId: emailId,
        date: today,
        address: '666, Jalan UTAR, UTAR, Malaysia',
        type: 'byTime',
        time: new Date(2020, 6, 15, 13)
      }
    })
    expect(result1).toHaveProperty('response', 'Insert successfully')

    // 2. Patient check the appointment list
    const { body: result2 } = await post('/appointment/patient', phoneId)
    expect(result2).toHaveProperty('Pending')
    expect(result2).toHaveProperty('Accepted')
    expect(result2).toHaveProperty('Rejected')
    expect(result2).toHaveProperty('Waiting')
    expect(result2).toHaveProperty('Completed')
    expect(result2).toHaveProperty('Cancelled')

    expect(result2[ 'Pending' ]).toHaveLength(1)
    expect(result2[ 'Accepted' ]).toHaveLength(0)
    expect(result2[ 'Rejected' ]).toHaveLength(0)
    expect(result2[ 'Waiting' ]).toHaveLength(0)
    expect(result2[ 'Completed' ]).toHaveLength(0)
    expect(result2[ 'Cancelled' ]).toHaveLength(0)

    const app = result2[ 'Pending' ][ 0 ]
    expect(app).toHaveProperty('status', 'Pending')
    expect(app).toHaveProperty('time', '2020-07-15T05:00:00.000Z')

    // 3. Medical Staff update the status of the appointment to 'Accepted'
    const { body: result3 } = await put('/appointment/update', emailId, {
      appointment: {
        id: app.id,
        status: 'Accepted'
      }
    })
    expect(result3).toHaveProperty('response', 'Update successfully')

    // 4. Patient check the updated appointment
    const { body: result4 } = await post('/appointment/patient', phoneId)
    expect(result4).toHaveProperty('Pending')
    expect(result4).toHaveProperty('Accepted')
    expect(result4).toHaveProperty('Rejected')
    expect(result4).toHaveProperty('Waiting')
    expect(result4).toHaveProperty('Completed')
    expect(result4).toHaveProperty('Cancelled')

    expect(result4[ 'Pending' ]).toHaveLength(0)
    expect(result4[ 'Accepted' ]).toHaveLength(1)
    expect(result4[ 'Rejected' ]).toHaveLength(0)
    expect(result4[ 'Waiting' ]).toHaveLength(0)
    expect(result4[ 'Completed' ]).toHaveLength(0)
    expect(result4[ 'Cancelled' ]).toHaveLength(0)

    const updatedApp = result4[ 'Accepted' ][ 0 ]
    expect(updatedApp).toHaveProperty('status', 'Accepted')

    // 5. Patient reschedule the appointment
    const { body: result5 } = await put('/appointment/reschedule', phoneId, {
      oldAppId: updatedApp.id,
      newApp: {
        medicalStaffId: updatedApp.medicalStaffId,
        date: today,
        address: updatedApp.address,
        type: 'byTime',
        time: new Date(2020, 6, 15, 14)
      }
    })
    expect(result5).toHaveProperty('response', 'Reschedule successfully')

    // 6. Medical Staff check the appointment list
    const { body: result6 } = await post('/appointment/medicalstaff', emailId)
    expect(result6).toHaveProperty('Pending')
    expect(result6).toHaveProperty('Accepted')
    expect(result6).toHaveProperty('Rejected')
    expect(result6).toHaveProperty('Waiting')
    expect(result6).toHaveProperty('Completed')
    expect(result6).toHaveProperty('Cancelled')

    expect(result6[ 'Pending' ]).toHaveLength(1)
    expect(result6[ 'Accepted' ]).toHaveLength(0)
    expect(result6[ 'Rejected' ]).toHaveLength(0)
    expect(result6[ 'Waiting' ]).toHaveLength(0)
    expect(result6[ 'Completed' ]).toHaveLength(0)
    expect(result6[ 'Cancelled' ]).toHaveLength(0)

    const rescheduleApp = result6[ 'Pending' ][ 0 ]
    expect(rescheduleApp).toHaveProperty('status', 'Pending')

    // 7. Medical staff update the status again to 'Accepted'
    const { body: result7 } = await put('/appointment/update', emailId, {
      appointment: {
        id: rescheduleApp.id,
        status: 'Accepted'
      }
    })
    expect(result7).toHaveProperty('response', 'Update successfully')

    // 8. After consultation, medical staff insert a health prescription (this will auto update the status of the appointment)
    const { body: result8 } = await post('/healthrecords/insert', emailId, {
      healthRecord: {
        patientId: phoneId,
        date: today,
        type: 'Health Prescription',
        appId: rescheduleApp.id,
        illness: 'Coding non stop',
        clinicalOpinion: 'Take more rest and have a balance diet'
      }
    })
    expect(result8).toHaveProperty('response', 'Insert successfully')

    // 9. Patient check the health prescription
    const { body: result9 } = await post('/healthrecords/patient', phoneId)
    expect(result9[ 'Health Prescription' ]).toHaveLength(1)
    const hp = result9[ 'Health Prescription' ][ 0 ]
    expect(hp).toHaveProperty('appId', rescheduleApp.id)

    const { body: result10 } = await post('/appointment/get', emailId, {
      appId: hp.appId
    })
    expect(result10).toHaveProperty('id', rescheduleApp.id)
  }, 10000)

  it('Schedule an overlapped Appointment', async () => {
    const { body: result1 } = await post('/appointment/insert', phoneId, {
      appointment: {
        medicalStaffId: emailId,
        date: today,
        address: '666, Jalan UTAR, UTAR, Malaysia',
        type: 'byTime',
        time: new Date(2020, 6, 15, 14)
      }
    })
    expect(result1).toHaveProperty('errors', 'Medical staff has an appointment in this timeslot')
  })
})

describe('Appointment (byNumber)', () => {
  it('Get Turn (without setting the correct working time)', async () => {
    const { body: result1 } = await post('/appointment/turn', phoneId, {
      medicalStaffId: emailId,
      date: new Date(2020, 4, 15, 9) // Friday
    })
    expect(result1).toHaveProperty('errors', 'Medical Staff does not offer this service yet')
  })

  it('Appointment Insert - Remove (byNumber)', async () => {
    // Today = 2020-05-16
    // 1. Medical Staff update the working time
    const { body: result1 } = await put('/workingTime/update', emailId, {
      workingTime: {
        type: 'byNumber',
        timeslots: [
          { day: 1, startTime: new Date(0, 0, 0, 10), endTime: new Date(0, 0, 0, 17, 30) },
          { day: 2, startTime: new Date(0, 0, 0, 10), endTime: new Date(0, 0, 0, 17, 30) },
          { day: 3, startTime: new Date(0, 0, 0, 10), endTime: new Date(0, 0, 0, 17, 30) },
          { day: 4, startTime: new Date(0, 0, 0, 8, 30), endTime: new Date(0, 0, 0, 12) },
          { day: 5, startTime: new Date(0, 0, 0, 8, 30), endTime: new Date(0, 0, 0, 12) }
        ]
      }
    })
    expect(result1).toHaveProperty('response', 'Update successfully')

    // 2. Fetch the current number of turn
    const { body: result2 } = await post('/appointment/turn', phoneId, {
      medicalStaffId: emailId,
      date: new Date(2020, 4, 15, 9) // Friday
    })
    expect(result2).toHaveProperty('startTime')
    expect(result2).toHaveProperty('endTime')

    const startTime = new Date(result2[ 'startTime' ]),
      endTime = new Date(result2[ 'endTime' ])
    expect(startTime.getHours()).toEqual(8)
    expect(startTime.getMinutes()).toEqual(30)
    expect(endTime.getHours()).toEqual(12)
    expect(result2).toHaveProperty('turn', 0)
    const turn = result2[ 'turn' ]

    // 3. Patient create an appointment
    const { body: result3 } = await post('/appointment/insert', phoneId, {
      appointment: {
        medicalStaffId: emailId,
        date: new Date(2020, 4, 15, 9),
        address: '666, Jalan UTAR, UTAR, Malaysia',
        type: 'byNumber',
        turn: turn
      }
    })
    expect(result3).toHaveProperty('response', 'Insert successfully')

    // 4. Patient check the appointment list
    const { body: result4 } = await post('/appointment/patient', phoneId)
    expect(result4).toHaveProperty('Pending')
    expect(result4).toHaveProperty('Accepted')
    expect(result4).toHaveProperty('Rejected')
    expect(result4).toHaveProperty('Waiting')
    expect(result4).toHaveProperty('Completed')
    expect(result4).toHaveProperty('Cancelled')

    expect(result4[ 'Pending' ]).toHaveLength(0)
    expect(result4[ 'Accepted' ]).toHaveLength(0)
    expect(result4[ 'Rejected' ]).toHaveLength(0)
    expect(result4[ 'Waiting' ]).toHaveLength(1)
    expect(result4[ 'Completed' ]).toHaveLength(1)
    expect(result4[ 'Cancelled' ]).toHaveLength(0)

    const app = result4[ 'Waiting' ][ 0 ]
    expect(app).toHaveProperty('status', 'Waiting')
    expect(parseInt(app[ 'turn' ])).toEqual(turn)

    // 5. Patient cancel the appointment
    const { body: result5 } = await put('/appointment/cancel', phoneId, {
      appId: app.id
    })
    expect(result5).toHaveProperty('response', 'Cancel successfully')

    // 6. Medical Staff check the appointment list
    const { body: result6 } = await post('/appointment/medicalstaff', emailId)
    expect(result6).toHaveProperty('Pending')
    expect(result6).toHaveProperty('Accepted')
    expect(result6).toHaveProperty('Rejected')
    expect(result6).toHaveProperty('Waiting')
    expect(result6).toHaveProperty('Completed')
    expect(result6).toHaveProperty('Cancelled')

    expect(result6[ 'Pending' ]).toHaveLength(0)
    expect(result6[ 'Accepted' ]).toHaveLength(0)
    expect(result6[ 'Rejected' ]).toHaveLength(0)
    expect(result6[ 'Waiting' ]).toHaveLength(0)
    expect(result6[ 'Completed' ]).toHaveLength(1)
    expect(result6[ 'Cancelled' ]).toHaveLength(1)
  })

  it('Get Turn', async () => {
    const { body: result1 } = await post('/appointment/turn', phoneId, {
      medicalStaffId: emailId,
      date: new Date(2020, 4, 15, 9)
    })
    expect(result1).toHaveProperty('turn', 1)
  })

  it('Schedule appointment outside operating hour', async () => {
    const { body: result1 } = await post('/appointment/turn', phoneId, {
      medicalStaffId: emailId,
      date: new Date(2020, 4, 15, 17)
    })
    expect(result1).toHaveProperty('errors', 'This medical staff does not operate during this working hour')

    const { body: result2 } = await post('/appointment/insert', phoneId, {
      appointment: {
        medicalStaffId: emailId,
        date: new Date(2020, 4, 15, 17),
        address: '666, Jalan UTAR, UTAR, Malaysia',
        type: 'byNumber',
        turn: 1
      }
    })
    expect(result2).toHaveProperty('errors', 'This medical staff does not operate during this working hour')
  })

  it('Schedule appointment during medical staff off day', async () => {
    const { body: result1 } = await post('/appointment/turn', phoneId, {
      medicalStaffId: emailId,
      date: new Date(2020, 4, 16, 11)
    })
    expect(result1).toHaveProperty('errors', 'This medical staff does not operate on this day')

    const { body: result2 } = await post('/appointment/insert', phoneId, {
      appointment: {
        medicalStaffId: emailId,
        date: new Date(2020, 4, 16, 11),
        address: '666, Jalan UTAR, UTAR, Malaysia',
        type: 'byNumber',
        turn: 1
      }
    })
    expect(result2).toHaveProperty('errors', 'The medical staff does not operate on this day')
  })
})

describe('User cont.2', () => {
  it('Medical Staff Account Removal', async () => {
    // Remove the account
    const { body: result1 } = await put('/user/delete', emailId)
    expect(result1).toHaveProperty('response', 'Delete successfully')

    const { body: result2 } = await post('/user/get', emailId)
    expect(result2).toHaveProperty('errors', 'This account is removed.')
  })

  it('remove the last patient account', async () => {
    const { body: result1 } = await put('/user/delete', phoneId)
    expect(result1).toHaveProperty('response', 'Delete successfully')

    const { body: result2 } = await post('/patient/all', emailId)
    expect(result2).toHaveProperty('errors', 'No more patient in the system yet')
  })
})

describe('Health Condition', () => {
  it('Update Health Condition', async () => {
    const { body: result1 } = await post('/healthCondition/option', phoneId)
    expect(result1).toEqual([ 'Blood Sugar Level', 'Blood Pressure Level', 'BMI' ])

    const { body: result2 } = await post('/healthCondition/update', phoneId, {
      healthCondition: {
        date: today,
        option: result1[ 0 ],
        value: 100
      }
    })
    expect(result2).toHaveProperty('response', 'Insert successfully')

    const { body: result3 } = await post('/analysis/patient', phoneId, {
      date: today
    })
    expect(result3).toHaveProperty('Sickness Frequency')
    expect(result3[ 'Sickness Frequency' ]).toHaveLength(6)
    expect(result3).toHaveProperty('Blood Sugar Level')
    expect(result3[ 'Blood Sugar Level' ]).toHaveLength(7)
    expect(result3).toHaveProperty('Blood Pressure Level')
    expect(result3[ 'Blood Pressure Level' ]).toHaveLength(7)
    expect(result3).toHaveProperty('BMI')
    expect(result3[ 'BMI' ]).toHaveLength(7)
  })
})

describe('Performance Analysis', () => {
  it('fetch performance analysis', async () => {
    const { body: result1 } = await post('/analysis/get', emailId, {
      date: today
    })
    expect(result1).toHaveProperty('NewApp')
    expect(result1).toHaveProperty('HandledApp')
    expect(result1).toHaveProperty('AverageWaitingTime')
  })
})

describe('Access Log', () => {
  it('check access logs', async () => {
    const { body: result1 } = await post('/accessLogs/all', emailId)
    expect(result1).toHaveLength(5)

    const arr = result1 as Array<any>
    arr.forEach(r => {
      expect(r).toHaveProperty('target', phoneId)
      expect(r).toHaveProperty('viewedBy', emailId)
    })
  })
})

export default true