import tryFunction from './try'
import { displayAllHealthRecords, insertHealthRecord, removeHealthRecord, updateHealthRecord } from './healthrecords'
import { displayUser, insertUser, removeUser, updateUser } from './users'

const endPoints: EndPoint[] = [
  displayAllHealthRecords,
  insertHealthRecord,
  removeHealthRecord,
  updateHealthRecord,
  displayUser,
  insertUser,
  removeUser,
  updateUser,
  tryFunction
]

/**
 * POST --> add a new doc
 * PUT --> Update an existing doc, Delete a doc (Soft Delete)
 */
export interface EndPoint {
  name: string
  type: 'POST' | 'PUT'
  description: string
  method: (data?: any) => Promise<any>
}

export default endPoints