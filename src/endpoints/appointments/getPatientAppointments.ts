import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { getAppointmentsByP } from "../../connections"

const getPatientAppointments: EndPoint = {
  name: '/appointment/patient',
  type: 'POST',
  description: 'To fetch all of the patient\'s appointment',
  schema: Joi.object().keys({
    userToken: Joi.string().required()
  }),
  method: ({ uid }: INPUT) =>
    getAppointmentsByP(uid).then(result =>
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

export default getPatientAppointments