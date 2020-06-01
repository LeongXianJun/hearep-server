import supertest from 'supertest'

import app from '../'

const request = supertest(app)

const post = (endPoint: string, data: Object = {}) =>
  request.post(endPoint)
    .send(JSON.stringify(data))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/x-www-form-urlencoded')

const put = (endPoint: string, data: Object = {}) =>
  request.put(endPoint)
    .send(JSON.stringify(data))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/x-www-form-urlencoded')

export { post, put }