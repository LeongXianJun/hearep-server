import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { AppointmentSchema } from '../../JoiSchema'
import { updateStatus as updateS } from "../../connections/appointments"

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
}

type INPUT = {
  uid: string
  appointment: {
    id: string
  } & (
    {
      type: 'byTime'
      status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled'
    } | {
      type: 'byNumber'
      status: 'Waiting' | 'Completed' | 'Cancelled'
    }
  )
}

export default updateStatus