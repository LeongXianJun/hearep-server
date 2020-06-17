import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { getTurn, getU, WorkingTime } from "../../connections"

const getAppointmentTurn: EndPoint = {
  name: '/appointment/turn',
  type: 'POST',
  description: 'To the current number for byNumber appointment',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    medicalStaffId: Joi.string().required(),
    date: Joi.date().required()
  }),
  method: ({ medicalStaffId, date }: INPUT) =>
    // nid to get the working hour as well
    Promise.all([
      getU(medicalStaffId),
      getTurn(medicalStaffId, date)
    ]).then(([ medicalStaff, { turn } ]) => {
      const wts: WorkingTime = (medicalStaff as any).workingTime
      if (wts.type === 'byNumber') {
        const t = new Date(date)
        const slot = wts.timeslots.find(ts => ts.day == t.getDay())
        if (slot) {
          const { startTime, endTime } = slot
          const startTimestamp = startTime.getHours() * 60 + startTime.getMinutes(),
            endTimestamp = endTime.getHours() * 60 + endTime.getMinutes(),
            currentTimestamp = t.getHours() * 60 + t.getMinutes()
          if (startTimestamp <= currentTimestamp && currentTimestamp <= endTimestamp) {
            return { ...slot, turn }
          } else {
            throw new Error('This medical staff does not operate during this working hour')
          }
        } else {
          throw new Error('This medical staff does not operate on this day')
        }
      } else {
        throw new Error('Medical Staff does not offer this service yet')
      }
    })
}

type INPUT = {
  medicalStaffId: string
  date: Date
}

export default getAppointmentTurn