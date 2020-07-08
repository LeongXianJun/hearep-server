import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { containUser } from "../../connections"

const hasUserwithPhoneNumber: EndPoint = {
  name: '/patient/exist',
  type: 'POST',
  skipToken: true,
  description: 'To check if user with the phone number exist',
  schema: Joi.object().keys({
    phoneNumber: Joi.string().required(),
  }),
  method: ({ phoneNumber }: INPUT) =>
    containUser(phoneNumber)
      .then(result => ({ 'hasUser': result }))
}

type INPUT = {
  phoneNumber: string
}

export default hasUserwithPhoneNumber