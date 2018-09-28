import { 
  onSetUp 
} from 'kaizten-realtime-js/src/kaizten-simulation'
import {
  timeline,
  set,
  to
//} from 'kaizten-gsap.js'
} from 'kaizten-realtime-js/src/kaizten-gsap'
import * as PIXI from 'pixi.js'

export let STAGE_WIDTH = 800
export let STAGE_HEIGHT = 600

let Container = PIXI.Container
let autoDetectRenderer = PIXI.autoDetectRenderer
let loader = PIXI.loader
export let resources = PIXI.loader.resources
let Sprite = PIXI.Sprite
let stage = new Container()
let renderer
let canvas
export let agents

export function initialize () { }

export function setUp () {
  agents = new Map()
  canvas = document.getElementById('canvas')
  var options = {
    view: canvas,
    transparent: true,
    resolution: 1
  }
  renderer = autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT, options)
  renderer.view.style.border = '1px dashed black'
  loader
    .add('truck.png')
    .on('progress')
    //.on('progress', loadProgressHandler)
    .load(onSetUp)
  gameLoop()
}

export function newSprite (image) {
  return new Sprite(resources['truck.png'].texture)
}

export function newText (text, x = 0, y = 0) {
  var t = new PIXI.Text(text, { font: 'bold 20px Arial', fill: '#cc00ff', align: 'center', stroke: '#FFFFFF', strokeThickness: 2 })
  t.anchor.x = 0.5
  t.anchor.y = 0.5
  t.x = x
  t.y = y
  return t
}

function loadProgressHandler (loader, resource) {
  console.log('loading: ' + resource.url)
  console.log('progress: ' + loader.progress + '%')
}

export function gameLoop () {
  requestAnimationFrame(gameLoop)
  renderer.render(stage)
}

export function handlerNewMessage (message) { }

export function handlerRemoveMessage (message) { }

export function handlerUpdateMessage (message) { }

export function handlerNewProperty (time, previousTime, id, properties) {
  // Nuevo agente
  console.log("New Agent")
  //
  let agent = {}
  agent.properties = properties
  agent.sprite = newSprite('truck.png')
  agent.sprite.anchor.x = 0.5
  agent.sprite.anchor.y = 0.5
  agent.sprite.width = 20
  agent.sprite.height = 20
  agents.set(id, agent)
  // Propiedades adicionales
  agent.sprite.rotation = 2 * Math.random() * Math.PI
  // Añadir al stage
  stage.addChild(agent.sprite)
  // Actualizar timeline
  let newX = 0
  let newY = 0
  if (properties.hasOwnProperty('x')) {
    newX = properties.x
    agent.sprite.x = newX
    agent.properties.x = newX
  }
  if (properties.hasOwnProperty('y')) {
    newY = properties.y
    agent.sprite.y = newY
    agent.properties.y = newY
  }
  let newValues = {
    x: newX,
    y: newY,
    rotation: agent.sprite.rotation
  }
  set(time, agent.sprite, newValues)
}

export function handlerRemoveProperty (time, previousTime, id, properties) { }

export function handlerUpdateProperty (time, previousTime, id, properties) {
  let agent = agents.get(id)
  // Actualizar timeline
  let oldX = agent.properties.x
  let oldY = agent.properties.y
  let newX = oldX
  let newY = oldY
  let vars = {}
  if (properties.hasOwnProperty('x')) {
    newX = properties.x
    agent.properties.x = newX
    vars.x = newX
  }
  if (properties.hasOwnProperty('y')) {
    newY = properties.y
    agent.properties.y = newY
    vars.y = newY
  }
  if (Object.keys(vars).length > 0) {
    let duration = (time - previousTime) / 1000.0
    to(time, agent.sprite, vars, duration)
    let newRotation = Math.atan2(newY - oldY, newX - oldX)
    set(time, agent.sprite, {rotation: newRotation})
  }
}
