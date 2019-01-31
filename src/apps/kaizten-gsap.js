import { KaiztenApp } from './kaizten-app'
import { TimelineMax } from 'gsap'
import * as Rx from 'rxjs'

/**
 * xxx
 * @extends KaiztenApp
 */
export class KaiztenGsap extends KaiztenApp {

    /**
     * Timeline
     */ 
    timeline
    /** 
     * Map whose key is a time with tween and its value is the set of tweens in that time
     */ 
    tweenLabels
    /**
     * Minimum time with tween
     */
    timeFirstTween
    /**
     * Maximum time with tween
     */
    timeLastTween
    /**
     * Minimum requested time to the server
     */
    minRequestedTime
    /**
     * Maximum requested time to the server
     */
    maxRequestedTime
    /**
     * Increment in the time when new data are requested
     */
    increment = 6000

    /**
     * 
     */
    constructor() {
        super()
        this.timeline = new TimelineMax({
            paused: true,
            onUpdate: () => { this.onUpdate() },
            onComplete: () => { this.onCompleteTimeline() },
            onReverseComplete: () => { this.onReverseCompleteTimeline() },
        })
        this.tweenLabels = new Map()
        this.timeFirstTween = new Rx.BehaviorSubject()
        this.timeLastTween = new Rx.BehaviorSubject()
        this.minRequestedTime = new Rx.BehaviorSubject()
        this.maxRequestedTime = new Rx.BehaviorSubject()
    }

    /**
     * 
     * @param {*} dataManager 
     */
    setUp(dataManager) {
        super.setUp(dataManager)
        let promise = new Promise((resolve, reject) => {
            const promisesSetUp = []
            for (let i = 0; i < this.apps.length; i++) {
                let promiseChild = this.apps[i].setUp(dataManager)
                promisesSetUp.push(promiseChild)
            }
            Promise.all(promisesSetUp).then(resolve)
        })
        return promise
    }

    /**
     * 
     */
    initialize() {
        let promise = new Promise((resolve, reject) => {
            //console.log("initialize gsap")
            this.tweenLabels.clear()
            this.timeFirstTween.next(Number.POSITIVE_INFINITY)
            this.timeLastTween.next(Number.NEGATIVE_INFINITY)
            this.minRequestedTime.next(Number.POSITIVE_INFINITY)
            this.maxRequestedTime.next(Number.NEGATIVE_INFINITY)
            const promisesInitialize = []
            for (let i = 0; i < this.apps.length; i++) {
                let promiseChild = this.apps[i].initialize()
                promisesInitialize.push(promiseChild)
            }
            Promise.all(promisesInitialize).then(resolve)
        })
        return promise
    }

    /**
     * 
     */
    onUpdateTimeline() {
        let time = this.timeline.time() * 1000
        //console.log((time + this.increment) + " maxRequested="+this.maxRequestedTime.value)
        if ((time + this.increment) >= this.maxRequestedTime.value) {
            let minRequired = this.maxRequestedTime.value
            let maxRequired = minRequired + this.increment
            this.requestData(minRequired, maxRequired)
        }
    }

    /**
     * 
     * @param {*} minRequired 
     * @param {*} maxRequired 
     */
    requestData(minRequired = 0, maxRequired = this.increment) {
        //console.log('# GSAP Start Request: [' + minRequired + ', ' + maxRequired + ']')
        if ((this.maxRequestedTime.value !== Number.NEGATIVE_INFINITY) && (maxRequired > this.maxRequestedTime.value)) {
            minRequired = this.maxRequestedTime.value + 0.1
        }
        console.log('# GSAP Start Request: [' + minRequired + ', ' + maxRequired + ']')
        this.minRequestedTime.next(Math.min(this.minRequestedTime.value, minRequired))
        this.maxRequestedTime.next(Math.max(this.maxRequestedTime.value, maxRequired))
        this.dataManager.getData(minRequired, maxRequired)
    }

    /**
     * 
     * @param {*} time 
     * @param {*} target 
     * @param {*} vars 
     */
    set(time, target, vars) {
        let label = this.getLabel(time)
        this.timeline.set(target, vars, label)
        let tweens = this.tweenLabels.has(label) ? this.tweenLabels.get(label) + 1 : 1
        this.tweenLabels.set(label, tweens)
        this.timeFirstTween.next(Math.min(this.timeFirstTween.value, time))
        this.timeLastTween.next(Math.max(this.timeLastTween.value, time))
    }

    /**
     * 
     * @param {*} time 
     * @param {*} target 
     * @param {*} vars 
     * @param {*} duration 
     */
    to(time, target, vars, duration) {
        let label = this.getLabel(time)
        this.timeline.to(target, duration, vars, label)
        let tweens = this.tweenLabels.has(label) ? this.tweenLabels.get(label) + 1 : 1
        this.tweenLabels.set(label, tweens)
        this.timeFirstTween.next(Math.min(this.timeFirstTween.value, time))
        this.timeLastTween.next(Math.max(this.timeLastTween.value, time))
    }

    /**
     * 
     * @param {*} timeline 
     * @param {*} label 
     */
    removeAtLabel(timeline, label) {
        var labelTime = this.timeline.getLabelTime(label)
        var children = this.timeline.getChildren(false, true, true, labelTime) // nested, tweens, timelines, ignoreBeforeTime
        for (var i = 0; i < children.length; i++) {
            if (children[i].startTime() === labelTime) { // ANTES ERA UN == Y NO ===
                console.log('found a tween to remove at ' + label + ' label')
                timeline.remove(children[i])
            }
        }
    }

    /**
     * 
     */
    getNumberOfTweens() {
        return (this.timeline !== undefined) ? this.timeline.getChildren().length : 0
    }

    /**
     * 
     * @param {*} time 
     */
    getNumberOfTweensInTime(time) {
        console.log(getLabel(time) + " -> " + this.tweenLabels.get(getLabel(time)))
        return this.tweenLabels.get(getLabel(time))
    }

    /**
     * 
     * @param {*} time 
     */
    getLabel(time) {
        return 'label_' + time
    }

    /**
     * 
     */
    pause() {
        console.log('Pausing animation at ' + new Date().getTime())
        this.timeline.pause()
    }

    /**
     * 
     */
    logStart() {
        console.log('Starting animation at ' + new Date().getTime())
    }

    /**
     * 
     */
    logFinish() {
        console.log('Finishing animation at ' + new Date().getTime())
    }

    /**
     * 
     */
    onUpdate() {
        //console.log("ON UPDATE")
        //console.log(this)
        this.onUpdateTimeline()
    }

    /**
     * 
     */
    onCompleteTimeline() {
        console.log("FINISHED!!!")
    }

    /**
     * 
     */
    onReverseCompleteTimeline() {
        console.log("REVERSED FINISHED!!!")
    }

    /**
     * 
     * @param {*} message 
     */
    handlerEndRequestMessage(message) {
        //console.log("# GSAP. handlerEndRequestMessage")
        super.handlerEndRequestMessage(message)
        this.timeline.play()
    }
}
