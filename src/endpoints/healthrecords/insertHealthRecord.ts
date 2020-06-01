import { EndPoint } from '../'
import { insertHR } from "../../connections/healthrecords"

const insertHealthRecord: EndPoint = {
  name: '/healthrecords',
  type: 'POST',
  description: 'To insert a new health record',
  method: ({ uid, patientID }: INPUT) =>
    insertHR({ type: 'Health Prescription', medicalStaffID: uid, patientID })
}

type INPUT = {
  uid: string
  patientID: string
}

export default insertHealthRecord