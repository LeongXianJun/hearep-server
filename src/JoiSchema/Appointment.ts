import Joi from '@hapi/joi'

const InsertSchema = Joi.object().keys({
  medicalStaffId: Joi.string().required(),
  date: Joi.date().required(),
  address: Joi.string().required(),
  type: Joi.string().valid('byTime', 'byNumber').required(),
  time: Joi.when('type', {
    is: 'byTime', then: Joi.string().required(), otherwise: Joi.forbidden()
  }),
  turn: Joi.when('type', {
    is: 'byNumber', then: Joi.number().required(), otherwise: Joi.forbidden()
  }),
}).required()

const UpdateSchema = Joi.object().keys({
  id: Joi.string().required(),
  status: Joi.string().valid('Accepted', 'Rejected').required()
}).required()

export default {
  InsertSchema,
  UpdateSchema
}