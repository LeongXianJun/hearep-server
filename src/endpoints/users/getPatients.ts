import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { getAllP } from "../../connections/users"

const getPatients: EndPoint = {
  name: '/patient/all',
  type: 'POST',
  description: 'To fetch all of the patient records',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
  }),
  method: ({ }: INPUT) =>
    getAllP()
}

type INPUT = {
}

export default getPatients