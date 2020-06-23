import Joi from '@hapi/joi'
import { EndPoint } from '../..'
import { getU, getOccupiedSlots, WorkingTime, TimeInterval } from '../../../connections'

/**
 * day --> represent the current day
 * slots: Date[]
 */
const getAvailableTimeslot: EndPoint = {
  name: '/workingTime/get',
  type: 'POST',
  description: 'To retrieve (1 week) available timeslot of a medical staff by a patient',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    medicalStaffId: Joi.string().required(),
    date: Joi.date().required()
  }),
  method: ({ medicalStaffId, date }: INPUT) => Promise.all([
    getU(medicalStaffId),
    getOccupiedSlots(medicalStaffId, date)
  ]).then(([ user, occupiedSlots ]) => {
    const wts: WorkingTime = (user as any).workingTime
    if (wts.type === 'byTime') {
      const today = new Date(date)
      return [ ...Array(7).keys() ]
        .map(i => ({
          day: new Date(today.getFullYear(), today.getMonth(), today.getDate() + i),
          slots: wts.timeslots.find(slot => slot.day == (today.getDay() + i) % 7)?.slots.reduce<Date[]>((all, s) => {
            const t = TimeInterval[ s ]
            const slot = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i, t.hr, t.min)

            if (slot.getTime() > today.getTime())
              return [ ...all, slot ]
            else
              return all
          }, [])
        }))
        .reduce<{
          day: Date,
          slots: Date[]
        }[]>((arr, wt) => {
          if (wt.slots) {
            return [ ...arr, {
              ...wt, slots: [ ...wt.slots.filter(s =>
                occupiedSlots.every(at => (at.time as Date).getTime() - s.getTime() !== 0)
              ) ]
            } ].filter(wt => wt.slots.length > 0)
          } else {
            return [ ...arr ]
          }
        }, [])
    } else {
      throw new Error('By Number Working Time does not have slots')
    }
  }).catch(err => { throw new Error(err.message) })
}

type INPUT = {
  medicalStaffId: string,
  date: Date
}

export default getAvailableTimeslot