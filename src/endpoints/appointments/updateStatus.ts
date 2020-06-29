import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { MessageUtil } from '../../utils'
import { AppointmentSchema } from '../../JoiSchema'
import { NotificationManager } from '../../Managers'
import { updateStatus as updateS } from '../../connections'

const updateStatus: EndPoint = {
  name: '/appointment/update',
  type: 'PUT',
  description: 'To update the status of an appointment',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    appointment: AppointmentSchema.UpdateSchema
  }),
  method: ({ uid, appointment: { id, ...others } }: INPUT) =>
    updateS(id)(uid, { ...others })
      .then(response => {
        const patientDT = NotificationManager.getDeviceToken(others.patientId)
        if (patientDT) {
          MessageUtil.sendMessages([ { token: patientDT.deviceToken, title: 'Health Record Update', description: 'The detail of a health record is updated' } ])
        }
        return response
      })
}

type INPUT = {
  uid: string
  appointment: {
    id: string
    patientId: string
    status: 'Accepted' | 'Rejected'
  }
}

export default updateStatus