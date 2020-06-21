import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { getAppointment as getA } from "../../connections"

const getAppointment: EndPoint = {
  name: '/appointment/get',
  type: 'POST',
  description: 'To fetch an appointment',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    appId: Joi.string().required()
  }),
  method: ({ appId }: INPUT) =>
    getA(appId)
}

type INPUT = {
  appId: string
}

export default getAppointment