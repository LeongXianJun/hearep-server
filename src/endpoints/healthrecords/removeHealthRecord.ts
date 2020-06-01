import { EndPoint } from '../'
import { deleteHR } from "../../connections/healthrecords"

const deleteHealthRecord: EndPoint = {
  name: '/healthrecords/delete',
  type: 'PUT',
  description: 'To remove a health record',
  method: ({ HRID }: INPUT) =>
    deleteHR(HRID)
}

type INPUT = {
  HRID: string
}

export default deleteHealthRecord