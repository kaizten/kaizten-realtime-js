import {
  initialize as initializeWS,
  setUp as setUpWebSockets
} from './kaizten-websockets.js'
import * as Rx from 'rxjs'

export let appContext
export let status = new Rx.BehaviorSubject()

export function setUp (context) {
  appContext = context  
  status.next('not ready')
  setUpWebSockets()
  appContext.orm.setUp()
  const promisesSetUp = []
  let apps = appContext.apps
  for (let i = 0; i < apps.length; i++) {
    let app = apps[i]
    let promise = app.setUp(app)
    promisesSetUp.push(promise)
  }
  Promise.all(promisesSetUp).then(onSetUp)
}

function onSetUp () {
  //console.log("on setup")
  const promisesInitialize = []
  let promiseWs = initializeWS()
  let promiseStore = appContext.orm.initialize()
  promisesInitialize.push(promiseWs)
  promisesInitialize.push(promiseStore)
  let apps = appContext.apps
  for (let i = 0; i < apps.length; i++) {
    let promiseApp = apps[i].initialize()
    promisesInitialize.push(promiseApp)
  }
  Promise.all(promisesInitialize).then(onInitialize)
}

function onInitialize () {
  let apps = appContext.apps
  for (let i = 0; i < apps.length; i++) {
    let app = apps[i]
    if (app.onInitialize !== undefined) {
      app.onInitialize()
    }
  }
  status.next('ready')
}