import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { HealthConditionOptions } from '../../connections'

const getConditionOptions: EndPoint = {
  name: '/healthCondition/option',
  type: 'POST',
  description: 'To fetch the option of health condition',
  schema: Joi.object().keys({
    userToken: Joi.string().required()
  }),
  method: ({ }: INPUT) =>
    Promise.resolve([
      ...HealthConditionOptions
    ])
}

type INPUT = {
}

export default getConditionOptions