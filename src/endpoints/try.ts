import { EndPoint } from './'
import { tryConnection } from "../connections/try"

const tryFunction: EndPoint = {
  name: '/try',
  type: 'POST',
  description: 'This is to try the connection',
  method: ({ }: INPUT) =>
    new Promise((resolve, reject) => {
      tryConnection()
      resolve({ result: 'success' })
    })
}

type INPUT = {

}

export default tryFunction