import { EndPoint } from './'
import { tryConnection } from "../connections/try"

const tryFunction: EndPoint = {
  name: '/try',
  type: 'GET',
  description: 'This is to try the connection',
  method: (data: Data) => 
    new Promise((resolve, reject) => {
      tryConnection()
      console.log(data)
      // console.log(JSON.stringify(data))
      resolve({ result: 'success' })
    })
}

interface Data{

}

export default tryFunction