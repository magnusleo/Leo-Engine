### Copyright (c) 2014 Magnus Leo. All rights reserved. ###

#IDEA: Dynamic zoom and automatic screen size (adapt to window).

Leo = window.Leo ?= {}

# Data

# Private variables
_view = null
_viewCtx = null
_frameBuffer = document.createElement 'canvas'
_frameBufferCtx = _frameBuffer.getContext '2d'
_latestFrameTime = Date.now()
_pressedKeys = []
_camX = 0
_camY = 0
_camW = 0
_camH = 0
_editTile = -1

# Public variables
Leo.environment =
    gravity: 60 # Tiles per second^2

Leo.view =
    scale: 2
    cameraPosX: 2.0 # Unit tile
    cameraPosY: 0.0
    cameraSpeedX: 0.0 # One tiles per second, positive is right
    cameraSpeedY: 0.0
    cameraWidth: 30
    cameraHeight: 17

Leo.view.posToPx = (posX, axis, parallax = 1.0) ->
    return ((posX - Leo.view['cameraPos' + axis.toUpperCase()]) * Leo.background.tileSize * parallax) >> 0

Leo.view.drawOnceQue = []
Leo.view.drawOnce = (data) ->
    Leo.view.drawOnceQue.push data


Leo.background =
    tileSize: 16
    color: '#6ec0ff'

Leo.actors = []
Leo.shapes = []


# Core functions
Leo.core = {}
Leo.core.imgPath = '_img/'

Leo.core.init = ->
    _view = document.getElementById('leo-view')
    Leo._view = _view

    _frameBuffer.width  = _view.width
    _frameBuffer.height = _view.height

    _view.width          = _view.width  * Leo.view.scale
    _view.height         = _view.height * Leo.view.scale

    _viewCtx = _view.getContext('2d')
    _viewCtx.imageSmoothingEnabled = _viewCtx.webkitImageSmoothingEnabled = _viewCtx.mozImageSmoothingEnabled = false

    _view.addEventListener 'mousedown', (e) ->
        unless e.button is 0
            return

        e.preventDefault()

        mouseX   = e.offsetX
        mouseY   = e.offsetY
        camX     = Leo.view.cameraPosX
        camY     = Leo.view.cameraPosY
        scale    = Leo.view.scale
        tileSize = Leo.background.tileSize

        tileX    = (mouseX / scale / tileSize + camX) >> 0
        tileY    = (mouseY / scale / tileSize + camY) >> 0

        layer    = Leo.layers.get('ground')
        tile     = layer.getTile(tileX, tileY)
        console.log tileX, tileY #Debug

        if e.altKey
            _editTile = tile
        else
           layer.setTile(tileX, tileY, _editTile)

    _view.addEventListener 'mouseup', (e) ->
        e.preventDefault()

    window.addEventListener 'keydown', Leo.event._keydown
    window.addEventListener 'keyup',   Leo.event._keyup

    window.requestAnimationFrame(Leo.core.cycle)

Leo.core.draw = ->
    if Leo.util.documentHidden()
        return

    # Calculate camera pixel values
    _camX = Leo.view.cameraPosX * Leo.background.tileSize
    _camY = Leo.view.cameraPosY * Leo.background.tileSize
    _camW = Leo.view.cameraWidth * Leo.background.tileSize
    _camH = Leo.view.cameraHeight * Leo.background.tileSize

    # Background color
    _frameBufferCtx.fillStyle = Leo.background.color
    _frameBufferCtx.fillRect 0, 0, _view.width, _view.height

    # Render layers
    for layer in Leo.layers.objects
        layer.draw()

    # Render Actors
    for actor in Leo.actors
        actor.draw()

    # Render shapes
    for shape in Leo.shapes
        shape.draw()

    while so = Leo.view.drawOnceQue.pop()
        shape = Leo['drawOnce' + so.shape] ?= new Leo[so.shape]()
        for name, val of so
            shape[name] = val
        shape.isVisible = true
        shape.draw()
        shape.isVisible = false

    _viewCtx.drawImage _frameBuffer,
        0,
        0,
        _frameBuffer.width * Leo.view.scale,
        _frameBuffer.height * Leo.view.scale

Leo.core.cycle = ->
    # Frame timing
    thisFrameTime = Date.now()
    cycleLength = Math.min(thisFrameTime - _latestFrameTime, 100) * 0.001 # Unit seconds
    unless cycleLength
        return

    # Camera
    Leo.view.cameraPosX += Leo.view.cameraSpeedX * cycleLength

    # Actors
    for actor in Leo.actors
        actor.update(cycleLength)

    # Finish the frame
    Leo.core.draw()
    _latestFrameTime = thisFrameTime
    window.requestAnimationFrame(Leo.core.cycle)

    Leo.cycleCallback(cycleLength)

Leo.core.DATA_TYPES =
    CHUNK: 0


Leo.cycleCallback = -> # Override Leo.cycleCallback with your own function
