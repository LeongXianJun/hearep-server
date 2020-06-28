import { messaging } from '../connections'

const sendMessages = (data: { token: string, [ key: string ]: string }[]) =>
  messaging.sendAll(data.map(({ token, ...other }) => ({ token, data: other })))
    .then((response) => {
      console.log('Successfully sent message:', response.successCount, response.failureCount)
      if (response.failureCount > 0)
        console.log('C', JSON.stringify(response.responses))
    })
    .catch((error) => {
      console.log('Error sending message:', error)
    })

const sendMultipleDevices = (deviceToken: string[], data: { [ key: string ]: string }) =>
  messaging.sendMulticast({ data: data, tokens: deviceToken })
    .then((response) => {
      console.log('Successfully sent message:', response.successCount, response.failureCount)
      if (response.failureCount > 0)
        console.log('C', JSON.stringify(response.responses))
    })
    .catch((error) => {
      console.log('Error sending message:', error)
    })

export default {
  sendMessages,
  sendMultipleDevices
}