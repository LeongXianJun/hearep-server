import tryFunction from './try'

const endPoints: EndPoint[] = [
  tryFunction
]

interface EndPoint {
  name: string
  method: Function
}

export default endPoints