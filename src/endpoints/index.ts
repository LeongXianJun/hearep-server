import tryFunction from './try'
import { displayAllHealthRecord } from './healthrecords'

const endPoints: EndPoint[] = [
  displayAllHealthRecord,
  tryFunction
]

/**
 * POST --> add a new doc
 * PUT --> Update an existing doc, Delete a doc (Soft Delete)
 */
export interface EndPoint {
  name: string
  type: 'GET' | 'SET' | 'POST' | 'PUT'
  description: string
  method: (data?: any) => Promise<any>
}

export default endPoints