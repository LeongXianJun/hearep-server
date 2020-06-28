import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { updateU } from "../../connections"
import { UserSchema } from '../../JoiSchema'

const updateUserDetail: EndPoint = {
  name: '/user/update',
  type: 'PUT',
  description: 'To update the user record',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    user: UserSchema.UpdateSchema
  }),
  method: ({ uid, user }: INPUT) =>
    updateU(uid, user)
}

type INPUT = {
  uid: string,
  user: {
    username: string
    dob: Date
    gender: 'M' | 'F'
    medicalInstituition?: {
      role: string
      name: string
      address: string
      department: string
    }
    email?: string
    occupation?: string
  }
}

export default updateUserDetail