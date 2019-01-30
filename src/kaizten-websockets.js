import * as Rx from 'rxjs'

/**
 * 
 */
export class KaiztenWebSockets {

    /**
     * Websocket
     */
    webSocket
    /**
     * Minimum required time
     */
    minRequiredTime
    /**
     * Maximum required time
     */
    maxRequiredTime
    /**
     * Observable with the messages of type 'new'
     */
    newMessage
    /**
     * Observable with the messages of type 'remove'
     */
    removeMessage
    /**
     * Observable with the messages of type 'update'
     */
    updateMessage
    /**
     * Observable with the messages of type 'end-request'
     */
    endRequestMessage
    /**
     * Number of messages of type 'new'
     */
    numberOfNewMessages
    /**
     * Number of messages of type 'update'
     */
    numberOfUpdateMessages
    /**
     * Number of messages of type 'remove'
     */
    numberOfRemoveMessages
    /**
     * Number of messages of type 'end-request'
     */
    numberOfEndRequestMessages

    /**
     * Constructor of the class. It creates its attributes.
     */
    constructor() {
        this.webSocket = null
        this.minRequiredTime = new Rx.BehaviorSubject()
        this.maxRequiredTime = new Rx.BehaviorSubject()
        this.newMessage = new Rx.BehaviorSubject()
        this.removeMessage = new Rx.BehaviorSubject()
        this.updateMessage = new Rx.BehaviorSubject()
        this.endRequestMessage = new Rx.BehaviorSubject()
        this.numberOfNewMessages = new Rx.BehaviorSubject()
        this.numberOfUpdateMessages = new Rx.BehaviorSubject()
        this.numberOfRemoveMessages = new Rx.BehaviorSubject()
        this.numberOfEndRequestMessages = new Rx.BehaviorSubject()
    }

    /**
     * 
     */
    setUp() {
        this.minRequiredTime.next(Number.POSITIVE_INFINITY)
        this.maxRequiredTime.next(Number.NEGATIVE_INFINITY)
        this.numberOfNewMessages.next(0)
        this.numberOfUpdateMessages.next(0)
        this.numberOfRemoveMessages.next(0)
        this.numberOfEndRequestMessages.next(0)
    }

    /**
     * 
     * @param {string} url URL of the server to connect.
     */
    connect(url) {
        let that = this
        let promise = new Promise((resolve, reject) => {
            if (!this.webSocket || this.webSocket.readyState !== 1) {
                this.webSocket = new WebSocket(url, 'v10.stomp')
                this.webSocket.addEventListener('open', function (event) {
                    resolve()
                    that.onOpenHandler(event)
                })
                this.webSocket.addEventListener('close', function (event) {
                    that.onCloseHandler(event)
                })
                this.webSocket.addEventListener('message', function (event) {
                    that.onMessageHandler(event)
                })
            } else {
                //console.log(this.webSocket.readyState)
            }
        })
        return promise
    }

    /**
     * 
     */
    disconnect() {
        this.webSocket.close()
    }

    /**
     * 
     * @param {*} min 
     * @param {*} max 
     */
    requestData(min, max) {
        //console.log('# WS Start Request: [' + min + ', ' + max + ']')
        this.webSocket.send(
            JSON.stringify({
                type: 'request',
                minRequiredTime: min,
                maxRequiredTime: max
            })
        )
        this.minRequiredTime.next(Math.min(this.minRequiredTime.value, min))
        this.maxRequiredTime.next(Math.max(this.maxRequiredTime.value, max))
    }

    /**
     * 
     * @param {*} event 
     */
    onOpenHandler(event) { }

    /**
     * 
     * @param {*} event 
     */
    onCloseHandler(event) { }

    /**
     * 
     * @param {*} event 
     */
    onMessageHandler(event) {
        let message = JSON.parse(event.data)
        switch (message.type) {
            case 'new':
                this.numberOfNewMessages.next(this.numberOfNewMessages.value + 1)
                this.newMessage.next(message)
                break
            case 'remove':
                this.numberOfRemoveMessages.next(this.numberOfRemoveMessages.value + 1)
                this.removeMessage.next(message)
                break
            case 'update':
                this.numberOfUpdateMessages.next(this.numberOfUpdateMessages.value + 1)
                this.updateMessage.next(message)
                break
            case 'end-request':
                //console.log('# WS End Request: [' + message.minRequired + ', ' + message.maxRequired + ']')
                this.numberOfEndRequestMessages.next(this.numberOfEndRequestMessages.value + 1)
                this.endRequestMessage.next(message)
                break
            default:
                console.log('# ERROR: I have never heard of this!')
                console.log(message)
        }
    }
}
