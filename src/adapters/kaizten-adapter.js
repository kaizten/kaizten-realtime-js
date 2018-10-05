export class KaiztenAdapter {

    constructor (options) { }

    initialize () { }

    setUp () { }

    log () { }

    get (time) { }

    get (minTime, maxTime) { }

    getMinTime() { }

    getMaxTime() { }

    getMinRequestedTimeData() { }

    getMaxRequestedTimeData() { }

    getMinTimeServer () { }

    getMaxTimeServer () { }

    newEntity (time, id, properties) { }

    removeEntity (time, id) { }

    updateEntity (time, id, properties) { }

    onEndRequestMessage (minRequired, maxRequired, min, max, error) { }
}