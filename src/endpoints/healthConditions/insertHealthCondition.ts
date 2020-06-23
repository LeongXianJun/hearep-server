import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { HealthConditionSchema } from '../../JoiSchema'
import { updateHealthConditions, HealthCondition } from '../../connections'

const getConditionOptions: EndPoint = {
  name: '/healthCondition/update',
  type: 'POST',
  description: 'To update health condition of the patient',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    healthCondition: HealthConditionSchema.Schema
  }),
  method: ({ uid, healthCondition }: INPUT) =>
    updateHealthConditions(uid, healthCondition)
}

type INPUT = {
  uid: string
  healthCondition: HealthCondition
}

export default getConditionOptions