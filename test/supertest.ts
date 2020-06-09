import supertest from 'supertest'
import qs from 'qs'

import app from '../'

const request = supertest(app)

const get = (endPoint: string) =>
  request.get(endPoint)
    .set('Accept', 'application/json')

const post = (endPoint: string, userToken: string, data?: any) =>
  request.post(endPoint)
    .send(qs.stringify({ userToken, ...data ?? {} }))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/x-www-form-urlencoded')

const put = (endPoint: string, userToken: string, data?: any) =>
  request.put(endPoint)
    .send(qs.stringify({ userToken, ...data ?? {} }))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/x-www-form-urlencoded')

export { get, post, put }