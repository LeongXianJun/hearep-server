import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { MessageUtil } from '../../utils'

const updateAuthorizedUsers: EndPoint = {
  name: '/access/respond',
  type: 'POST',
  description: 'To respond the authorization request made by the medical staff',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    medicalStaffId: Joi.string().required(),
    status: Joi.string().valid('Permitted', 'Rejected').required()
  }),
  method: ({ medicalStaffId, status }: INPUT) => new Promise((resolve, reject) => {
    const medicalStaffDT = MessageUtil.getDeviceToken(medicalStaffId)
    if (medicalStaffDT) {
      MessageUtil.sendMessages([ { token: medicalStaffDT.deviceToken, title: 'Health Record Access Request', description: 'The request is responded', status } ])
        .then(r => resolve({ response: 'Send Successfully' }))
    } else {
      reject(new Error('Device Not Found'))
    }
  })
}

type INPUT = {
  medicalStaffId: string
  status: 'Permitted' | 'Rejected'
}

export default updateAuthorizedUsers