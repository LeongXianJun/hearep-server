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
  type: Joi.string().valid('byTime', 'byNumber').required(),
  status: Joi.when('type', {
    switch: [
      { is: 'byTime', then: Joi.string().valid('Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled').required() },
      { is: 'byNumber', then: Joi.string().valid('Waiting', 'Completed', 'Cancelled').required() }
    ],
    otherwise: Joi.forbidden()
  })
}).required()

export default {
  InsertSchema,
  UpdateSchema
}