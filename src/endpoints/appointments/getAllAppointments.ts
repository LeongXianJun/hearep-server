import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { getAppointmentsByMS } from "../../connections"

const getAllAppointments: EndPoint = {
  name: '/appointment/medicalstaff',
  type: 'POST',
  description: 'To fetch all of the appointment related to the medical staff',
  schema: Joi.object().keys({
    userToken: Joi.string().required()
  }),
  method: ({ uid }: INPUT) =>
    getAppointmentsByMS(uid).then(result =>
      result.reduce<{
        'Pending': FirebaseFirestore.DocumentData[],
        'Accepted': FirebaseFirestore.DocumentData[],
        'Rejected': FirebaseFirestore.DocumentData[],
        'Waiting': FirebaseFirestore.DocumentData[],
        'Completed': FirebaseFirestore.DocumentData[],
        'Cancelled': FirebaseFirestore.DocumentData[],
      }>((group, r) =>
        ({ ...group, [ r.status ]: [ ...group[ r.status as 'Pending' | 'Accepted' | 'Rejected' | 'Waiting' | 'Completed' | 'Cancelled' ], r ] })
        , {
          'Pending': [],
          'Accepted': [],
          'Rejected': [],
          'Waiting': [],
          'Completed': [],
          'Cancelled': [],
        })
    )
}

type INPUT = {
  uid: string
}

export default getAllAppointments