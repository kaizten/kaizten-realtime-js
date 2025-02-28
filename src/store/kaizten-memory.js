import * as Rx from 'rxjs'

/**
 * xxx
 */
export class KaiztenMemory {

    /**
     * sss
     */
    timeEventsQueue
    /**
     * 
     */
    structure
    /**
     * Minimum time with data
     */ 
    minTime
    /**
     * Maximum time with data
     */
    maxTime
    /**
     * Start time
     */
    startTime
    /**
     * End time
     */
    endTime

    /**
     * 
     */
    constructor() {
        this.minTime = new Rx.BehaviorSubject()
        this.maxTime = new Rx.BehaviorSubject()
        this.startTime = new Rx.BehaviorSubject()
        this.endTime = new Rx.BehaviorSubject()
    }

    /**
     * 
     */
    initialize() {
        let promise = new Promise((resolve, reject) => {
            this.timeEventsQueue = new Map()
            this.structure = []
            this.minTime.next(Number.POSITIVE_INFINITY)
            this.maxTime.next(Number.NEGATIVE_INFINITY)
            this.startTime.next(Number.POSITIVE_INFINITY)
            this.endTime.next(Number.NEGATIVE_INFINITY)
            resolve()
        })
        return promise
    }

    /**
     * 
     */
    setUp() { }

    /**
     * 
     */
    log() {
        for (var [key, value] of this.timeEventsQueue) {
            console.log(key)
            for (var [key2, value2] of value) {
                // console.log('\t' + key2 + ' = ' + JSON.stringify(value2.properties));
                console.log('\t' + key2 + ' = ' + Object.keys(value2.properties))
                // console.dir(value2.properties);
            }
        }
    }

    /**
     * 
     * @param {*} time 
     */
    getData(time) {
        for (let i = 0; i < this.structure.length; i++) {
            if (this.structure[i].time === time) {
                return this.structure[i]
            }
        }
        return null
    }

    /**
     * 
     * @param {*} min 
     * @param {*} max 
     */
    contains(min, max) {
        let promise = new Promise((resolve, reject) => {
            if ((min >= this.startTime.value) && (max <= this.endTime.value)) {
                resolve()
            } else {
                reject()
            }
        })
        return promise
    }

    /**
     * It provides a promise to be resolved when the data are available.
     * @param {number} min - Minimum time with data (inclusive).
     * @param {number} max - Maximum time with data (inclusive).
     * @return {Promise} Promise to be resolved when the data are available. Data are included into     *   the resolve as an array.
     */
    getDataInRange(min, max) {
        let promise = new Promise((resolve, reject) => {
            //console.log("["+this.minTime.value + ", " + this.maxTime.value + "] " + "["+this.minTimeServer.value + ", " + maxTimeServer.value + "] " + min + " - " + max)
            if ((min >= this.startTime.value) && (max <= this.endTime.value)) {
                let response = {
                    min: min,
                    max: max,
                    records: []
                }
                for (let i = 0; i < this.structure.length; i++) {
                    let data = this.structure[i]
                    let time = data.time
                    if ((time >= min) && (time <= max)) {
                        response.records.push(data)
                    }
                }
                resolve(response)
            } else {
                reject()
            }
        })
        return promise
    }

    /**
     * 
     * @param {*} time 
     * @param {*} entityId 
     * @param {*} properties 
     */
    newEntity(time, entityId, properties) {
        //console.log("newEntity: " + time)
        let data = this.getData(time)
        if (data == null) {
            data = {}
            data.time = time
            data.type = 'new'
            data.previousTime = (this.structure.length > 0) ? this.structure[this.structure.length - 1].time : -1
            data.events = new Map()
            this.structure.push(data)
            //console.log("# New time: " + data.time + " previous: " + data.previousTime)
        }
        data.events.set(entityId, properties)
        this.timeEventsQueue.set(time, data.properties) // CREO QUE ES UN ERROR
        this.minTime.next(Math.min(this.minTime.value, time))
        this.maxTime.next(Math.max(this.maxTime.value, time))
    }

    /**
     * 
     * @param {*} time 
     * @param {*} id 
     */
    removeEntity(time, id) {
        //console.log("removeEntity: " + time)
        //this.minTime.next(Math.min(this.minTime.value, time))
        //this.maxTime.next(Math.max(this.maxTime.value, time))
    }

    /**
     * 
     * @param {*} time 
     * @param {*} entityId 
     * @param {*} properties 
     */
    updateEntity(time, entityId, properties) {
        //console.log("updateEntity: " + time)
        let data = this.getData(time)
        if (data == null) {
            data = {}
            data.time = time
            data.type = 'update'
            data.previousTime = (this.structure.length > 0) ? this.structure[this.structure.length - 1].time : -1
            data.events = new Map()
            this.structure.push(data)
        }
        data.events.set(entityId, properties)
        this.timeEventsQueue.set(time, data.events)
        this.minTime.next(Math.min(this.minTime.value, time))
        this.maxTime.next(Math.max(this.maxTime.value, time))
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
        if (error === undefined) {
            this.startTime.next(Math.min(this.startTime.value, minRequired))
            this.endTime.next(Math.max(this.endTime.value, maxRequired))
            /*min = minRequired
            if (max !== undefined) {
            minTimeServer.next(0)
            maxTimeServer.next(max)
            max = maxTimeServer.value
            } else {
            max = maxRequired
            }*/
            console.log('# Data End Request: [' + minRequired + ', ' + maxRequired + '] -> [' + min + ', ' + max + ']')
        } else {
            console.log('# End request: there was an error [' + minRequired + ', ' + maxRequired + '] -> [' + min + ', ' + max + ']')
        }
    }
}