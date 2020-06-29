import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { MessageUtil } from '../../utils'
import { cancelApp } from '../../connections'
import { NotificationManager } from '../../Managers'

const cancelAppointments: EndPoint = {
  name: '/appointment/cancel',
  type: 'PUT',
  description: 'To cancel an appointment',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    medicalStaffId: Joi.string().required(),
    appId: Joi.string().required()
  }),
  method: ({ uid, medicalStaffId, appId }: INPUT) =>
    cancelApp(uid, appId)
      .then(response => {
        const medicalStaffDT = NotificationManager.getDeviceToken(medicalStaffId)
        if (medicalStaffDT) {
          MessageUtil.sendMessages([ { token: medicalStaffDT.deviceToken, title: 'Cancellation of Appointment', description: 'An appointment is cancelled' } ])
        }
        return response
      })
}

type INPUT = {
  uid: string
  medicalStaffId: string
  appId: string
}

export default cancelAppointments