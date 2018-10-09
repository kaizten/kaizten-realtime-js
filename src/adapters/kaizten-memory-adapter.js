//import { utils } from 'js-data'
import { KaiztenAdapter } from './kaizten-adapter'
import {
    onEndRequestMessage,
    setUp as setUpStore,
    initialize as initializeStore,
    log as logStore,
    getData as getDataStore,
    getDataInRange as getDataRangeStore,
    newEntity as newEntityStore,
    removeEntity as removeEntityStore,
    updateEntity as updateEntityStore,
    //
    minTime,
    maxTime,
    minRequestedTime,
    maxRequestedTime,
    minTimeServer,
    maxTimeServer,
} from '../store/kaizten-memory'

let queue = []
let taskInProcess = false

function enqueue (task) {
    queue.push(task)
}

function dequeue () {
    if (queue.length && !taskInProcess) {
        taskInProcess = true
        queue[0]()
    }
}

function queueTask (task) {
    if (!queue.length) {
        enqueue(task)
        dequeue()
    } else {
        enqueue(task)
    }
}

function createTask (fn) {
    /*return new Promise(fn).then(function (result) {
        taskInProcess = false
        queue.shift()
        setTimeout(dequeue, 0)
        return result
    }, function (err) {
        taskInProcess = false
        queue.shift()
        setTimeout(dequeue, 0)
        return utils.reject(err)
    })*/
    return new Promise(fn).then(function (result) {
        taskInProcess = false
        queue.shift()
        setTimeout(dequeue, 0)
        return result
    }, function (err) {
        taskInProcess = false
        queue.shift()
        setTimeout(dequeue, 0)
        //return utils.reject(err)
        return Promise.resolve(err)
    })
}

export class KaiztenMemoryAdapter extends KaiztenAdapter {

    constructor (options) {
        super(options)
    }

    initialize () {
        super.initialize()
        initializeStore()
    }

    setUp () {
        super.setUp()
        setUpStore()
    }

    get (time) {
        return createTask((resolve, reject) => {
            queueTask(() => {
                let data = getDataStore(time)
                resolve(data)
            })
        })
    }

    get (minTime, maxTime) {
        return getDataRangeStore(minTime, maxTime)
    }

    getMinTime() { 
        return minTime
    }

    getMaxTime() {
        return maxTime
    }

    getMinRequestedTimeData() {
        return minRequestedTime
    }

    getMaxRequestedTimeData() {
        return maxRequestedTime
    }

    getMinTimeServer () { 
        return minTimeServer
    }

    getMaxTimeServer () {
        return maxTimeServer
    }

    newEntity (time, id, properties) {
        return createTask((resolve, reject) => {
            queueTask(() => {
                newEntityStore(time, id, properties)
                resolve()
            })
        })
    }

    removeEntity (time, id) {
        return createTask((resolve, reject) => {
            queueTask(() => {
                removeEntityStore(time, id)
                resolve()
            })
        })
    }

    updateEntity (time, id, properties) {
        return createTask((resolve, reject) => {
            queueTask(() => {
                updateEntityStore(time, id, properties)
                resolve()
            })
        })
    }

    onEndRequestMessage (minRequired, maxRequired, min, max, error) {
        return createTask((resolve, reject) => {
            queueTask(() => {
                onEndRequestMessage(minRequired, maxRequired, min, max, error)
                resolve()
            })
        })
    }
    
    log () {
        logStore()
    }
}