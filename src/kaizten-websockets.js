import {
  appContext
} from './kaizten-simulation.js'
import * as Rx from 'rxjs'

let webSocket
let apps
let resolveInitialization
export let minRequiredTime = new Rx.BehaviorSubject()
export let maxRequiredTime = new Rx.BehaviorSubject()
export let numberOfNewMessages = new Rx.BehaviorSubject()
export let numberOfUpdateMessages = new Rx.BehaviorSubject()
export let numberOfRemoveMessages = new Rx.BehaviorSubject()

export function initialize () {
  let promise = new Promise((resolve, reject) => {
  if (!webSocket || webSocket.readyState !== 1) {
      resolveInitialization = resolve
      webSocket = new WebSocket(appContext.url, 'v10.stomp')
      //console.log("websocket: " + webSocket)
      //webSocket = new WebSocket("ws://192.168.1.35:8181", "v10.stomp")
      webSocket.addEventListener('open', onOpenHandler)
      webSocket.addEventListener('close', onCloseHandler)
      webSocket.addEventListener('message', onMessageHandler)      
    }
  })
  return promise
}

export function requestDataToServer (min, max) {
  //console.log('# WS Start Request: [' + min + ', ' + max + ']')
  webSocket.send(
    JSON.stringify({
      type: 'request',
      minRequiredTime: min,
      maxRequiredTime: max
    })
  )
  minRequiredTime.next(Math.min(minRequiredTime.value, min))
  maxRequiredTime.next(Math.max(maxRequiredTime.value, max))
}

export function setUp () {
  minRequiredTime.next(Number.POSITIVE_INFINITY)
  maxRequiredTime.next(Number.NEGATIVE_INFINITY)
  numberOfNewMessages.next(0)
  numberOfUpdateMessages.next(0)
  numberOfRemoveMessages.next(0)
  apps = appContext.apps
}

function onOpenHandler () {
  resolveInitialization()
}

function onMessageHandler (e) {
  let message = JSON.parse(e.data)
  let type = message.type
  switch (type) {
    case 'new':
      numberOfNewMessages.next(numberOfNewMessages.value + 1)
      appContext.orm.newEntity(
        message.time, 
        message.entity.id, 
        message.entity.properties)
      for (let i = 0; i < apps.length; i++) {
        apps[i].onNewMessage(message)
      }
      break
    case 'remove':
      numberOfRemoveMessages.next(numberOfRemoveMessages.value + 1)
      appContext.orm.removeEntity(
        message.time, 
        message.entity.id)
      for (let i = 0; i < apps.length; i++) {
        apps[i].onRemoveMessage(message)
      }
      break
    case 'update':
      numberOfUpdateMessages.next(numberOfUpdateMessages.value + 1)
      appContext.orm.updateEntity(
        message.time, 
        message.change.id, 
        message.change.properties)
      for (let i = 0; i < apps.length; i++) {
        apps[i].onUpdateMessage(message)
      }
      break
    case 'end-request':
      console.log("# end request")
      appContext.orm.onEndRequestMessage(
        message.minRequired,
        message.maxRequired,
        message.min,
        message.max,
        message.error
      )
      break
    default:
      console.log('# ERROR: I have never heard of this!')
      console.log(message)
  }
}

function onCloseHandler () {
  console.log('======> onCloseHandler')
}
