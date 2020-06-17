import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { HRSchema } from '../../JoiSchema'
import { insertHR, Medication, LabTestField, updateStatus } from "../../connections"

const insertHealthRecord: EndPoint = {
  name: '/healthrecords/insert',
  type: 'POST',
  description: 'To insert a new health record',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    healthRecord: HRSchema.InsertSchema
  }),
  method: ({ uid, healthRecord }: INPUT) => {
    if (healthRecord.type === 'Medication Record')
      return insertHR(healthRecord.type)({ medicalStaffId: uid, ...healthRecord })
    else {
      return updateStatus(healthRecord.appId)(uid, { status: 'Completed' })
        .then(({ response }) => {
          if (response.includes('success'))
            return insertHR(healthRecord.type)({ medicalStaffId: uid, ...healthRecord })
          else
            throw new Error('Appointment not found')
        })
    }
  }
}

type INPUT = {
  uid: string
  healthRecord: {
    patientId: string
    date: Date
  } & (
    {
      type: 'Health Prescription'
      appId: string // appointment id
      illness: string
      clinicalOpinion: string
    } | {
      type: 'Medication Record'
      prescriptionId: string
      refillDate: Date,
      medications: Medication[]
    } | {
      type: 'Lab Test Result'
      appId: string // appointment id
      title: string
      comment: string
      data: LabTestField[]
    }
  )
}

export default insertHealthRecord