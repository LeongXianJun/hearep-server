import Joi from '@hapi/joi'

const InsertSchema = Joi.object().keys({
  username: Joi.string().required(),
  dob: Joi.date().required(),
  gender: Joi.string().valid('M', 'F').required(),
  type: Joi.string().valid('Medical Staff', 'Patient').required(),
  email: Joi.string().email().required(),
  medicalInstituition: Joi.when('type', {
    is: 'Medical Staff',
    then: Joi.object({
      role: Joi.string().required(),
      name: Joi.string().required(),
      address: Joi.string().required(),
      department: Joi.string().required()
    }).required(),
    otherwise: Joi.forbidden()
  }),
  phoneNumber: Joi.when('type', {
    is: 'Patient', then: Joi.string().required(), otherwise: Joi.forbidden()
  }),
  occupation: Joi.when('type', {
    is: 'Patient', then: Joi.string(), otherwise: Joi.forbidden()
  })
}).required()

const UpdateSchema = Joi.object().keys({
  username: Joi.string(),
  dob: Joi.date(),
  gender: Joi.string().valid('M', 'F'),
  type: Joi.string().valid('Medical Staff', 'Patient').required(),
  medicalInstituition: Joi.when('type', {
    is: 'Medical Staff',
    then: Joi.object({
      role: Joi.string(),
      name: Joi.string(),
      address: Joi.string(),
      department: Joi.string()
    }),
    otherwise: Joi.forbidden()
  }),
  email: Joi.when('type', {
    is: 'Patient', then: Joi.string(), otherwise: Joi.forbidden()
  }),
  occupation: Joi.when('type', {
    is: 'Patient', then: Joi.string(), otherwise: Joi.forbidden()
  })
}).required()

export default {
  InsertSchema,
  UpdateSchema
}