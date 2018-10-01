import {
  minTime as minTimeData,
  maxTime as maxTimeData,
  minRequestedTime as leftTimeData,
  maxRequestedTime as rightTimeData,
  minTimeServer as serverMinTimeData,
  maxTimeServer as serverMaxTimeData
//} from 'node_modules/kaizten-realtime-js/src/kaizten-realtime-js/kaizten-data'
//} from 'kaizten-realtime-js/src/kaizten-data'
} from '../kaizten-store'
//} from 'kaizten-realtime-js/kaizten-data'
//} from 'kaizten-realtime-js/kaizten-data.js'
import {
  increment,
  appendRecordsToTimeline,
  getNumberOfTweens,
  getNumberOfTweensInTime,
  tweenLabels,
  timeFirstTween,
  timeLastTween,
  minRequestedTime as leftTimeGsap,
  maxRequestedTime as rightTimeGsap,
  timeline,
  onPlay
//} from 'kaizten-realtime-js/kaizten-gsap.js'
//} from 'kaizten-realtime-js/src/kaizten-gsap'
} from '../kaizten-gsap'
import {
  minRequiredTime,
  maxRequiredTime,
  numberOfNewMessages,
  numberOfRemoveMessages,
  numberOfUpdateMessages
//} from 'kaizten-realtime-js/kaizten-websockets.js'
//} from 'kaizten-realtime-js/src/kaizten-websockets'
} from '../kaizten-websockets'
import { 
  appendNewChild 
//} from 'kaizten-realtime-js/kaizten-dom.js'
//} from 'kaizten-realtime-js/src/kaizten-dom'
} from '../kaizten-dom'
import { 
  isDecimal 
//} from 'kaizten-realtime-js/kaizten-maths.js'
//} from 'kaizten-realtime-js/src/kaizten-maths.js'
} from '../kaizten-maths'

// Data:
let labelTime
let labelMinTimeData
let labelMaxTimeData
let labelLeftTimeData
let labelRightTimeData
let labelServerMinTimeData
let labelServerMaxTimeData
// WS:
let labelMinRequiredTime
let labelMaxRequiredTime
// GSAP:_
let labelIncrement
let labelFirstTween
let labelLastTween
let labelLeftTimeGsap
let labelRightTimeGsap
let labelTweenLabels
let labelProgress
//
let listTweens
let labelTweens
//
let listAgents
let labelNewMessages
let listMessages
let labelUpdateMessages
// Controls
var buttonTimeline
var buttonPlayPause
var buttonReverse
var buttonResume
var buttonRestart
var buttonSpeedDown
var buttonSpeedUp
var sliderTime
var textfieldSpeed

export function initialize () {
  updateStatistics()
  buttonPlayPause.disabled = false
  buttonReverse.disabled = true
  buttonResume.disabled = true
  buttonSpeedDown.disabled = false
  buttonSpeedUp.disabled = false
  sliderTime.value = sliderTime.min
  textfieldSpeed.disabled = true
  textfieldSpeed.value = '1'
}

export function setUp () {
  labelTime = document.getElementById('labelTime')
  labelMinTimeData = document.getElementById('labelMinTimeData')
  labelMaxTimeData = document.getElementById('labelMaxTimeData')
  labelLeftTimeData = document.getElementById('labelLeftTimeData')
  labelRightTimeData = document.getElementById('labelRightTimeData')
  labelServerMinTimeData = document.getElementById('labelServerMinTimeData')
  labelServerMaxTimeData = document.getElementById('labelServerMaxTimeData')
  labelMinRequiredTime = document.getElementById('labelMinRequiredTime')
  labelMaxRequiredTime = document.getElementById('labelMaxRequiredTime')
  //
  labelProgress = document.getElementById('labelProgress')
  //
  listAgents = document.getElementById('listNewMessages')
  labelNewMessages = document.getElementById('labelNewMessages')
  listMessages = document.getElementById('listUpdateMessages')
  labelUpdateMessages = document.getElementById('labelUpdateMessages')
  //
  labelIncrement = document.getElementById('labelIncrement')
  labelFirstTween = document.getElementById('labelFirstTween')
  labelLastTween = document.getElementById('labelLastTween')
  labelLeftTimeGsap = document.getElementById('labelLeftTimeGsap')
  labelRightTimeGsap = document.getElementById('labelRightTimeGsap')
  labelTweenLabels = document.getElementById('labelTweenLabels')
  listTweens = document.getElementById('listTweens')
  labelTweens = document.getElementById('labelTweens')
  //
  buttonTimeline = document.getElementById('button-timeline')
  buttonPlayPause = document.getElementById('button-play-pause')
  buttonReverse = document.getElementById('button-reverse')
  buttonResume = document.getElementById('button-resume')
  buttonRestart = document.getElementById('button-restart')
  buttonSpeedDown = document.getElementById('button-speed-down')
  buttonSpeedUp = document.getElementById('button-speed-up')
  sliderTime = document.getElementById('slider-time')
  textfieldSpeed = document.getElementById('textfield-speed')
  buttonPlayPause.addEventListener('click', play)
  buttonReverse.addEventListener('click', reverse)
  buttonResume.addEventListener('click', resume)
  buttonRestart.addEventListener('click', restart)
  sliderTime.addEventListener('slide', onChangeSliderTime)
}

