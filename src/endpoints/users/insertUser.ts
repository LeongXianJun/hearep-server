import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { insertU, MedicalInstituition } from "../../connections/users"
import { UserSchema } from '../../JoiSchema'

const insertUser: EndPoint = {
  name: '/user/create',
  type: 'POST',
  description: 'To insert a new user record',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    user: UserSchema.InsertSchema
  }),
  method: ({ uid, user }: INPUT) =>
    insertU(user.type)({ uid, ...user })
}

type INPUT = {
  uid: string
  user: {
    username: string
    dob: string
    gender: 'M' | 'F'
    email: string
  } & (
    {
      type: 'Medical Staff'
      medicalInstituition: MedicalInstituition
    } | {
      type: 'Patient'
      phoneNumber: string
      occupation?: string
    }
  )
}

export default insertUser