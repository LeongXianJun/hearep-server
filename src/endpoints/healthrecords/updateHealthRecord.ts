import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { HRSchema } from '../../JoiSchema'
import { updateHR, LabTestField, Medication } from "../../connections/healthrecords"

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
}

type INPUT = {
  healthRecord: {
    id: string
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