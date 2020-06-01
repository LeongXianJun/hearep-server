import { EndPoint } from '../'
import { updateHR, HR } from "../../connections/healthrecords"

const updateHealthRecord: EndPoint = {
  name: '/healthrecords/insert',
  type: 'PUT',
  description: 'To update a health record',
  method: ({ hr }: INPUT) =>
    updateHR(hr)
}

type INPUT = {
  hr: HR
}

export default updateHealthRecord