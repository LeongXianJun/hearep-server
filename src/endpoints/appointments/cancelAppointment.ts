import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { cancelApp } from "../../connections"

const cancelAppointments: EndPoint = {
  name: '/appointment/cancel',
  type: 'PUT',
  description: 'To cancel an appointment',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    appId: Joi.string().required()
  }),
  method: ({ uid, appId }: INPUT) =>
    cancelApp(uid, appId)
}

type INPUT = {
  uid: string
  appId: string
}

export default cancelAppointments