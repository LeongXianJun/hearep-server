import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { allHR, HR } from "../../connections/healthrecords"

const getAllRecords: EndPoint = {
  name: '/healthrecords/medicalstaff',
  type: 'POST',
  description: 'To fetch all of the health records of a patient by medical staff',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    patientId: Joi.string().required()
  }),
  method: ({ patientId }: INPUT) =>
    allHR(patientId).then(result => {
      const { allMR, other } = result.reduce<
        { allMR: FirebaseFirestore.DocumentData[], other: FirebaseFirestore.DocumentData[] }
      >(({ allMR, other }, r) =>
        r.type === 'Medication Record'
          ? { allMR: [ ...allMR, r ], other }
          : { allMR, other: [ ...other, r ] }
        , { allMR: [], other: [] })

      return other.reduce<{
        'Health Prescription': FirebaseFirestore.DocumentData[]
        'Lab Test Result': FirebaseFirestore.DocumentData[]
      }>((a, b) =>
        ({
          ...a, [ b.type ]: [
            ...a[ b.type as 'Health Prescription' | 'Lab Test Result' ],
            b.type === 'Health Prescription'
              ? { ...b, 'medicationRecords': allMR.filter(mr => mr.prescriptionId === b.id) }
              : b
          ]
        })
        , {
          'Health Prescription': [],
          'Lab Test Result': [],
        }
      )
    })
}

type INPUT = {
  patientId: string
}

export default getAllRecords