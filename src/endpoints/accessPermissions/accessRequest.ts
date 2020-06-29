import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { MessageUtil } from '../../utils'

const updateAuthorizedUsers: EndPoint = {
  name: '/access/request',
  type: 'POST',
  description: 'To request the authorization from the patient',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    patientIds: Joi.array().items(Joi.string().required()).required()
  }),
  method: ({ uid, patientIds }: INPUT) => new Promise((resolve, reject) => {
    const messages = patientIds.reduce<{
      token: string, [ key: string ]: string
    }[]>((all, p) => {
      const patientDT = MessageUtil.getDeviceToken(p)
      if (patientDT) {
        return [
          ...all,
          { token: patientDT.deviceToken, title: 'Health Record Access Request', description: 'Health record access is requested', medicalStaffId: uid }
        ]
      } else {
        return all
      }
    }, [])
    if (messages.length > 0) {
      MessageUtil.sendMessages(messages)
        .then(r => resolve({ response: 'Send Successfully' }))
    } else {
      reject(new Error('Device Not Found'))
    }
  })
}

type INPUT = {
  uid: string,
  patientIds: string[]
}

export default updateAuthorizedUsers