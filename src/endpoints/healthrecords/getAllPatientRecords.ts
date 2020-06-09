import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { allHR, HR } from "../../connections/healthrecords"

const getAllPatientRecords: EndPoint = {
  name: '/healthrecords/patient',
  type: 'POST',
  description: 'To fetch all of the patient\'s health records',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
  }),
  method: ({ uid }: INPUT) =>
    allHR(uid).then(result => {
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
  uid: string
}

export default getAllPatientRecords