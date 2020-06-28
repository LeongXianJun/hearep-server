import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { updateDeviceToken as updateDT } from '../../connections'

const updateDeviceToken: EndPoint = {
  name: '/user/device',
  type: 'PUT',
  description: 'To update the deveice token of the user',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    deviceToken: Joi.string().required()
  }),
  method: ({ uid, deviceToken }: INPUT) =>
    updateDT(uid, deviceToken)
}

type INPUT = {
  uid: string,
  deviceToken: string
}

export default updateDeviceToken