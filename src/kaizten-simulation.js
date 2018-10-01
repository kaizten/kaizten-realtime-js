import {
  setUp as setUpData
} from './kaizten-store.js'
import {
  initialize as initializeWS,
  setUp as setUpWebSockets
} from './kaizten-websockets.js'
import * as Rx from "rxjs";

export let appContext
export let status = new Rx.BehaviorSubject()

export function setUp(context) {
  status.next('not ready')
  appContext = context
  setUpWebSockets()
  setUpData()
  appContext.setUp()
}

export function onSetUp() {
  initializeWS()
}

export function onInitialize() {
  if (appContext.onInitialize !== undefined) {
    appContext.onInitialize()
  }
  status.next('ready')
}
