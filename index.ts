import express, { Request, Response, NextFunction } from 'express'
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

    endPoints.forEach(({name, method}) => {
        app.get(name, (req: Request, res: Response, next: NextFunction) => {
            method(req.path)
        })
    })

    app.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json({ name: 'todoman-backend' })
    })

    app.listen(PORT, () => {
        console.log(`API server ${process.env.Environment? `in ${process.env.Environment} `: ``}is listening on port ${PORT}`)
    })
}

main()