import {
  getData,
  getDataInRange,
  minTimeServer,
  maxTimeServer,
  timeEventsQueue
} from './kaizten-data.js'
import { randomPointInt } from './kaizten-maths.js'
import { appContext } from './kaizten-simulation.js'
import { TimelineMax } from 'gsap'

// Timeline
export let timeline
// Map whose key is a time with tween and its value is the set of tweens in that
// time.
export let tweenLabels
// Minimum time with tween
export let timeFirstTween
// Maximum time with tween
export let timeLastTween
// Minimum requested time to the server
export let minRequestedTime
// Maximum requested time to the server
export let maxRequestedTime
// Increment in the time when new data are requested
export const increment = 6000

export function initialize () {
  tweenLabels.clear()
  timeFirstTween = Number.POSITIVE_INFINITY
  timeLastTween = Number.NEGATIVE_INFINITY
  minRequestedTime = Number.POSITIVE_INFINITY
  maxRequestedTime = Number.NEGATIVE_INFINITY
}

export function setUp() {
  timeline = new TimelineMax({
    paused: true,
    onUpdate: appContext.onUpdate,
    onComplete: appContext.onComplete,
    onReverseComplete: appContext.onReverseComplete
  })
  tweenLabels = new Map()
}

export function onUpdateTimeline () {
  let time = timeline.time() * 1000
  if ((time + increment) >= maxRequestedTime) {
    let minRequired = maxRequestedTime
    let maxRequired = minRequired + increment
    if (maxTimeServer !== Number.NEGATIVE_INFINITY) {
      maxRequired = Math.min(maxRequired, maxTimeServer)
    }
    if (minRequired <= maxRequired) {
      onPlay(minRequired, maxRequired)
    }
  }
}

export function onPlay(minRequired, maxRequired) {
  console.log('# GSAP Start Request: [' + minRequired + ', ' + maxRequired + ']')
  minRequestedTime = Math.min(minRequestedTime, minRequired)
  maxRequestedTime = Math.max(maxRequestedTime, maxRequired)
  let request = getDataInRange(minRequired, maxRequired)
  request.then((response) => {
    console.log('# GSAP End Request [' + minRequired + ', ' + maxRequired + '] -> [' + response.min + ', ' + response.max + ']: ' + response.records.length)
    appendRecordsToTimeline(response.records)
    timeline.play()
  }, failureMessage => {
    console.log('ERRORAZO! ' + failureMessage);
  })
}

export function appendRecordsToTimeline (records) {
  for (var i = 0; i < records.length; i++) {
    let data = records[i]
    let time = data.time
    let type = data.type
    let previousTime = data.previousTime
    if (type === 'new') {
      data.events.forEach(function (properties, agentId, mapObj) {
        appContext.onNewProperty(time, previousTime, agentId, properties)
      })
    } else if (type === 'update') {
      data.events.forEach(function (properties, agentId, mapObj) {
        appContext.onUpdateProperty(time, previousTime, agentId, properties)
      })
    } else if (type === 'remove') {
      data.events.forEach(function (properties, agentId, mapObj) {
        appContext.onRemoveProperty(time, previousTime, agentId, properties)
      })
    }
  }
}

export function set(time, target, vars) {
  let label = getLabel(time)
  timeline.set(target, vars, label)
  let tweens = tweenLabels.has(label)? tweenLabels.get(label) + 1 : 1
  tweenLabels.set(label, tweens)
  timeFirstTween = Math.min(timeFirstTween, time)
  timeLastTween = Math.max(timeLastTween, time)
}

export function to(time, target, vars, duration) {
  let label = getLabel(time)
  timeline.to(target, duration, vars, label)
  let tweens = tweenLabels.has(label)? tweenLabels.get(label) + 1 : 1
  tweenLabels.set(label, tweens)
  timeFirstTween = Math.min(timeFirstTween, time)
  timeLastTween = Math.max(timeLastTween, time)
}

export function removeAtLabel (timeline, label) {
  var labelTime = timeline.getLabelTime(label)
  var children = timeline.getChildren(false, true, true, labelTime) // nested, tweens, timelines, ignoreBeforeTime
  for (var i = 0; i < children.length; i++) {
    if (children[i].startTime() === labelTime) { // ANTES ERA UN == Y NO ===
      console.log('found a tween to remove at ' + label + ' label')
      timeline.remove(children[i])
    }
  }
}

export function getNumberOfTweens () {
  return (timeline !== undefined)? timeline.getChildren().length : 0
}

export function getNumberOfTweensInTime (time) {
  console.log(getLabel(time) + " -> " + tweenLabels.get(getLabel(time)))
  return tweenLabels.get(getLabel(time))
}

export function getLabel (time) {
  return 'label_' + time
}

function pause () {
  console.log('Pausing animation at ' + new Date().getTime())
  timeline.pause()
}

function logStart () {
  console.log('Starting animation at ' + new Date().getTime())
}

function logFinish () {
  console.log('Finishing animation at ' + new Date().getTime())
}
