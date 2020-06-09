import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import admin from 'firebase-admin'

require('custom-env').env()

import endPoints from './src/endpoints'

const PORT = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

endPoints.forEach(({ name, type, schema, method }) => {
  switch (type) {
    // case 'GET':
    //   app.get(name, async (req: Request, res: Response, next: NextFunction) => {
    //     console.log('Getting: ', name)
    //     res.json(await method(req.body))
    //   })
    //   break
    case 'POST':
      app.post(name, (req: Request, res: Response, next: NextFunction) => {
        schema.required().options({ abortEarly: false })
          .validateAsync(req.body)
          .then(() => next())
          .catch(errors => res.json({ 'errors': errors.message }))
      }, (req: Request, res: Response, next: NextFunction) => {
        console.log('Post:', name)
        const { userToken, ...others } = req.body
        decode(userToken)
          .then(({ uid }) =>
            method({ uid, ...others })
              .then(result => res.json(result))
              .catch(errors => res.json({ 'errors': errors.message }))
          )
      })
      break
    case 'PUT':
      app.put(name, (req: Request, res: Response, next: NextFunction) => {
        schema.required().options({ abortEarly: false })
          .validateAsync(req.body)
          .then(() => next())
          .catch(errors => res.json({ 'errors': errors.message }))
      }, (req: Request, res: Response, next: NextFunction) => {
        console.log('Put:', name)
        const { userToken, ...others } = req.body
        decode(userToken)
          .then(({ uid }) =>
            method({ uid, ...others })
              .then(result => res.json(result))
              .catch(errors => res.json({ 'errors': errors.message }))
          )
      })
      break
    // case 'SET':
    //   app.set(name, (req: Request, res: Response, next: NextFunction) => {
    //     console.log('Setting: ', name)
    //     res.json(method())
    //   })
    //   break
  }
})

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  console.log('Connected')
  res.status(200).json({ name: 'todoman-backend' })
})

app.listen(PORT, () => {
  console.log(`API server ${process.env.Environment ? `in ${process.env.Environment} ` : ``}is listening on port ${PORT}`)
})

/**
 * @param token This will be the testing id rather than the firebase token
 */
const decode = (token: string) => {
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve({ uid: token })
  } else {
    return admin.auth().verifyIdToken(token)
  }
}

export default app