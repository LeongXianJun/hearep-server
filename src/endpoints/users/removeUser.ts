import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { deleteU } from "../../connections/users"

const removeUserAcc: EndPoint = {
  name: '/user/delete',
  type: 'PUT',
  description: 'To remove a user record',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
  }),
  method: ({ uid }: INPUT) =>
    deleteU(uid)
}

type INPUT = {
  uid: string
}

export default removeUserAcc