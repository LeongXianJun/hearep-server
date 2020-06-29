import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { MessageUtil } from '../../utils'
import { AppointmentSchema } from '../../JoiSchema'
import { rescheduleApp, checkCrashedAppointment } from "../../connections"

const rescheduleAppointment: EndPoint = {
  name: '/appointment/reschedule',
  type: 'PUT',
  description: 'To reschedule an appointment',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    oldAppId: Joi.string().required(),
    newApp: AppointmentSchema.InsertSchema
  }),
  method: ({ uid, oldAppId, newApp }: INPUT) => {
    // nid to check if the timeslot is being taken
    if (newApp.type === 'byTime') {
      return checkCrashedAppointment(newApp.medicalStaffId, newApp.time)
        .then(result => {
          if (result) {
            Promise.resolve()
          } else {
            throw 'Medical staff has an appointment in this timeslot'
          }
        }).then(() =>
          rescheduleApp(oldAppId)(newApp.type)(uid, { ...newApp })
            .then(response => {
              const medicalStaffDT = MessageUtil.getDeviceToken(newApp.medicalStaffId)
              if (medicalStaffDT) {
                MessageUtil.sendMessages([ { token: medicalStaffDT.deviceToken, title: 'Rescheduled Appointment', description: 'A new appointment is rescheduled to ' + new Date(newApp.time).toString() } ])
              }
              return response
            })
        )
        .catch(err => { throw new Error(err) })
    } else {
      return rescheduleApp(oldAppId)(newApp.type)(uid, { ...newApp })
        .then(response => {
          const patientDT = MessageUtil.getDeviceToken(newApp.medicalStaffId)
          if (patientDT) {
            MessageUtil.sendMessages([ { token: patientDT.deviceToken, title: 'Rescheduled Appointment', description: 'A new appointment is rescheduled' } ])
          }
          return response
        })
    }
  }
}

type INPUT = {
  uid: string
  oldAppId: string
  newApp: {
    medicalStaffId: string
    date: Date
    address: string // need because the doctor may transfer to another. Some may work in multiple location
  } & (
    {
      type: 'byTime'
      time: Date
    } | {
      type: 'byNumber'
      turn: number
    }
  )
}

export default rescheduleAppointment