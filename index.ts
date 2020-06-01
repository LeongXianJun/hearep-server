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

endPoints.forEach(({ name, type, method }) => {
  switch (type) {
    // case 'GET':
    //   app.get(name, async (req: Request, res: Response, next: NextFunction) => {
    //     console.log('Getting: ', name)
    //     res.json(await method(req.body))
    //   })
    //   break
    case 'POST':
      app.post(name, async (req: Request, res: Response, next: NextFunction) => {
        console.log('Post: ', name)
        const { userToken, tid, ...others } = getData(req.body)
        const uid = await decode(userToken, tid)
        res.json(await method({ uid, ...others }))
      })
      break
    case 'PUT':
      app.put(name, async (req: Request, res: Response, next: NextFunction) => {
        console.log('Put: ', name)
        const { userToken, tid, ...others } = getData(req.body)
        const uid = await decode(userToken, tid)
        res.json(await method({ uid, ...others }))
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

const decode = (token: string, tid: string) => {
  if (process.env.NODE_ENV === 'test') {
    return tid
  } else {
    return admin.auth().verifyIdToken(token)
  }
}

const getData = (val: string | undefined) => {
  if (val) {
    const data = Object.keys(val)[ 0 ]
    return JSON.parse(data)
  } else {
    return {}
  }
}

export default app