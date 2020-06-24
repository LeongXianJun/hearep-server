import Joi from '@hapi/joi'

const Schema = Joi.object().keys({
  date: Joi.date().required(),
  option: Joi.string().required(),
  value: Joi.number().required()
}).required()

export default {
  Schema
}