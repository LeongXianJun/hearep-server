import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { allAccessLogs } from "../../connections"

/**
 * restrict to management level access only in the future implementation
 */
const getPatients: EndPoint = {
  name: '/accessLogs/all',
  type: 'POST',
  description: 'To fetch all of the access logs',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
  }),
  method: ({ }: INPUT) =>
    allAccessLogs()
}

type INPUT = {
}

export default getPatients