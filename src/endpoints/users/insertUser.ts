import { EndPoint } from '../'
import { insertU, MedicalInstituition } from "../../connections/users"

const insertUser: EndPoint = {
  name: '/user/create',
  type: 'POST',
  description: 'To insert a new user record',
  method: ({ uid, user }: INPUT) =>
    insertU(user.type)({ firebaseID: uid, ...user })
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