import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { getU } from "../../connections/users"

const displayUser: EndPoint = {
  name: '/user/get',
  type: 'POST',
  description: 'To fetch the user record',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
  }),
  method: ({ uid }: INPUT) =>
    getU(uid)
}

type INPUT = {
  uid: string
}

export default displayUser