export function handlerNewMessage (message) {
  let time = message.time
  let agent = message.agent
  let idLi = 'li_new_t' + time
  let idUl = 'ul_new_t' + time
  let idUlProperties = 'ul_new_t' + time
  let li = document.getElementById(idLi)
  if (li == null) {
    li = appendNewChild(listAgents, 'li', 't=' + time, idLi)
    appendNewChild(li, 'ul', undefined, idUl)
  }
  let ul = document.getElementById(idUl)
  let agentElement = appendNewChild(ul, 'li', 'id=' + agent.id, agent.id)
  let ulProperties = appendNewChild(agentElement, 'ul', undefined, idUlProperties)
  appendNewChild(ulProperties, 'li', 'x:' + agent.properties.x.toFixed(3))
  appendNewChild(ulProperties, 'li', 'y:' + agent.properties.y.toFixed(3))
  appendNewChild(ulProperties, 'li', 'width:' + agent.properties.width.toFixed(3))
  appendNewChild(ulProperties, 'li', 'height:' + agent.properties.height.toFixed(3))
  appendNewChild(ulProperties, 'li', 'color:' + agent.properties.color)
  //
  updateStatistics()
}

export function handlerRemoveMessage (message) {}

export function handlerUpdateMessage (message) {
  let time = message.time
  let id = message.change.id
  let properties = message.change.properties
  //
  let idLi = 'li_update_t' + time
  let idUl = 'ul_update_t' + time
  let idUlProperties = 'ul_update_t' + time
  let li = document.getElementById(idLi)
  if (li == null) {
    li = appendNewChild(listMessages, 'li', 't=' + time, idLi)
    appendNewChild(li, 'ul', undefined, idUl)
  }
  let ul = document.getElementById(idUl)
  let agentElement = appendNewChild(ul, 'li', 'id=' + id, id)
  //
  let ulProperties = appendNewChild(agentElement, 'ul', undefined, idUlProperties)
  for (var propertyName in properties) {
    // console.log(propertyName + ' -> ' + properties[propertyName])
    let text = '' + propertyName + ':'// + properties[propertyName]
    if (isDecimal(properties[propertyName])) {
      text = text + properties[propertyName].toFixed(3)
    } else {
      text = text + properties[propertyName]
    }
    appendNewChild(ulProperties, 'li', text)
  }
  //
  updateStatistics()
}

export function onUpdateTimeline () {
  updateStatistics()
  updateSliderTime()
}

function updateStatistics () {
  labelTime.innerHTML = (timeline === undefined)? '-' : timeline.time().toFixed(3)
  labelProgress.innerHTML = (timeline === undefined)? '-' : timeline.progress().toFixed(3)
  //
  labelMinTimeData.innerHTML = minTimeData
  labelMaxTimeData.innerHTML = maxTimeData
  labelLeftTimeData.innerHTML = leftTimeData
  labelRightTimeData.innerHTML = rightTimeData
  labelServerMinTimeData.innerText = serverMinTimeData
  labelServerMaxTimeData.innerText = serverMaxTimeData
  labelMinRequiredTime.innerHTML = minRequiredTime
  labelMaxRequiredTime.innerHTML = maxRequiredTime
  //
  labelNewMessages.innerHTML = numberOfNewMessages
  //
  labelUpdateMessages.innerHTML = numberOfUpdateMessages
  //
  labelIncrement.innerHTML = increment
  labelFirstTween.innerHTML = timeFirstTween
  labelLastTween.innerHTML = timeLastTween
  labelLeftTimeGsap.innerHTML = leftTimeGsap
  labelRightTimeGsap.innerHTML = rightTimeGsap
  labelTweenLabels.innerHTML = (tweenLabels === undefined)? '-' : tweenLabels.size
  labelTweens.innerHTML = '' + getNumberOfTweens()
}

function updateSliderTime () {
  sliderTime.value = timeline.progress() * 100
}

function play () {
  if (timeline.isActive()) {
    console.log('Pausing animation at ' + new Date().getTime())
    timeline.pause()
    buttonReverse.disabled = false
    buttonPlayPause.innerText = 'Play'
  } else {
    //
    console.log('Playing animation at ' + new Date().getTime())
    if (getNumberOfTweens() > 0) {
      console.log('Animation is ready')
      timeline.play()
    } else {
      console.log('Animation is NOT ready')
      onPlay(0, 6000)
    }
    updateStatistics()
    //
    buttonReverse.disabled = true
    buttonPlayPause.innerText = 'Pause'
    buttonRestart.disabled = false
  }
}

function reverse () {
  console.log('Playing animation at ' + new Date().getTime())
  timeline.reverse()
  buttonReverse.disabled = true
  buttonPlayPause.disabled = false
  buttonPlayPause.innerText = 'Pause'
}

function resume () {
  console.log('Resuming animation at ' + new Date().getTime())
  timeline.resume()
}

function restart () {
  console.log('Restarting animation at ' + new Date().getTime())
  timeline.restart()
}

function onChangeSliderTime () { // event, ui) {
  console.log(sliderTime.value)
  // textTime.innerHTML = sliderTime.value
  // tl.pause()
  // adjust the timeline's progress() based on slider value
  // tl.progress(sliderTime / 100)
}

export function onCompleteTimeline () {
  console.log('Timeline is complete')
  buttonPlayPause.disabled = true
  buttonReverse.disabled = false
}

export function onReverseCompleteTimeline () {
  console.log('Reverse timeline is complete')
  buttonPlayPause.disabled = false
  buttonPlayPause.innerText = 'Play'
  buttonReverse.disabled = true
}
