import { MessageUitl } from '../utils'
import { getAllDeviceToken, getWaitingAppointments, allNonExpiredMedication } from '../connections'

const deviceTokens: Map<string, {
  name: string,
  deviceToken: string
}> = new Map()

const timeOut = setTimeout(async () => {
  // get the latest device token
  await getAllDeviceToken().then(result => {
    result.forEach(r => {
      if (r.deviceToken) {
        deviceTokens.set(r.id, {
          name: r.username,
          deviceToken: r.deviceToken
        })
      }
    })
  })

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


  MessageUitl.sendMessages([ ...appMessages, ...mrMessages ])
}, 3600000 * 12) // 12 hour

const offline = () => {
  clearTimeout(timeOut)
}

export default {
  offline
}