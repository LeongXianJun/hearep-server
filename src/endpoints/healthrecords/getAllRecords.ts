import Joi from '@hapi/joi'
import { EndPoint } from '..'
import { insertAccessLog, allHR } from "../../connections"

const getAllRecords: EndPoint = {
  name: '/healthrecords/medicalstaff',
  type: 'POST',
  description: 'To fetch all of the health records of a patient by medical staff',
  schema: Joi.object().keys({
    userToken: Joi.string().required(),
    patientId: Joi.string().required()
  }),
  method: ({ uid, patientId }: INPUT) =>
    insertAccessLog({ target: patientId, viewedBy: uid })
      .then(({ response }) =>
        response.includes('success')
          ? allHR(patientId).then(result => {
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
          : Promise.reject(new Error('Please request access again. Thank you.'))
      )
}

type INPUT = {
  uid: string
  patientId: string
}

export default getAllRecords