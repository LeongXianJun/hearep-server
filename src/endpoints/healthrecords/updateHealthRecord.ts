import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { MessageUtil } from '../../utils'
import { HRSchema } from '../../JoiSchema'
import { updateHR, LabTestField, Medication } from "../../connections"

/**
 * If there is a new medication record, it will insert a new one, 
 * else if the existing has changes in the medications, the old record will be sent here too
 */
const updateHealthRecord: EndPoint = {
  name: '/healthrecords/update',
  type: 'PUT',
  description: 'To update a health record',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    healthRecord: HRSchema.UpdateSchema
  }),
  method: ({ healthRecord: { id, ...hr } }: INPUT) =>
    updateHR(id)({ ...hr })
      .then(response => {
        const patientDT = MessageUtil.getDeviceToken(hr.patientId)
        if (patientDT) {
          MessageUtil.sendMessages([ { token: patientDT.deviceToken, title: 'Health Record Update', description: 'The detaul of a health record is updated' } ])
        }
        return response
      })
}

type INPUT = {
  healthRecord: {
    id: string
    patientId: string
    illness?: string
    clinicalOpinion?: string
    refillDate?: Date,
    medications?: Medication[]
    title?: string
    comment?: string
    data?: LabTestField[]
  }
}

export default updateHealthRecord