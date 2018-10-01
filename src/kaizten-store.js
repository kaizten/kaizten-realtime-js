import {
  requestDataToServer as requestDataToServerWS,
} from './kaizten-websockets.js'
import * as Rx from "rxjs"

export let timeEventsQueue
export let structure

// Minimum time with data
export let minTime = new Rx.BehaviorSubject()
// Maximum time with data
export let maxTime = new Rx.BehaviorSubject()
// Minimum requested time to the server
export let minRequestedTime = new Rx.BehaviorSubject()
// Maximum requested time to the server
export let maxRequestedTime = new Rx.BehaviorSubject()
// Minimum time with data in server
export let minTimeServer = new Rx.BehaviorSubject()
// Maximum time with data in server
export let maxTimeServer = new Rx.BehaviorSubject()
// min-max -> promise
export let requests
// min-max -> resolve
export let waiting

export function initialize () {
  timeEventsQueue = new Map()
  structure = []
  //
  requests = new Map()
  waiting = new Map()
  //
  minTime.next(Number.POSITIVE_INFINITY)
  maxTime.next(Number.NEGATIVE_INFINITY)
  minRequestedTime.next(Number.POSITIVE_INFINITY)
  maxRequestedTime.next(Number.NEGATIVE_INFINITY)
  minTimeServer.next(Number.POSITIVE_INFINITY)
  maxTimeServer.next(Number.NEGATIVE_INFINITY)
}

export function setUp () {

}

export function printEvents () {
  for (var [key, value] of timeEventsQueue) {
    console.log(key)
    for (var [key2, value2] of value) {
      // console.log('\t' + key2 + ' = ' + JSON.stringify(value2.properties));
      console.log('\t' + key2 + ' = ' + Object.keys(value2.properties))
      // console.dir(value2.properties);
    }
  }
}

export function getData (time) {
  for (let i = 0; i < structure.length; i++) {
    if (structure[i].time === time) {
      return structure[i]
    }
  }
  return null
}

/*
It provides a promise to be resolved when the data are available. In that case
in which data are already stored, the promise is immidiately resolved. Otherwise,
the data are requested to the server.

Input:
   min: minimum time with data (inclusive).
   max: maximum time with data (inclusive).
Output:
   Promise to be resolved when the data are available. Data are included into
   the resolve as an array.
*/
export function getDataInRange (min, max) {
  let key = "" + min + "-" + max
  let promise = new Promise((resolve, reject) => {
    if (minTimeServer.value !== Number.POSITIVE_INFINITY) {
      min = Math.max(min, minTimeServer.value)
    }
    if (maxTimeServer.value !== Number.NEGATIVE_INFINITY) {
      max = Math.min(max, maxTimeServer.value)
    }
    if ((min >= minRequestedTime.value) && (max <= maxRequestedTime.value)) {
      let response = {
        min: min,
        max: max,
        records: []
      }
      for (let i = 0; i < structure.length; i++) {
        let data = structure[i]
        let time = data.time
        if ((time >= min) && (time <= max)) {
          response.records.push(data)
        }
      }
      resolve(response)
    } else {
      console.log('# Data Start Request: [' + min + ', ' + max + ']')
      if ((maxRequestedTime.value !== Number.NEGATIVE_INFINITY) && (max > maxRequestedTime.value)) {
        min = maxRequestedTime.value + 0.1
      }
      minRequestedTime.next(Math.min(minRequestedTime.value, min))
      maxRequestedTime.next(Math.max(maxRequestedTime.value, max))
      requestDataToServerWS(min, max)
      key = "" + min + "-" + max
      waiting.set(key, resolve)
    }
  })
  requests.set(key, promise)
  return promise
}

export function onNewMessage(message) {
  let time = message.time
  let entity = message.entity
  let entityId = entity.id
  let properties = entity.properties
  // console.log("ID=" + entityId + " PROPERTIES: " + JSON.stringify(properties))
  let data = getData(time)
  if (data == null) {
    data = {}
    data.time = time
    data.type = 'new'
    data.previousTime = (structure.length > 0)? structure[structure.length - 1].time : -1
    data.events = new Map()
    structure.push(data)
    //console.log("# New time: " + data.time + " previous: " + data.previousTime)
  }
  data.events.set(entityId, properties)
  timeEventsQueue.set(time, data.properties)
  //
  minTime.next(Math.min(minTime.value, time))
  maxTime.next(Math.max(maxTime.value, time))
}

export function onRemoveMessage (message) {
  minTime.next(Math.min(minTime.value, time))
  maxTime.next(Math.max(maxTime.value, time))
}

export function onUpdateMessage (message) {
  let time = message.time
  let entityId = message.change.id
  let properties = message.change.properties
  let data = getData(time)
  if (data == null) {
    data = {}
    data.time = time
    data.type = 'update'
    data.previousTime = (structure.length > 0)? structure[structure.length - 1].time : -1
    data.events = new Map()
    structure.push(data)
    //console.log("# Update time: " + data.time + " previous: " + data.previousTime)
  }
  data.events.set(entityId, properties)
  timeEventsQueue.set(time, data.events)
  //
  minTime.next(Math.min(minTime.value, time))
  maxTime.next(Math.max(maxTime.value, time))
}

export function onEndRequestMessage (message) {
  let minRequired = message.minRequired
  let maxRequired = message.maxRequired
  //let min = message.min
  //let max = message.max
  //minTimeServer = Math.min(minTimeServer, message.min)
  //maxTimeServer = Math.max(maxTimeServer, message.max)
  if (!message.hasOwnProperty('error')) {
    let min = message.minRequired
    let max = message.maxRequired
    /*if (message.hasOwnProperty('min')) {
      minTimeServer = message.min
      min = minTimeServer
    }*/
    if (message.hasOwnProperty('max')) {
      minTimeServer.next(0)
      maxTimeServer.next(message.max)
      max = maxTimeServer.value
    }
    console.log('# Data End Request: [' + minRequired + ', ' + maxRequired + '] -> [' + min + ', ' + max + ']')
    let key = "" + minRequired + "-" + maxRequired
    let promise = requests.get(key)
    let resolve = waiting.get(key)
    let response = {
      min: min,
      max: max,
      records: []
    }
    for (let i = 0; i < structure.length; i++) {
      let data = structure[i]
      let time = data.time
      if ((time >= min) && (time <= max)) {
        response.records.push(data)
      }
    }
    requests.delete(key)
    waiting.delete(key)
    resolve(response)
  } else {
    let error = message.error
    console.log('# End request: there was an error [' + minRequired + ', ' + maxRequired + '] -> [' + min + ', ' + max + ']')
  }
}
