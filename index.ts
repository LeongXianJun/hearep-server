import express, { Request, Response, NextFunction, response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

require('custom-env').env()

import endPoints from './src/endpoints'

const PORT = process.env.PORT || 3000

async function main() {
  const app = express()
  
  app.use(cors())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  
  endPoints.forEach(({name, type, method}) => {
    switch(type) {
      case 'GET':
        app.get(name, async (req: Request, res: Response, next: NextFunction) => {
          console.log('Getting: ', name)
          res.json(await method())
        })
        break
      case 'POST':
        app.post(name, (req: Request, res: Response, next: NextFunction) => {
          console.log('Posting: ', name)
          res.json(method())
        })
        break
      case 'PUT':
        app.put(name, (req: Request, res: Response, next: NextFunction) => {
          console.log('Putting: ', name)
          res.json(method())
        })
        break
      case 'SET':
        app.set(name, (req: Request, res: Response, next: NextFunction) => {
          console.log('Setting: ', name)
          res.json(method())
        })
        break
    }
  })
  
  app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ name: 'todoman-backend' })
  })
  
  app.listen(PORT, () => {
    console.log(`API server ${process.env.Environment? `in ${process.env.Environment} `: ``}is listening on port ${PORT}`)
  })
}

main()