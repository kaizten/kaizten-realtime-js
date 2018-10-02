import {
  getDataInRange,
  maxTimeServer,
} from './kaizten-store.js'
import { appContext } from './kaizten-simulation.js'
import { TimelineMax } from 'gsap'
import * as Rx from "rxjs"



// Timeline
export let timeline
// Map whose key is a time with tween and its value is the set of tweens in that
// time.
export let tweenLabels
// Minimum time with tween
export let timeFirstTween = new Rx.BehaviorSubject()
// Maximum time with tween
export let timeLastTween = new Rx.BehaviorSubject()
// Minimum requested time to the server
export let minRequestedTime = new Rx.BehaviorSubject()
// Maximum requested time to the server
export let maxRequestedTime = new Rx.BehaviorSubject()
// Increment in the time when new data are requested
export const increment = 6000



export function initialize () {
  tweenLabels.clear()
  timeFirstTween.next(Number.POSITIVE_INFINITY)
  timeLastTween.next(Number.NEGATIVE_INFINITY)
  minRequestedTime.next(Number.POSITIVE_INFINITY)
  maxRequestedTime.next(Number.NEGATIVE_INFINITY)
}

export function setUp() {
  //console.log("Setup GSAP")
  //console.log(appContext)
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
  if ((time + increment) >= maxRequestedTime.value) {
    let minRequired = maxRequestedTime.value
    let maxRequired = minRequired + increment
    if (maxTimeServer.value !== Number.NEGATIVE_INFINITY) {
      maxRequired = Math.min(maxRequired, maxTimeServer.value)
    }
    if (minRequired <= maxRequired) {
      onPlay(minRequired, maxRequired)
    }
  }
}

export function onPlay(minRequired, maxRequired) {
  console.log('# GSAP Start Request: [' + minRequired + ', ' + maxRequired + ']')
  minRequestedTime.next(Math.min(minRequestedTime.value, minRequired))
  maxRequestedTime.next(Math.max(maxRequestedTime.value, maxRequired))
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
    let record = records[i]
    let time = record.time
    let type = record.type
    let previousTime = record.previousTime
    if (type === 'new') {
      record.events.forEach(function (properties, entityId, mapObj) {
        appContext.onNewProperty(time, previousTime, entityId, properties)
      })
    } else if (type === 'update') {
      record.events.forEach(function (properties, entityId, mapObj) {
        appContext.onUpdateProperty(time, previousTime, entityId, properties)
      })
    } else if (type === 'remove') {
      record.events.forEach(function (properties, entityId, mapObj) {
        appContext.onRemoveProperty(time, previousTime, entityId, properties)
      })
    }
  }
}

export function set(time, target, vars) {
  let label = getLabel(time)
  timeline.set(target, vars, label)
  let tweens = tweenLabels.has(label)? tweenLabels.get(label) + 1 : 1
  tweenLabels.set(label, tweens)
  timeFirstTween.next(Math.min(timeFirstTween.value, time))
  timeLastTween.next(Math.max(timeLastTween.value, time))
}

export function to(time, target, vars, duration) {
  let label = getLabel(time)
  timeline.to(target, duration, vars, label)
  let tweens = tweenLabels.has(label)? tweenLabels.get(label) + 1 : 1
  tweenLabels.set(label, tweens)
  timeFirstTween.next(Math.min(timeFirstTween.value, time))
  timeLastTween.next(Math.max(timeLastTween.value, time))
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
