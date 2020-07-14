import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { MessageUtil } from '../../utils'
import { removeDeviceToken as removeDT } from '../../connections'

const removeDeviceToken: EndPoint = {
  name: '/user/device/remove',
  type: 'PUT',
  description: 'To remove the device token of the user',
  schema: Joi.object().keys({
    userToken: Joi.string().required()
  }),
  method: ({ uid }: INPUT) =>
    removeDT(uid)
      .then(response => {
        MessageUtil.removeToken(uid)
        return response
      })
}

type INPUT = {
  uid: string
}

export default removeDeviceToken