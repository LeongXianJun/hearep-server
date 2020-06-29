import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { MessageUtil } from '../../utils'
import { AppointmentSchema } from '../../JoiSchema'
import { NotificationManager } from '../../Managers'
import { insertApp, checkCrashedAppointment, getTurn, getU, WorkingTime, TimeInterval } from "../../connections"

const insertAppointment: EndPoint = {
  name: '/appointment/insert',
  type: 'POST',
  description: 'To create a new appointment record',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    appointment: AppointmentSchema.InsertSchema
  }),
  method: ({ uid, appointment }: INPUT) =>
    // check if the timeslot is available **
    getU(appointment.medicalStaffId)
      .then(user => {
        const wts: WorkingTime = (user as any).workingTime
        if (wts === undefined) {
          throw new Error('This medical staff does not set his/her working time yet')
        } else if (wts.type === 'byTime' && appointment.type === 'byTime') {
          const t = new Date(appointment.time)
          const can = wts.timeslots.find(ts => ts.day == t.getDay())?.slots.some(s => {
            return t.getMinutes() === TimeInterval[ s ].min &&
              t.getHours() === TimeInterval[ s ].hr
          })
          if (can === true) {
            // check if the timeslot is being taken
            return checkCrashedAppointment(appointment.medicalStaffId, appointment.time)
              .then(result => {
                if (result) {
                  return insertApp(appointment.type)(uid, { ...appointment })
                    .then(response => {
                      const patientDT = NotificationManager.getDeviceToken(appointment.medicalStaffId)
                      if (patientDT) {
                        MessageUtil.sendMessages([ { token: patientDT.deviceToken, title: 'New Appointment', description: 'A new appointment is scheduled on ' + t.toString() } ])
                      }
                      return response
                    })
                } else {
                  throw new Error('Medical staff has an appointment in this timeslot')
                }
              })
          } else {
            throw new Error('This medical staff is not available in this timeslot')
          }
        } else if (wts.type === 'byNumber' && appointment.type === 'byNumber') {
          // nid to make sure the appointment is made within the working time
          const t = new Date(appointment.date)
          const slot = wts.timeslots.find(ts => ts.day == t.getDay())
          if (slot) {
            const { startTime, endTime } = slot
            const startTimestamp = startTime.getHours() * 60 + startTime.getMinutes(),
              endTimestamp = endTime.getHours() * 60 + endTime.getMinutes(),
              currentTimestamp = t.getHours() * 60 + t.getMinutes()
            if (startTimestamp <= currentTimestamp && currentTimestamp <= endTimestamp) {
              return getTurn(appointment.medicalStaffId, appointment.date)
                .then(({ turn }) => {
                  if (turn == appointment.turn)
                    return insertApp(appointment.type)(uid, { ...appointment })
                      .then(response => {
                        const medicalStaffDT = NotificationManager.getDeviceToken(appointment.medicalStaffId)
                        if (medicalStaffDT) {
                          MessageUtil.sendMessages([ { token: medicalStaffDT.deviceToken, title: 'New Appointment', description: 'A new appointment is scheduled' } ])
                        }
                        return response
                      })
                  else
                    throw new Error('This number is already taken by another patient')
                })
            } else {
              throw new Error('This medical staff does not operate during this working hour')
            }
          } else {
            throw new Error('The medical staff does not operate on this day')
          }
        } else {
          throw new Error('Type invalid: ' + appointment.type)
        }
      })
}

type INPUT = {
  uid: string
  appointment: {
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

export default insertAppointment