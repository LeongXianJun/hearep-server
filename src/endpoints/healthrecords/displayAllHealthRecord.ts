import { EndPoint } from '../'
import { allHR } from "../../connections/healthrecords"

const displayAllHealthRecord: EndPoint = {
  name: '/healthrecords/all',
  type: 'GET',
  description: 'To fetch all of the health records',
  method: () =>
    allHR()
}

export default displayAllHealthRecord