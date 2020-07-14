import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { removeAuthorizedUsers as removeAU } from "../../connections"

const removeAuthorizedUsers: EndPoint = {
  name: '/user/authorized/remove',
  type: 'PUT',
  description: 'To remove the authorized users from the list of the patient',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    userIds: Joi.array().items(Joi.string().required()).required()
  }),
  method: ({ uid, userIds }: INPUT) =>
    removeAU(uid, userIds)
}

type INPUT = {
  uid: string
  userIds: string[]
}

export default removeAuthorizedUsers