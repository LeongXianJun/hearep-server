import { EndPoint } from '../'
import { deleteU } from "../../connections/users"

const removeUserAcc: EndPoint = {
  name: '/user/delete',
  type: 'PUT',
  description: 'To remove a user record',
  method: ({ uid }: INPUT) =>
    deleteU(uid)
}

type INPUT = {
  uid: string
}

export default removeUserAcc