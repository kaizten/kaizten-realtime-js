import { KaiztenAdapter } from './kaizten-adapter'

let queue = []
let taskInProcess = false

function enqueue(task) {
    queue.push(task)
}

function dequeue() {
    if (queue.length && !taskInProcess) {
        taskInProcess = true
        queue[0]()
    }
}

function queueTask(task) {
    if (!queue.length) {
        enqueue(task)
        dequeue()
    } else {
        enqueue(task)
    }
}

function createTask(fn) {
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

/**
 * xxx
 * @extends KaiztenAdapter
 */
export class KaiztenMemoryAdapter extends KaiztenAdapter {

    /**
     * 
     */
    store

    /**
     * 
     * @param {*} store 
     */
    constructor(store) {
        super()
        this.store = store
    }

    /**
     * 
     */
    initialize() {
        super.initialize()
        this.store.initialize()
    }

    /**
     * 
     */
    setUp() {
        super.setUp()
        this.store.setUp()
    }

    /**
     * 
     * @param {*} time 
     */
    get(time) {
        return createTask((resolve, reject) => {
            queueTask(() => {
                let data = this.store.getData(time)
                resolve(data)
            })
        })
    }

    /**
     * 
     * @param {*} minTime 
     * @param {*} maxTime 
     */
    contains(minTime, maxTime) {
        return this.store.contains(minTime, maxTime)
    }

    /**
     * 
     * @param {*} minTime 
     * @param {*} maxTime 
     */
    get(minTime, maxTime) {
        return this.store.getDataInRange(minTime, maxTime)
    }

    /**
     * 
     */
    getMinTime() {
        return this.store.minTime
    }

    /**
     * 
     */
    getMaxTime() {
        return this.store.maxTime
    }

    /**
     * 
     */
    getStartTime() {
        return this.store.startTime
    }

    /**
     * 
     */
    getEndTime() {
        return this.store.endTime
    }

    /**
     * 
     * @param {*} time 
     * @param {*} id 
     * @param {*} properties 
     */
    newEntity(time, id, properties) {
        return createTask((resolve, reject) => {
            queueTask(() => {
                this.store.newEntity(time, id, properties)
                resolve()
            })
        })
    }


    /**
     * 
     * @param {*} time 
     * @param {*} id 
     */
    removeEntity(time, id) {
        return createTask((resolve, reject) => {
            queueTask(() => {
                this.store.removeEntity(time, id)
                resolve()
            })
        })
    }

    /**
     * 
     * @param {*} time 
     * @param {*} id 
     * @param {*} properties 
     */
    updateEntity(time, id, properties) {
        return createTask((resolve, reject) => {
            queueTask(() => {
                this.store.updateEntity(time, id, properties)
                resolve()
            })
        })
    }

    /**
     * 
     * @param {*} minRequired 
     * @param {*} maxRequired 
     * @param {*} min 
     * @param {*} max 
     * @param {*} error 
     */
    onEndRequestMessage(minRequired, maxRequired, min, max, error) {
        return createTask((resolve, reject) => {
            queueTask(() => {
                this.store.onEndRequestMessage(minRequired, maxRequired, min, max, error)
                resolve()
            })
        })
    }

    /**
     * 
     */
    log() {
        this.store.log()
    }
}