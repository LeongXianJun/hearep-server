import { EndPoint } from '../'
import { getU } from "../../connections/users"

const displayUser: EndPoint = {
  name: '/user/get',
  type: 'POST',
  description: 'To fetch the user record',
  method: ({ uid }: INPUT) =>
    getU(uid)
}

type INPUT = {
  uid: string
}

export default displayUser