import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { getAllMS } from "../../connections/users"

const getMedicalStaff: EndPoint = {
  name: '/medicalStaff/all',
  type: 'POST',
  description: 'To fetch all of the medical staff records',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
  }),
  method: ({ }: INPUT) =>
    getAllMS()
}

type INPUT = {
}

export default getMedicalStaff