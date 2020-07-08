import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { MessageUtil } from '../../utils'

const updateAuthorizedUsers: EndPoint = {
  name: '/access/request',
  type: 'POST',
  description: 'To request the authorization from the patient',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    patientId: Joi.string().required(),
    isEmergency: Joi.boolean().required(),
    userIds: Joi.array().items(Joi.string().required())
  }),
  method: ({ uid, patientId, isEmergency, userIds }: INPUT) => new Promise((resolve, reject) => {
    if (isEmergency === 'true' && userIds === undefined) {
      throw new Error('This patient did not set his/her authorized user.')
    } else {
      const messages = [ ...isEmergency === 'true' ? userIds ?? [] : [ patientId ] ].reduce<{
        token: string, [ key: string ]: string
      }[]>((all, p) => {
        const patientDT = MessageUtil.getDeviceToken(p)
        if (patientDT) {
          return [
            ...all,
            { token: patientDT.deviceToken, title: 'Health Record Access Request', description: 'Health record access is requested', medicalStaffId: uid, patientId, isEmergency: String(isEmergency) }
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
    }
  })
}

type INPUT = {
  uid: string,
  patientId: string
  isEmergency: string // bool bacame string
  userIds?: string[]
}

export default updateAuthorizedUsers