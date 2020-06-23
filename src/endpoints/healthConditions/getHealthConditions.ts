import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { getHealthConditions as getHC } from '../../connections'

const getHealthConditions: EndPoint = {
  name: '/healthCondition/get',
  type: 'POST',
  description: 'To fetch the health condition of a patient',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    date: Joi.date().required(),
    patientId: Joi.string()
  }),
  method: ({ uid, date, patientId }: INPUT) =>
    getHC(patientId ?? uid, date)
      .then(result =>
        result.reduce<{
          'Blood Sugar Level': typeof result,
          'Blood Pressure Level': typeof result,
          'BMI': typeof result,
        }>((all, r) =>
          ({ ...all, [ r.option ]: [ ...all[ r.option as 'Blood Sugar Level' | 'Blood Pressure Level' | 'BMI' ], r ] })
          , {
            'Blood Sugar Level': [],
            'Blood Pressure Level': [],
            'BMI': []
          })
      ).then(arranged => {
        const d = new Date(date)
        const sameDay = (date1: Date, date2: Date) =>
          date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear()
        return [ ...Array(7).keys() ].reduce<{
          'Blood Sugar Level': { day: Date, count: number, length: number }[],
          'Blood Pressure Level': { day: Date, count: number, length: number }[],
          'BMI': { day: Date, count: number, length: number }[],
        }>((all, num) => {
          const currentDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (6 - num))
          const BSL = arranged[ 'Blood Sugar Level' ].filter(hc => sameDay(hc.updatedOn, currentDate))
          const BPL = arranged[ 'Blood Pressure Level' ].filter(hc => sameDay(hc.updatedOn, currentDate))
          const BMI = arranged[ 'BMI' ].filter(hc => sameDay(hc.updatedOn, currentDate))
          return {
            'Blood Sugar Level': [
              ...all[ 'Blood Sugar Level' ],
              { day: currentDate, count: BSL.reduce((total, bsl) => total + bsl.value, 0), length: BSL.length }
            ],
            'Blood Pressure Level': [
              ...all[ 'Blood Pressure Level' ],
              { day: currentDate, count: BPL.reduce((total, bsl) => total + bsl.value, 0), length: BPL.length }
            ],
            'BMI': [
              ...all[ 'BMI' ],
              { day: currentDate, count: BMI.reduce((total, bsl) => total + bsl.value, 0), length: BMI.length }
            ]
          }
        }, {
          'Blood Sugar Level': [],
          'Blood Pressure Level': [],
          'BMI': []
        })
      })
}

type INPUT = {
  uid: string
  date: Date,
  patientId?: string
}

export default getHealthConditions