import {
  initialize as initializePixi,
  setUp as setUpPixi,
  handlerNewMessage  as handlerNewMessagePixi,
  handlerRemoveMessage  as handlerRemoveMessagePixi,
  handlerUpdateMessage as handlerUpdateMessagePixi,
  handlerNewProperty as handlerNewPropertyPixi,
  handlerUpdateProperty as handlerUpdatePropertyPixi,
  handlerRemoveProperty as handlerRemovePropertyPixi,
} from './kaizten-pixi.js'
import {
  initialize as initializeUi,
  setUp as setUpUi,
  handlerNewMessage  as handlerNewMessageUi,
  handlerRemoveMessage  as handlerRemoveMessageUi,
  handlerUpdateMessage as handlerUpdateMessageUi,
  onUpdateTimeline as onUpdateTimelineUi
} from './kaizten-ui.js'
import {
  initialize as initializeGsap,
  setUp as setUpGsap,
  onUpdateTimeline as onUpdateTimelineGsap
//} from 'kaizten-gsap.js'
} from 'kaizten-realtime-js/src/kaizten-gsap'

export function initialize () {
  initializePixi()
  initializeGsap()
  //initializeUi()
}

export function setUp () {
  setUpPixi()
  setUpGsap()
  //setUpUi()
}

export function handlerNewMessage (message) {
  handlerNewMessagePixi(message)
  //handlerNewMessageUi(message)
}

export function handlerRemoveMessage (message) {
  handlerRemoveMessagePixi(message)
  //handlerRemoveMessageUi(message)
}

export function handlerUpdateMessage (message) {
  handlerUpdateMessagePixi(message)
  //handlerUpdateMessageUi(message)
}

export function handlerNewProperty (time, previousTime, id, properties) {
  handlerNewPropertyPixi(time, previousTime, id, properties)
}

export function handlerRemoveProperty (time, previousTime, id, properties) {
  handlerRemovePropertyPixi(time, previousTime, id, properties)
}

export function handlerUpdateProperty (time, previousTime, id, properties) {
  handlerUpdatePropertyPixi(time, previousTime, id, properties)
}

export function onUpdateTimeline () {
  onUpdateTimelineGsap()
  //onUpdateTimelineUi()
}
