import Joi from '@hapi/joi'
import { EndPoint } from '../..'
import { updateWT, WorkingTime } from "../../../connections"
import { WorkingTimeSchema } from '../../../JoiSchema'

const updateWorkingTime: EndPoint = {
  name: '/workingTime/update',
  type: 'PUT',
  description: 'To update the working time of a medical staff',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    workingTime: WorkingTimeSchema.Schema
  }),
  method: ({ uid, workingTime }: INPUT) =>
    updateWT(uid, { workingTime })
}

type INPUT = {
  uid: string,
  workingTime: WorkingTime
}

export default updateWorkingTime