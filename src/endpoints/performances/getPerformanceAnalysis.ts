import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { performance } from "../../connections"

const getPerformanceAnalysis: EndPoint = {
  name: '/analysis/get',
  type: 'POST',
  description: 'To fetch performance analysis of the medical staff',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    date: Joi.date().required()
  }),
  method: ({ uid, date }: INPUT) =>
    performance(uid, date)
      .then(({ allApp }) => {
        const d = new Date(date)
        const { Pending, Accepted, Completed, Waiting } = allApp.reduce<{
          'Pending': (typeof allApp),
          'Accepted': (typeof allApp),
          'Rejected': (typeof allApp),
          'Waiting': (typeof allApp),
          'Completed': (typeof allApp),
          'Cancelled': (typeof allApp),
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
        const sameDay = (date1: Date, date2: Date) =>
          date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear()

        return [ ...Array(7).keys() ].reduce<{
          NewApp: { day: Date, count: number }[],
          HandledApp: { day: Date, count: number }[],
          AverageWaitingTime: { day: Date, averageTime: number }[]
        }>((all, num) => {
          const currentDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (6 - num))
          const currentCompletedApp = Completed.filter(app => sameDay(app.date, currentDate))
          const allNewApp = [ ...[ ...Pending, ...Accepted, ...Waiting ].filter(app => sameDay(app.date, currentDate)), ...currentCompletedApp ]
          const byNumberApp = currentCompletedApp.filter(app => app.type === 'byNumber')
          return {
            NewApp: [
              ...all.NewApp,
              { day: currentDate, count: allNewApp.length }
            ],
            HandledApp: [
              ...all.HandledApp,
              { day: currentDate, count: currentCompletedApp.length }
            ],
            AverageWaitingTime: [
              ...all.AverageWaitingTime,
              {
                day: currentDate,
                averageTime: byNumberApp.length > 0 ? byNumberApp.reduce((total, app) => total + app.updatedOn.getTime() - app.date.getTime(), 0) / byNumberApp.length : 0
              }
            ]
          }
        }, {
          NewApp: [],
          HandledApp: [],
          AverageWaitingTime: []
        })
      })
}

type INPUT = {
  uid: string
  date: Date
}

export default getPerformanceAnalysis