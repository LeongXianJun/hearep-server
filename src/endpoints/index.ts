import Joi from '@hapi/joi'
import tryFunction from './try'
import { displayUser, getPatients, getMedicalStaff, insertUser, removeUser, updateUser, updateWorkingTime, getTimeInterval, getAvailableTimeslot } from './users'
import { getAllRecords, getAllPatientRecords, insertHealthRecord, removeHealthRecord, updateHealthRecord } from './healthrecords'
import { cancelAppointment, getAllAppointments, getPatientAppointments, insertAppointment, rescheduleAppointment, updateStatus, getTurn, getAppointment } from './appointments'
import { viewAllAccessLogs } from './accessLogs'
import { getPerformanceAnalysis, getPatientHealthAnalysis } from './analysis'
import { getConditionOptions, insertHealthCondition } from './healthConditions'

const endPoints: EndPoint[] = [
  cancelAppointment,
  getAllAppointments,
  getPatientAppointments,
  getAppointment,
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

  getConditionOptions,
  insertHealthCondition,

  viewAllAccessLogs,

  getPerformanceAnalysis,
  getPatientHealthAnalysis,

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