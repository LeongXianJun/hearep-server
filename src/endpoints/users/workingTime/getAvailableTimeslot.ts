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
          day: new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + i),
          slots: wts.timeslots.find(slot => slot.day == i)?.slots.map(s => {
            const t = TimeInterval[ s ]
            return new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + i, t.hr, t.min)
          })
        }))
        .reduce<{
          day: Date,
          slots: Date[]
        }[]>((arr, wt) => {
          if (wt.slots) {
            return [ ...arr, {
              ...wt, slots: [ ...wt.slots.filter(s => {
                return occupiedSlots.every(at => {
                  const t = at.time as Date
                  return t.getMinutes() !== s.getMinutes() &&
                    t.getHours() !== s.getHours() &&
                    t.getDate() !== s.getDate() &&
                    t.getMonth() !== s.getMonth() &&
                    t.getFullYear() !== s.getFullYear()
                })
              }) ]
            } ]
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