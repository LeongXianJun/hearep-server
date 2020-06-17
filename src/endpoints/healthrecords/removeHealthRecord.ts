import Joi from '@hapi/joi'
import { EndPoint } from '../'
import { deleteHR } from "../../connections"

const deleteHealthRecord: EndPoint = {
  name: '/healthrecords/delete',
  type: 'PUT',
  description: 'To remove a health record',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    id: Joi.string().required(),
  }),
  method: ({ id: hrid }: INPUT) =>
    deleteHR(hrid)
}

type INPUT = {
  id: string
}

export default deleteHealthRecord