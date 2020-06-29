import { messaging } from '../connections'

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

export default process.env.NODE_ENV === 'test'
  ? {
    sendMessages: () => { },
    sendToMultipleDevices: () => { }
  }
  : {
    sendMessages,
    sendToMultipleDevices: sendToMultipleDevices
  }