const tryFunction = {
  name: '/try',
  description: 'This is to try the connection',
  method: (data: Data) => {
    console.log(data)
    // console.log(JSON.stringify(data))
  }
}

interface Data{

}

export default tryFunction