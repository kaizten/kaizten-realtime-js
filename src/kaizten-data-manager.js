import { KaiztenWebSockets } from './kaizten-websockets.js'
import * as Rx from 'rxjs'

/**
 * 
 */
export class KaiztenDataManager {

    /**
     * 
     */
    status
    /**
     * 
     */
    kaiztenWebSockets
    /**
     * 
     */
    orm
    /**
     * 
     */
    apps

    /**
     * 
     */
    constructor() {
        this.orm = null
        this.apps = []
        this.status = new Rx.BehaviorSubject()
        this.kaiztenWebSockets = new KaiztenWebSockets()
    }

    /**
     * 
     * @param {*} app 
     */
    register(app) {
        this.apps.push(app)
    }

    /**
     * 
     * @param {*} orm 
     */
    setOrm(orm) {
        this.orm = orm
    }

    /**
     * 
     */
    setUp() {
        console.log("data-manager: setUp")
        let that = this
        this.status.next('not ready')
        this.kaiztenWebSockets.setUp()
        this.kaiztenWebSockets.newMessage.subscribe(message => {
            if (message) {
                that.handlerNewMessage(message)
            }
        })
        this.kaiztenWebSockets.removeMessage.subscribe(message => {
            if (message) {
                that.handlerRemoveMessage(message)
            }
        })
        this.kaiztenWebSockets.updateMessage.subscribe(message => {
            if (message) {
                that.handlerUpdateMessage(message)
            }
        })
        this.kaiztenWebSockets.endRequestMessage.subscribe(message => {
            if (message) {
                that.handlerEndRequestMessage(message)
            }
        })
        this.orm.setUp()
        const promisesSetUp = []
        for (let i = 0; i < this.apps.length; i++) {
            let promise = this.apps[i].setUp(this)
            promisesSetUp.push(promise)
        }

        Promise.all(promisesSetUp).then(that.onSetUp())
    }

    /**
     * 
     * @param {*} url 
     */
    async connect(url) {
        console.log("data-manager: connect")
        await this.kaiztenWebSockets.connect(url)
        this.status.next('connected')
    }

    /**
     * 
     */
    async disconnect() {
        console.log("data-manager: disconnect")
        await this.kaiztenWebSockets.disconnect()
        this.status.next('ready')
    }

    /**
     * REALMENTE NO DEBERIA DEVOLVER UN PROMISE. SI LOS DATOS ESTAN EN STORE
     * HABRIA QUE LLAMAR AL HANDLER CORRESPONDIENTE DE LAS APPS CONVIRTIENDO LA 
     * INFORMACION DEVUELTA POR EL STORE EN MENSAJES TRADICIONALES
     * @param {number} min Minimum time
     * @param {number} max Maximum time
     */
    getData(min, max) {
        let that = this
        let promise = new Promise((resolve, reject) => {
            this.orm.contains(min, max).then(
                function () {
                    that.orm.get(min, max).then((response) => {
                        resolve(response)
                    })
                },
                function () {
                    that.kaiztenWebSockets.requestData(min, max)
                    resolve() // SE PUEDE ELIMINAR CUANDO SE ELIMINE EL PROMISE
                }
            )
        })
        return promise
        /*let promise = new Promise((resolve, reject) => {
            this.orm.contains(min, max).then(
                function () {
                    console.log("DATA are available")
                    that.orm.get(min, max).then((response) => {
                        resolve(response)
                    })
                },
                function () {
                    console.log("DATA are NOT available")
                    //console.log('# Data Start Request: [' + min + ', ' + max + ']')
                    //if ((maxRequestedTime.value !== Number.NEGATIVE_INFINITY) && (max > maxRequestedTime.value)) {
                    //min = maxRequestedTime.value + 0.1
                    //}
                    minRequestedTime.next(Math.min(minRequestedTime.value, min))
                    maxRequestedTime.next(Math.max(maxRequestedTime.value, max)) * /
                    that.kaiztenWebSockets.requestData(min, max).then((response) => {
                        //console.log(response)
                        resolve(response)
                        //that.orm.get(min, max).then((response2) => {
                        //resolve(response2)
                        //})
                    })
                }
            )
        })
        return promise*/
    }

    /**
     * 
     * @param {*} message 
     */
    handlerNewMessage(message) {
        //console.log("SIM. handlerNewMessage")
        this.orm.newEntity(
            message.time,
            message.entity.id,
            message.entity.properties
        )
        for (let i = 0; i < this.apps.length; i++) {
            this.apps[i].handlerNewMessage(message)
        }
    }

    /**
     * 
     * @param {*} message 
     */
    handlerRemoveMessage(message) {
        //console.log("SIM. handlerRemoveMessage")
        this.orm.removeEntity(
            message.time,
            message.entity.id
        )
        for (let i = 0; i < this.apps.length; i++) {
            this.apps[i].handlerRemoveMessage(message)
        }
    }

    /**
     * 
     * @param {*} message 
     */
    handlerUpdateMessage(message) {
        //console.log("SIM. handlerUpdateMessage")
        this.orm.updateEntity(
            message.time,
            message.change.id,
            message.change.properties
        )
        for (let i = 0; i < this.apps.length; i++) {
            this.apps[i].handlerUpdateMessage(message)
        }
    }

    /**
     * 
     * @param {*} message 
     */
    handlerEndRequestMessage(message) {
        //console.log("SIM. handlerEndRequestMessage")
        let min = message.minRequired
        let max = message.maxRequired
        this.orm.onEndRequestMessage(
            message.minRequired,
            message.maxRequired,
            min,
            max,
            message.error
        )
        for (let i = 0; i < this.apps.length; i++) {
            this.apps[i].handlerEndRequestMessage(message)
        }
    }

    /**
     * 
     */
    onSetUp() {
        console.log("data-manager: onSetUp")
        const promisesInitialize = []
        //let promiseWs = this.kaiztenWebSockets.initialize()
        let promiseStore = this.orm.initialize()
        //promisesInitialize.push(promiseWs)
        promisesInitialize.push(promiseStore)
        for (let i = 0; i < this.apps.length; i++) {
            let promiseApp = this.apps[i].initialize()
            promisesInitialize.push(promiseApp)
        }
        let that = this
        Promise.all(promisesInitialize).then(that.onInitialize())
    }

    /**
     * 
     */
    onInitialize() {
        console.log("data-manager: onInitialize")
        for (let i = 0; i < this.apps.length; i++) {
            if (this.apps[i].onInitialize !== undefined) {
                this.apps[i].onInitialize()
            }
        }
        this.status.next('ready')
    }
}