import { EndPoint } from './'
import { tryConnection } from "../connections/try"
import Joi from '@hapi/joi'

const tryFunction: EndPoint = {
  name: '/try',
  type: 'POST',
  description: 'This is to try the connection',
  schema: Joi.object().keys({
    userToken: Joi.string().required()
  }),
  method: ({ }: INPUT) =>
    new Promise((resolve, reject) => {
      tryConnection()
      resolve({ result: 'success' })
    })
}

type INPUT = {

}

export default tryFunction