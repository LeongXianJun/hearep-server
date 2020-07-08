import { messaging, getAllDeviceToken } from '../connections'

const deviceTokens: Map<string, {
  name: string,
  deviceToken: string
}> = new Map()

const getAllDeviceTokens = () =>
  deviceTokens

const getDeviceToken = (id: string) =>
  deviceTokens.get(id)

const updateToken = (userId: string, deviceToken: string, username?: string) =>
  deviceTokens.set(userId, {
    name: username ?? '',
    deviceToken: deviceToken
  })

const updateDeviceTokens = () =>
  getAllDeviceToken().then(result => {
    result.forEach(r => {
      if (r.deviceToken) {
        updateToken(r.id, r.deviceToken, r.username)
      }
    })
  })

const sendMessages = (data: { token: string, [ key: string ]: string }[]) =>
  messaging.sendAll(data.map(({ token, ...other }) => ({ token, data: other, notification: { title: other.title, body: other.description }, android: { priority: 'high' }, apns: { payload: { aps: { contentAvailable: true } } } })))
    .then((response) => {
      console.log('Successfully sent message:', response.successCount, response.failureCount)
      if (response.failureCount > 0)
        console.log('C', JSON.stringify(response.responses))
    })
    .catch((error) => {
      console.log('Error sending message:', error)
    })

const sendToMultipleDevices = (deviceToken: string[], data: { [ key: string ]: string }) =>
  messaging.sendMulticast({ data: data, notification: { title: data.title, body: data.description }, tokens: deviceToken, android: { priority: 'high' }, apns: { payload: { aps: { contentAvailable: true } } } })
    .then((response) => {
      console.log('Successfully sent message:', response.successCount, response.failureCount)
      if (response.failureCount > 0)
        console.log('C', JSON.stringify(response.responses))
    })
    .catch((error) => {
      console.log('Error sending message:', error)
    })

// get the latest device token
if (process.env.NODE_ENV !== 'test') {
  updateDeviceTokens()
}

export default process.env.NODE_ENV === 'test'
  ? {
    getAllDeviceTokens,
    getDeviceToken,
    updateToken: () => { },
    updateDeviceTokens: () => Promise.resolve(),
    sendMessages: () => Promise.resolve(),
    sendToMultipleDevices: () => Promise.resolve()
  }
  : {
    getAllDeviceTokens,
    getDeviceToken,
    updateToken,
    updateDeviceTokens,
    sendMessages,
    sendToMultipleDevices: sendToMultipleDevices
  }