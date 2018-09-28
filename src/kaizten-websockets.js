import {
  onNewMessage,
  onUpdateMessage,
  onRemoveMessage,
  onEndRequestMessage,
  initialize as initializeData
} from './kaizten-data.js'
import {
  appContext
} from './kaizten-simulation.js'

let webSocket
let url
export let minRequiredTime
export let maxRequiredTime
export let numberOfNewMessages
export let numberOfUpdateMessages
export let numberOfRemoveMessages

export function initialize () {
  if (!webSocket || webSocket.readyState !== 1) {
    webSocket = new WebSocket('ws://localhost:8181', 'v10.stomp')
    // webSocket = new WebSocket("ws://192.168.1.35:8181", "v10.stomp");
    // webSocket = new WebSocket("ws://10.209.3.94:8181", "v10.stomp");
    // webSocket = new WebSocket("ws://10.209.3.94:8181", "v10.stomp");
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
  minRequiredTime = Math.min(minRequiredTime, min)
  maxRequiredTime = Math.max(maxRequiredTime, max)
}

export function setUp (urlServer) {
  url = urlServer
  minRequiredTime = Number.POSITIVE_INFINITY
  maxRequiredTime = Number.NEGATIVE_INFINITY
  numberOfNewMessages = 0
  numberOfUpdateMessages = 0
  numberOfRemoveMessages = 0
}

function onOpenHandler () {
  initializeData()
  appContext.initialize()
}

function onMessageHandler (e) {
  let message = JSON.parse(e.data)
  let type = message.type
  switch (type) {
    case 'new':
      numberOfNewMessages++
      onNewMessage(message)
      appContext.onNewAgentMessage(message)
      break
    case 'remove':
      numberOfRemoveMessages++
      onRemoveMessage(message)
      appContext.onRemoveAgentMessage(message)
      break
    case 'update':
      numberOfUpdateMessages++
      onUpdateMessage(message)
      appContext.onUpdateAgentMessage(message)
      break
    case 'end-request':
      onEndRequestMessage(message)
      break
    default:
      console.log('# ERROR: I have never heard of that shit!')
      console.log(message)
  }
}

function onCloseHandler () {
  console.log('======> onCloseHandler')
}
