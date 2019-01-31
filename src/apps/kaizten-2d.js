import { KaiztenApp } from './kaizten-app'
import * as PIXI from 'pixi.js'

/**
 * xxx
 * @extends KaiztenApp
 */
export class Kaizten2d extends KaiztenApp {

    /**
     * 
     */
    STAGE_WIDTH = 700
    /**
     * 
     */
    STAGE_HEIGHT = 450
    /**
     * 
     */
    loader
    /**
     * 
     */
    resources
    /**
     * 
     */
    stage
    /**
     * 
     */
    renderer
    /**
     * 
     */
    canvas
    /**
     * 
     */
    id
    /**
     * 
     */
    entities
    /**
     * 
     */
    entityTimes

    /**
     * 
     * @param {*} id 
     */
    constructor(id) {
        super()
        this.id = id
        this.loader = PIXI.loader
        this.resources = PIXI.loader.resources
        this.stage = new PIXI.Container()
        this.entities = new Map()
        this.entityTimes = new Map()
    }

    /**
     * 
     * @param {*} dataManager 
     */
    setUp(dataManager) {
        super.setUp(dataManager)
        let that = this
        let promise = new Promise((resolve, reject) => {
            //console.log("setup 2d: " + this.id)
            this.canvas = document.getElementById(this.id)
            let options = {
                view: this.canvas,
                transparent: true,
                resolution: 1
            }
            this.renderer = PIXI.autoDetectRenderer(this.STAGE_WIDTH, this.STAGE_HEIGHT, options)
            this.renderer.view.style.border = '1px dashed black'
            this.loader
                .add('truck.png')
                .on('progress')
                //.on('progress', loadProgressHandler)
                .load(resolve)
            that.gameLoop()
        })
        //this.gameLoop()
        return promise
    }

    /**
     * 
     * @param {*} image 
     */
    newSprite(image) {
        return new PIXI.Sprite(this.resources['truck.png'].texture)
    }

    /**
     * 
     * @param {*} text 
     * @param {*} x 
     * @param {*} y 
     */
    newText(text, x = 0, y = 0) {
        var t = new PIXI.Text(text, { font: 'bold 20px Arial', fill: '#cc00ff', align: 'center', stroke: '#FFFFFF', strokeThickness: 2 })
        t.anchor.x = 0.5
        t.anchor.y = 0.5
        t.x = x
        t.y = y
        return t
    }

    /**
     * 
     * @param {*} loader 
     * @param {*} resource 
     */
    loadProgressHandler(loader, resource) {
        console.log('loading: ' + resource.url)
        console.log('progress: ' + loader.progress + '%')
    }

    /**
     * 
     */
    gameLoop() {
        //console.log("gameloop: ")
        //console.log(this)
        requestAnimationFrame(() => { this.gameLoop() })
        this.renderer.render(this.stage)
    }

    /**
     * 
     * @param {*} message 
     */
    handlerNewMessage(message) {
        //console.log("# 2D. handlerNewMessage")
        super.handlerNewMessage(message)
        //
        let entity = {}
        entity.properties = message.entity.properties
        entity.sprite = this.newSprite('truck.png')
        entity.sprite.anchor.x = 0.5
        entity.sprite.anchor.y = 0.5
        entity.sprite.width = 20
        entity.sprite.height = 20
        this.entities.set(message.entity.id, entity)
        this.entityTimes.set(message.entity.id, message.time)
        // Añadir al stage
        this.stage.addChild(entity.sprite)
        let newX = 0
        let newY = 0
        if (message.entity.properties.hasOwnProperty('x')) {
            newX = message.entity.properties.x
            entity.sprite.x = newX
            entity.properties.x = newX
        }
        if (message.entity.properties.hasOwnProperty('y')) {
            newY = message.entity.properties.y
            entity.sprite.y = newY
            entity.properties.y = newY
        }
        // Additional properties
        entity.sprite.rotation = 2 * Math.random() * Math.PI
        let newValues = {
            x: newX,
            y: newY,
            rotation: entity.sprite.rotation
        }
        // Update timeline
        this.parentApp.set(message.time, entity.sprite, newValues)
    }

    /**
     * 
     * @param {*} message 
     */
    handlerUpdateMessage(message) {
        //console.log("# 2D. handlerUpdateMessage")
        super.handlerUpdateMessage(message)
        //
        let entity = this.entities.get(message.change.id)
        let oldX = entity.properties.x
        let oldY = entity.properties.y
        let newX = oldX
        let newY = oldY
        let vars = {}
        if (message.change.properties.hasOwnProperty('x')) {
            newX = message.change.properties.x
            entity.properties.x = newX
            vars.x = newX
        }
        if (message.change.properties.hasOwnProperty('y')) {
            newY = message.change.properties.y
            entity.properties.y = newY
            vars.y = newY
        }
        // Update timeline
        if (Object.keys(vars).length > 0) {
            let previousTime = this.entityTimes.get(message.change.id)
            let duration = (message.time - previousTime) / 1000.0
            this.parentApp.to(message.time, entity.sprite, vars, duration)
            let newRotation = Math.atan2(newY - oldY, newX - oldX)
            this.parentApp.set(message.time, entity.sprite, { rotation: newRotation })
            this.entityTimes.set(message.change.id, message.time)
        }
    }
}