import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import admin from 'firebase-admin'

require('custom-env').env()

import endPoints from './src/endpoints'
import { NotificationManager } from './src/Managers'

const PORT = process.env.PORT || 3000
const app = express()
const onClose = () => {
  NotificationManager.offline()
}

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

endPoints.forEach(({ name, type, schema, method, skipToken }) => {
  switch (type) {
    case 'POST':
      app.post(name, (req: Request, res: Response, next: NextFunction) => {
        schema.required().options({ abortEarly: false })
          .validateAsync(req.body)
          .then(() => next())
          .catch((errors: Error) => res.json({ 'errors': errors.message }))
      }, (req: Request, res: Response, next: NextFunction) => {
        if (process.env.NODE_ENV !== 'test')
          console.log('Post:', name)
        const { userToken, ...others } = req.body
        decode(userToken, skipToken)
          .then(({ uid }) =>
            method({ uid, ...others })
              .then(result => res.json(result))
              .catch((errors: Error) => res.json({ 'errors': errors.message }))
          )
      })
      break
    case 'PUT':
      app.put(name, (req: Request, res: Response, next: NextFunction) => {
        schema.required().options({ abortEarly: false })
          .validateAsync(req.body)
          .then(() => next())
          .catch((errors: Error) => res.json({ 'errors': errors.message }))
      }, (req: Request, res: Response, next: NextFunction) => {
        if (process.env.NODE_ENV !== 'test')
          console.log('Put:', name)
        const { userToken, ...others } = req.body
        decode(userToken, skipToken)
          .then(({ uid }) =>
            method({ uid, ...others })
              .then(result => res.json(result))
              .catch((errors: Error) => res.json({ 'errors': errors.message }))
          )
      })
      break
  }
})

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  console.log('Connected')
  res.status(200).json({ name: 'todoman-backend' })
})

app.listen(PORT, () => {
  console.log(`API server ${process.env.Environment ? `in ${process.env.Environment} ` : ``}is listening on port ${PORT}`)
}).addListener('close', onClose)

/**
 * @param token This will be the testing id rather than the firebase token
 */
const decode = (token: string, skipToken: boolean = false) => {
  if (skipToken || process.env.NODE_ENV === 'test') {
    return Promise.resolve({ uid: token })
  } else {
    return admin.auth().verifyIdToken(token)
  }
}

export default app