/**
 * 
 */
export class KaiztenAdapter {

    /**
     * 
     */
    constructor() { }

    /**
     * 
     */
    initialize() { }

    /**
     * 
     */
    setUp() { }

    /**
     * 
     */
    log() { }

    /**
     * 
     * @param {*} minTime 
     * @param {*} maxTime 
     */
    contains(minTime, maxTime) { }

    /**
     * 
     * @param {*} time 
     */
    get(time) { }

    /**
     * 
     * @param {*} minTime 
     * @param {*} maxTime 
     */
    get(minTime, maxTime) { }

    /**
     * 
     */
    getMinTime() { }

    /**
     * 
     */
    getMaxTime() { }

    /**
     * 
     */
    getStartTime() { }

    /**
     * 
     */
    getEndTime() { }

    /**
     * 
     * @param {*} time 
     * @param {*} id 
     * @param {*} properties 
     */
    newEntity(time, id, properties) { }

    /**
     * 
     * @param {*} time 
     * @param {*} id 
     */
    removeEntity(time, id) { }

    /**
     * 
     * @param {*} time 
     * @param {*} id 
     * @param {*} properties 
     */
    updateEntity(time, id, properties) { }

    /**
     * 
     * @param {*} minRequired 
     * @param {*} maxRequired 
     * @param {*} min 
     * @param {*} max 
     * @param {*} error 
     */
    onEndRequestMessage(minRequired, maxRequired, min, max, error) { }
}