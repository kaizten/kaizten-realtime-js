import {
  onNewMessage,
  onUpdateMessage,
  onRemoveMessage,
  onEndRequestMessage,
  initialize as initializeStore
} from './kaizten-store.js'
import {
  appContext,
  onInitialize
} from './kaizten-simulation.js'
import * as Rx from 'rxjs'



let webSocket
export let minRequiredTime = new Rx.BehaviorSubject()
export let maxRequiredTime = new Rx.BehaviorSubject()
export let numberOfNewMessages = new Rx.BehaviorSubject()
export let numberOfUpdateMessages = new Rx.BehaviorSubject()
export let numberOfRemoveMessages = new Rx.BehaviorSubject()



export function initialize () {
  if (!webSocket || webSocket.readyState !== 1) {
    webSocket = new WebSocket(appContext.url, 'v10.stomp')
    //console.log("websocket: " + webSocket)
    //webSocket = new WebSocket('ws://localhost:8181', 'v10.stomp')
    //webSocket = new WebSocket("ws://192.168.1.35:8181", "v10.stomp")
    //webSocket = new WebSocket("ws://10.209.3.94:8181", "v10.stomp")
    //webSocket = new WebSocket("ws://10.209.3.94:8181", "v10.stomp")
    webSocket.addEventListener('message', onMessageHandler)
    webSocket.addEventListener('open', onOpenHandler)
    webSocket.addEventListener('close', onCloseHandler)
  }
}

export function requestDataToServer (min, max) {
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
}

function onOpenHandler () {
  initializeStore()
  appContext.initialize()
  onInitialize()
}

function onMessageHandler (e) {
  let message = JSON.parse(e.data)
  let type = message.type
  switch (type) {
    case 'new':
      numberOfNewMessages.next(numberOfNewMessages.value + 1)
      onNewMessage(message)
      appContext.onNewMessage(message)
      break
    case 'remove':
      numberOfRemoveMessages.next(numberOfRemoveMessages.value + 1)
      onRemoveMessage(message)
      appContext.onRemoveMessage(message)
      break
    case 'update':
      numberOfUpdateMessages.next(numberOfUpdateMessages.value + 1)
      onUpdateMessage(message)
      appContext.onUpdateMessage(message)
      break
    case 'end-request':
      onEndRequestMessage(message)
      break
    default:
      console.log('# ERROR: I have never heard of this!')
      console.log(message)
  }
}

function onCloseHandler () {
  console.log('======> onCloseHandler')
}
