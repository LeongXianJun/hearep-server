import { EndPoint } from '../'
import { updateU, User } from "../../connections/users"

const updateUserDetail: EndPoint = {
  name: '/user/update',
  type: 'PUT',
  description: 'To update a health record',
  method: ({ user }: INPUT) =>
    updateU(user)
}

type INPUT = {
  user: User
}

export default updateUserDetail