import Joi from '@hapi/joi'
import { EndPoint } from '../..'
import { TimeInterval } from '../../../connections'

const getTimeInterval: EndPoint = {
  name: '/workingtime/timeinterval',
  type: 'POST',
  description: 'To the time interval for workingtime update',
  schema: Joi.object().keys({
    userToken: Joi.string().required()
  }),
  method: ({ }: INPUT) =>
    Promise.resolve([
      ...TimeInterval.map(({ hr, min }) => new Date(0, 0, 0, hr, min))
    ])
}

type INPUT = {
}

export default getTimeInterval