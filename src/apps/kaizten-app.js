/**
 * 
 */
export class KaiztenApp {

    /**
     * 
     */
    kaiztenSimulation
    /**
     * 
     */
    parentApp
    /**
     * 
     */
    apps

    /**
     * 
     */
    constructor() {
        this.kaiztenSimulation = null
        this.parentApp = null
        this.apps = []
    }

    /**
     * 
     * @param {*} app 
     */
    addChildApp(app) {
        app.setParentApp(this)
        this.apps.push(app)
    }

    /**
     * 
     * @param {*} app 
     */
    setParentApp(app) {
        this.parentApp = app
    }

    /**
     * 
     */
    initialize() { }

    /**
     * 
     * @param {*} simulation 
     */
    setUp(simulation) {
        this.kaiztenSimulation = simulation
    }

    /**
     * 
     * @param {*} message 
     */
    handlerNewMessage(message) {
        for (let i = 0; i < this.apps.length; i++) {
            this.apps[i].handlerNewMessage(message)
        }
    }

    /**
     * 
     * @param {*} message 
     */
    handlerRemoveMessage(message) {
        for (let i = 0; i < this.apps.length; i++) {
            this.apps[i].handlerRemoveMessage(message)
        }
    }

    /**
     * 
     * @param {*} message 
     */
    handlerUpdateMessage(message) {
        for (let i = 0; i < this.apps.length; i++) {
            this.apps[i].handlerUpdateMessage(message)
        }
    }

    /**
     * 
     * @param {*} message 
     */
    handlerEndRequestMessage(message) {
        for (let i = 0; i < this.apps.length; i++) {
            this.apps[i].handlerEndRequestMessage(message)
        }
    }
}