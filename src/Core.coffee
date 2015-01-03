### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

#IDEA: Dynamic zoom and automatic screen size (adapt to window).

background = require('./background')
event = require('./event')
layers = require('./layers')
util = require('./util')
view = require('./view')

core = {}
module.exports = core

# Private variables
_view = null
_viewCtx = null
_frameBuffer = document.createElement 'canvas'
_latestFrameTime = Date.now()
_editTile = -1

# Public variables
core.frameBufferCtx = _frameBuffer.getContext '2d'
core.camX = 0
core.camY = 0
core.camW = 0
core.camH = 0
core.actors = []
core.shapes = []


# Core functions
core.imgPath = '_img/'

core.init = ->
    _view = document.getElementById('leo-view')

    _frameBuffer.width  = _view.width
    _frameBuffer.height = _view.height

    _view.width          = _view.width  * view.scale
    _view.height         = _view.height * view.scale

    _viewCtx = _view.getContext('2d')
    _viewCtx.imageSmoothingEnabled = _viewCtx.webkitImageSmoothingEnabled = _viewCtx.mozImageSmoothingEnabled = false

    _view.addEventListener 'mousedown', (e) ->
        unless e.button is 0
            return

        e.preventDefault()

        mouseX   = e.offsetX
        mouseY   = e.offsetY
        camX     = view.cameraPosX
        camY     = view.cameraPosY
        scale    = view.scale
        tileSize = background.tileSize

        tileX    = (mouseX / scale / tileSize + camX) >> 0
        tileY    = (mouseY / scale / tileSize + camY) >> 0

        layer    = layers.get('ground')
        tile     = layer.getTile(tileX, tileY)
        console.log tileX, tileY #Debug

        if e.altKey
            _editTile = tile
        else
           layer.setTile(tileX, tileY, _editTile)

    _view.addEventListener 'mouseup', (e) ->
        e.preventDefault()

    window.addEventListener 'keydown', event._keydown
    window.addEventListener 'keyup',   event._keyup

    window.requestAnimationFrame(core.cycle)

core.draw = ->
    if util.documentHidden()
        return

    # Calculate camera pixel values
    core.camX = view.cameraPosX * background.tileSize
    core.camY = view.cameraPosY * background.tileSize
    core.camW = view.cameraWidth * background.tileSize
    core.camH = view.cameraHeight * background.tileSize

    # Background color
    core.frameBufferCtx.fillStyle = background.color
    core.frameBufferCtx.fillRect 0, 0, _view.width, _view.height

    # Render layers
    for layer in layers.objects
        layer.draw()

    # Render Actors
    for actor in core.actors
        actor.draw()

    # Render shapes
    for shape in core.shapes
        shape.draw()

    while so = view.drawOnceQue.pop()
        shape = new so.class()
        for name, val of so
            shape[name] = val
        shape.isVisible = true
        shape.draw()
        shape.isVisible = false

    _viewCtx.drawImage _frameBuffer,
        0,
        0,
        _frameBuffer.width * view.scale,
        _frameBuffer.height * view.scale

core.cycle = ->
    # Frame timing
    thisFrameTime = Date.now()
    cycleLength = Math.min(thisFrameTime - _latestFrameTime, 100) * 0.001 # Unit seconds
    unless cycleLength
        return

    # Camera
    view.cameraPosX += view.cameraSpeedX * cycleLength

    # Actors
    for actor in core.actors
        actor.update(cycleLength)

    # Finish the frame
    core.draw()
    _latestFrameTime = thisFrameTime
    window.requestAnimationFrame(core.cycle)

    core.cycleCallback(cycleLength)

core.DATA_TYPES =
    CHUNK: 0


core.cycleCallback = -> # Override core.cycleCallback with your own function
