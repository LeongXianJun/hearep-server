import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { allHRwithin6Month, getHealthConditions as getHC } from '../../connections'

const getPatientHealthAnalysis: EndPoint = {
  name: '/analysis/patient',
  type: 'POST',
  description: 'To fetch the health condition of a patient',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    date: Joi.date().required(),
    patientId: Joi.string()
  }),
  method: ({ uid, date, patientId }: INPUT) =>
    Promise.all([
      allHRwithin6Month(patientId ?? uid, date),
      getHC(patientId ?? uid, date)
    ]).then(([ healthRecords, healthConditions ]) => ({
      hrs: healthRecords,
      hcs: healthConditions.reduce<{
        'Blood Sugar Level': typeof healthConditions,
        'Blood Pressure Level': typeof healthConditions,
        'BMI': typeof healthConditions,
      }>((all, r) =>
        ({ ...all, [ r.option ]: [ ...all[ r.option as 'Blood Sugar Level' | 'Blood Pressure Level' | 'BMI' ], r ] })
        , {
          'Blood Sugar Level': [],
          'Blood Pressure Level': [],
          'BMI': []
        })
    })).then(({ hrs, hcs }) => {
      const d = new Date(date)
      const sameDay = (date1: Date, date2: Date) =>
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()

      const sameMonth = (date1: Date, date2: Date) =>
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()

      const result1 = [ ...Array(6).keys() ].reduce<{
        'Sickness Frequency': { month: Date, count: number }[]
      }>((all, num) => {
        const currentDate = new Date(d.getFullYear(), d.getMonth() - (5 - num))
        const sicknessCases = hrs.filter(hr => sameMonth(hr.date, currentDate))
        return {
          'Sickness Frequency': [
            ...all[ 'Sickness Frequency' ],
            { month: currentDate, count: sicknessCases.length }
          ]
        }
      }, {
        'Sickness Frequency': []
      })

      const result2 = [ ...Array(7).keys() ].reduce<{
        'Blood Sugar Level': { day: Date, count: number, length: number }[],
        'Blood Pressure Level': { day: Date, count: number, length: number }[],
        'BMI': { day: Date, count: number, length: number }[],
      }>((all, num) => {
        const currentDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (6 - num))
        const BSL = hcs[ 'Blood Sugar Level' ].filter(hc => sameDay(hc.updatedOn, currentDate))
        const BPL = hcs[ 'Blood Pressure Level' ].filter(hc => sameDay(hc.updatedOn, currentDate))
        const BMI = hcs[ 'BMI' ].filter(hc => sameDay(hc.updatedOn, currentDate))
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

      return {
        ...result1,
        ...result2
      }
    })
}

type INPUT = {
  uid: string
  date: Date,
  patientId?: string
}

export default getPatientHealthAnalysis