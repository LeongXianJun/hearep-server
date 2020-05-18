import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

import endPoints from './src/endpoints'

require('custom-env').env()

const PORT = process.env.PORT || 3000

async function main() {
    const app = express()

    app.use(cors())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    endPoints.forEach(({name, method}) => {
        app.get(name, (req: Request, res: Response, next: NextFunction) => {
            method(req.path)
        })
    })

    app.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json({ name: 'todoman-backend' })
    })

    app.listen(PORT, () => {//err => {
        // if (err) {
        //     throw err
        // }
        // eslint-disable-next-line no-console
        console.log(`API server in ${process.env.NODE_ENV} is listening on port ${PORT}`)
    })
}

main()