/**
 * 
 */
export class KaiztenObjectRelationalMappingHandler {

    /**
     * 
     */
    adapters

    /**
     * 
     * @param {*} options 
     */
    constructor(options) {
        this.adapters = []
    }

    /**
     * 
     * @param {*} adapter 
     */
    registerAdapter(adapter) {
        this.adapters.push(adapter)
    }

    /**
     * 
     */
    setUp() {
        this.adapters.forEach(adapter => {
            adapter.setUp()
        })
    }

    /**
     * 
     */
    initialize() {
        this.adapters.forEach(adapter => {
            adapter.initialize()
        })
    }

    /**
     * 
     */
    log() {
        this.adapters.forEach(adapter => {
            adapter.log()
        })
    }

    /**
     * 
     * @param {*} minTime 
     * @param {*} maxTime 
     */
    contains(minTime, maxTime) {
        return this.adapters[0].contains(minTime, maxTime)
    }

    /**
     * 
     * @param {*} time 
     */
    get(time) {
        return this.adapters[0].get(time)
    }

    /**
     * 
     * @param {*} minTime 
     * @param {*} maxTime 
     */
    get(minTime, maxTime) {
        return this.adapters[0].get(minTime, maxTime)
    }

    /**
     * 
     */
    getMinTime() {
        return this.adapters[0].getMinTime()
    }

    /**
     * 
     */
    getMaxTime() {
        return this.adapters[0].getMaxTime()
    }

    /**
     * 
     */
    getStartTime() {
        return this.adapters[0].getStartTime()
    }

    /**
     * 
     */
    getEndTime() {
        return this.adapters[0].getEndTime()
    }

    /**
     * 
     * @param {*} time 
     * @param {*} id 
     * @param {*} properties 
     */
    newEntity(time, id, properties) {
        this.adapters[0].newEntity(time, id, properties)
    }

    /**
     * 
     * @param {*} time 
     * @param {*} id 
     */
    removeEntity(time, id) {
        this.adapters[0].removeEntity(time, id)
    }
    
    /**
     * 
     * @param {*} time 
     * @param {*} id 
     * @param {*} properties 
     */
    updateEntity(time, id, properties) {
        this.adapters[0].updateEntity(time, id, properties)
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
        this.adapters[0].onEndRequestMessage(minRequired, maxRequired, min, max, error)
    }
}