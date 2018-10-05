export class KaiztenObjectRelationalMappingHandler {

    adapters

    constructor (options) {
        this.adapters = []
    }

    registerAdapter (adapter) {
        this.adapters.push(adapter)
    }

    setUp () {
        this.adapters.forEach(adapter => {
            adapter.setUp()
        })
    }

    initialize () {
        this.adapters.forEach(adapter => {
            adapter.initialize()
        })
    }

    log () {
        this.adapters.forEach(adapter => {
            adapter.log()
        })
    }

    get (time) {
        let adapter = this.adapters[0]
        return adapter.get(time)
    }

    get (minTime, maxTime) {
        let adapter = this.adapters[0]
        return adapter.get(minTime, maxTime)
    }

    getMinTime() {
        let adapter = this.adapters[0]
        return adapter.getMinTime()
    }

    getMaxTime() {
        let adapter = this.adapters[0]
        return adapter.getMaxTime()
    }

    getMinRequestedTimeData() {
        let adapter = this.adapters[0]
        return adapter.getMinRequestedTimeData()
    }

    getMaxRequestedTimeData() {
        let adapter = this.adapters[0]
        return adapter.getMaxRequestedTimeData()
    }

    getMinTimeServer() {
        let adapter = this.adapters[0]
        return adapter.getMinTimeServer()
    }

    getMaxTimeServer() {
        let adapter = this.adapters[0]
        return adapter.getMaxTimeServer()
    }

    newEntity (time, id, properties) {
        let adapter = this.adapters[0]
        adapter.newEntity(time, id, properties)
    }

    removeEntity (time, id) { 
        let adapter = this.adapters[0]
        adapter.removeEntity(time, id)
    }

    updateEntity (time, id, properties) { 
        let adapter = this.adapters[0]
        adapter.updateEntity(time, id, properties)
    }

    onEndRequestMessage (minRequired, maxRequired, min, max, error) {
        let adapter = this.adapters[0]
        adapter.onEndRequestMessage(minRequired, maxRequired, min, max, error)
    }
}