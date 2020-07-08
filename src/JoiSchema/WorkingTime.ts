import Joi from '@hapi/joi'

const ByTimeSchema = Joi.object().keys({
  day: Joi.number().valid(0, 1, 2, 3, 4, 5, 6).required(),
  slots: Joi.array().items(Joi.number().required()).required()
}).required()

const ByNumberSchema = Joi.object().keys({
  day: Joi.number().valid(0, 1, 2, 3, 4, 5, 6).required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().required()
}).required()

const Schema = Joi.object().keys({
  type: Joi.string().valid('byTime', 'byNumber').required(),
  timeslots: Joi.when('type', {
    switch: [
      { is: 'byTime', then: Joi.array().items(ByTimeSchema) },
      { is: 'byNumber', then: Joi.array().items(ByNumberSchema) },
    ],
    otherwise: Joi.forbidden()
  })
}).required()

export default {
  Schema
}