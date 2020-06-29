import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { updateAuthorizedUsers as updateAU } from "../../connections"

const updateAuthorizedUsers: EndPoint = {
  name: '/user/authorized/update',
  type: 'PUT',
  description: 'To update the authorized users list of a patient',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    userIds: Joi.array().items(Joi.string().required()).required()
  }),
  method: ({ uid, userIds }: INPUT) =>
    updateAU(uid, userIds)
}

type INPUT = {
  uid: string,
  userIds: string[]
}

export default updateAuthorizedUsers