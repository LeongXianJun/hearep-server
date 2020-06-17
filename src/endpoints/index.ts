import Joi from '@hapi/joi'
import tryFunction from './try'
import { displayUser, getPatients, getMedicalStaff, insertUser, removeUser, updateUser, updateWorkingTime, getTimeInterval, getAvailableTimeslot } from './users'
import { getAllRecords, getAllPatientRecords, insertHealthRecord, removeHealthRecord, updateHealthRecord } from './healthrecords'
import { cancelAppointment, getAllAppointments, getPatientAppointments, insertAppointment, rescheduleAppointment, updateStatus, getTurn } from './appointments'
import { viewAllAccessLogs } from './accessLogs'

const endPoints: EndPoint[] = [
  cancelAppointment,
  getAllAppointments,
  getPatientAppointments,
  insertAppointment,
  rescheduleAppointment,
  updateStatus,
  getTurn,
  getAllRecords,
  getAllPatientRecords,
  insertHealthRecord,
  removeHealthRecord,
  updateHealthRecord,
  displayUser,
  getPatients,
  getMedicalStaff,
  insertUser,
  removeUser,
  updateUser,
  updateWorkingTime,
  getTimeInterval,
  getAvailableTimeslot,
  viewAllAccessLogs,
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
  schema: Joi.ObjectSchema
  method: (data?: any) => Promise<any>
}

export default endPoints