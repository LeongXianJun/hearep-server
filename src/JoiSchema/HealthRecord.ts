import Joi from '@hapi/joi'

const MedicationSchema = Joi.object().keys({
  medicine: Joi.string().required(),
  dosage: Joi.number().required(),
  usage: Joi.string().required()
}).required()

const LabTestFieldSchema = Joi.object().keys({
  field: Joi.string().required(),
  value: Joi.string().required(),
  normalRange: Joi.string().required()
}).required()

const InsertSchema = Joi.object().keys({
  patientId: Joi.string().required(),
  date: Joi.date().required(),
  type: Joi.string().valid('Health Prescription', 'Medication Record', 'Lab Test Result').required(),
  appId: Joi.when('type', {
    switch: [
      { is: 'Health Prescription', then: Joi.string() },
      { is: 'Lab Test Result', then: Joi.string() }
    ],
    otherwise: Joi.forbidden()
  }),
  illness: Joi.when('type', {
    is: 'Health Prescription', then: Joi.string().required(), otherwise: Joi.forbidden()
  }),
  clinicalOpinion: Joi.when('type', {
    is: 'Health Prescription', then: Joi.string().required(), otherwise: Joi.forbidden()
  }),
  prescriptionId: Joi.when('type', {
    is: 'Medication Record', then: Joi.string().required(), otherwise: Joi.forbidden()
  }),
  refillDate: Joi.when('type', {
    is: 'Medication Record', then: Joi.date().required(), otherwise: Joi.forbidden()
  }),
  medications: Joi.when('type', {
    is: 'Medication Record', then: Joi.array().items(MedicationSchema).required(), otherwise: Joi.forbidden()
  }),
  title: Joi.when('type', {
    is: 'Lab Test Result', then: Joi.string().required(), otherwise: Joi.forbidden()
  }),
  comment: Joi.when('type', {
    is: 'Lab Test Result', then: Joi.string().required(), otherwise: Joi.forbidden()
  }),
  data: Joi.when('type', {
    is: 'Lab Test Result', then: Joi.array().items(LabTestFieldSchema).required(), otherwise: Joi.forbidden()
  })
}).required()

const UpdateSchema = Joi.object().keys({
  id: Joi.string().required(),
  type: Joi.string().valid('Health Prescription', 'Medication Record', 'Lab Test Result').required(),
  illness: Joi.when('type', {
    is: 'Health Prescription', then: Joi.string(), otherwise: Joi.forbidden()
  }),
  clinicalOpinion: Joi.when('type', {
    is: 'Health Prescription', then: Joi.string(), otherwise: Joi.forbidden()
  }),
  refillDate: Joi.when('type', {
    is: 'Medication Record', then: Joi.date(), otherwise: Joi.forbidden()
  }),
  medications: Joi.when('type', {
    is: 'Medication Record', then: Joi.array().items(MedicationSchema), otherwise: Joi.forbidden()
  }),
  title: Joi.when('type', {
    is: 'Lab Test Result', then: Joi.string(), otherwise: Joi.forbidden()
  }),
  comment: Joi.when('type', {
    is: 'Lab Test Result', then: Joi.string(), otherwise: Joi.forbidden()
  }),
  data: Joi.when('type', {
    is: 'Lab Test Result', then: Joi.array().items(LabTestFieldSchema), otherwise: Joi.forbidden()
  })
}).required()

export default {
  InsertSchema,
  UpdateSchema
}