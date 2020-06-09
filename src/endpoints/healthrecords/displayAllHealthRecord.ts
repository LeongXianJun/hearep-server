import { EndPoint } from '../'
import { allHR } from "../../connections/healthrecords"

const displayAllHealthRecords: EndPoint = {
  name: '/healthrecords/all',
  type: 'POST',
  description: 'To fetch all of the health records',
  method: ({ }: INPUT) =>
    allHR().then(allHR => allHR.filter(hr => hr.deleteAt))
}

type INPUT = {
}

export default displayAllHealthRecords