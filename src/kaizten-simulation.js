import {
  setUp as setUpData
} from './kaizten-data.js'
import {
  initialize as initializeWS,
  setUp as setUpWebSockets
} from './kaizten-websockets.js'

export let appContext

export function setUp(context) {
  appContext = context
  setUpWebSockets()
  setUpData()
  appContext.setUp()
}

export function onSetUp() {
  initializeWS()
}
