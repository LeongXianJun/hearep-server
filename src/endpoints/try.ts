import { tryConnection } from "../connections/try"

const tryFunction = {
  name: '/try',
  description: 'This is to try the connection',
  method: (data: Data) => {
    tryConnection()
    console.log(data)
    // console.log(JSON.stringify(data))
  }
}

interface Data{

}

export default tryFunction