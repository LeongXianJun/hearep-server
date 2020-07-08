import { MessageUtil } from '../utils'
import { getWaitingAppointments, allNonExpiredMedication } from '../connections'

const timeOut = setInterval(async () => {
  if (process.env.NODE_ENV === 'test')
    return

  await MessageUtil.updateDeviceTokens()
  const deviceTokens = MessageUtil.getAllDeviceTokens()

  const appointments = await getWaitingAppointments()
  const medicationRecords = await allNonExpiredMedication()

  const appMessages = appointments.reduce<{
    token: string, [ key: string ]: string
  }[]>((all, app) => {
    const time = (app.time?.getTime() ?? 0) - Date.now()
    if (time >= 0 && time < 3600000 * 12) {
      const patientDT = deviceTokens.get(app.patientId)
      const medicalStaffDT = deviceTokens.get(app.medicalStaffId)
      return [
        ...all,
        ...patientDT ? [ { token: patientDT.deviceToken, title: 'Appointment', description: 'by ' + app.time.toString() } ] : [],
        ...medicalStaffDT ? [ { token: medicalStaffDT.deviceToken, title: 'Appointment', description: 'by ' + app.time.toString() } ] : []
      ]
    } else {
      return all
    }
  }, [])

  const mrMessages = medicationRecords.reduce<{
    token: string, [ key: string ]: string
  }[]>((all, mr) => {
    const time = mr.refillDate.getTime() - Date.now()
    if (time >= 0 && time < 3600000 * 12) {
      const patientDT = deviceTokens.get(mr.patientId)
      const medicalStaffDT = deviceTokens.get(mr.medicalStaffId)
      return [
        ...all,
        ...patientDT ? [ { token: patientDT.deviceToken, title: 'Medication Refill', description: 'by ' + patientDT.name + ' on ' + mr.refillDate.toDateString() } ] : [],
        ...patientDT && medicalStaffDT ? [ { token: medicalStaffDT.deviceToken, title: 'Medication Refill', description: 'by ' + patientDT.name + ' on ' + mr.refillDate.toDateString() } ] : []
      ]
    } else {
      return all
    }
  }, [])


  MessageUtil.sendMessages([ ...appMessages, ...mrMessages ])
}, 3600000 * 12) // 12 hour

const offline = () => {
  clearInterval(timeOut)
}

export default {
  offline
}