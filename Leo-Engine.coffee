### Copyright 2014 Magnus Leo. All rights reserved. ###

#IDEA: Dynamic zoom and automatic screen size (adapt to window).

Leo = window.Leo = {}


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


# Events
Leo.event = {}

Leo.event._keydown = (e) ->
    unless e.ctrlKey or e.metaKey
        e.preventDefault()

    # Prevent keydown repeat
    keyIndex = _pressedKeys.indexOf e.keyCode
    if keyIndex is -1
        _pressedKeys.push e.keyCode

        key = Leo.util.KEY_CODES
        switch e.keyCode
            when key.S
                data = Leo.layers.get('ground').serialize()
                localStorage.setItem('ground', data)

            when key.L
                data = localStorage.getItem('ground')
                Leo.layers.get('ground').deserialize(data)

        Leo.event.keydown e

Leo.event.keydown = (e) ->
    # Override Leo.event.keydown with your keydown function

Leo.event._keyup = (e) ->
    e.preventDefault()
    keyIndex = _pressedKeys.indexOf e.keyCode
    if keyIndex isnt -1
        _pressedKeys.splice keyIndex, 1
    Leo.event.keyup e

Leo.event.keyup = (e) ->
    # Override Leo.event.keyup with your keyup function


# I/O
Leo.io = {}

Leo.io.getPressedKeys = ->
    return _pressedKeys

Leo.io.isKeyPressed = (key) ->
    if typeof key is 'string'
        key = Leo.util.KEY_CODES[key.toUpperCase()]
    unless typeof key is 'number'
        return false

    return _pressedKeys.indexOf(key) > -1

Leo.io.anyKeyPressed = (keys) ->
    keyCodes = Leo.util.KEY_CODES
    if typeof key is 'string'
        key = [key]
    for key in keys
        if typeof key is 'string'
            key = keyCodes[key.toUpperCase()]
        if _pressedKeys.indexOf(key) > -1
            return true
    return false

Leo.io.allKeysPressed = (keys) ->
    keyCodes = Leo.util.KEY_CODES
    if typeof key is 'string'
        key = [key]
    for key in keys
        if typeof key is 'string'
            key = keyCodes[key.toUpperCase()]
        if _pressedKeys.indexOf(key) == -1
            return false
    return true


# Sprites
Leo.sprite = {}

Leo.sprite.getImg = (path) ->
    _img = Leo.sprite._img
    if _img[path]
        return _img[path]
    else
        _imgObj = _img[path] = new Image()
        _imgObj.src = '_img/' + path
        return _imgObj

Leo.sprite.remove = (path) ->
    _img = Leo.sprite._img
    if _img[path] then _img[path] = null

Leo.sprite._img = {} # Hashmap of image objects with the sprite path as key



# Layers
Leo.layers = {}

Leo.layers.objects = []

Leo.layers.add = (layerObj) ->
    if not (layerObj instanceof Layer) or
    not layerObj.id or
    Leo.layers.get(layerObj.id)
        return null

    Leo.layers.objects.push(layerObj)

Leo.layers.get = (id) ->
    for layerObj in Leo.layers.objects
        if layerObj.id is id
            return layerObj
    return null



# Collisions
Leo.collision = {}

Leo.collision.actorToLayer = (actor, layer, options) ->
    o =
        reposition: false
    o = Leo.util.merge(o, options)

    collisions =
        any: false
        bottom: false
        top: false
        left: false
        right: false
        friction: 1.0 #TODO: Get data from colliding tiles

    newPosX = actor.posX
    newPosY = actor.posY
    newSpeedX = actor.speedX
    newSpeedY = actor.speedY

    startX = actor.posX >> 0
    endX   = (actor.posX + actor.colW) >> 0
    startY = actor.posY >> 0
    endY   = (actor.posY + actor.colH) >> 0

    # Check if overlapping tiles are collidable
    for y in [startY..endY]
        for x in [startX..endX]
            tile = layer.getTile(x, y)
            if tile > -1
                ###
                +----+  Actor moves from A1 to A2
                | A1 |  and collides with background tile Bg.
                |    |  Actor moves with vector (speedX, speedY)
                +----+
                     +----+  The angle between AcBc and the movement vector determines
                     | A2 |  if it is a horizontal or vertical collision.
                     |  Bc-----+
                     +--|-Ac   |
                        |  Bg  |
                        +------+
                ###
                if actor.speedX == 0
                    isHorizontalCollision = false
                else if actor.speedY == 0
                    isHorizontalCollision = true
                else
                    # Get actor's foremost corner in the movement vector
                    # and the backgrounds opposing corner
                    a2Corner = {}
                    bgCorner = {}

                    if actor.speedX > 0
                        a2Corner.x = actor.posX + actor.colW
                        bgCorner.x = x
                    else
                        a2Corner.x = actor.posX
                        bgCorner.x = x + 1

                    if actor.speedY > 0
                        a2Corner.y = actor.posY + actor.colH
                        bgCorner.y = y
                    else
                        a2Corner.y = actor.posY
                        bgCorner.y = y + 1

                    # Determine by the angle if it is a horizontal or vertical collision
                    movAng = Math.abs(actor.speedY / actor.speedX)
                    colAng = Math.abs((a2Corner.y - bgCorner.y) / (a2Corner.x - bgCorner.x))
                    if movAng - colAng < 0.01
                        isHorizontalCollision = true
                    else
                        isHorizontalCollision = false

                if isHorizontalCollision
                    # Horizontal collisions
                    if actor.speedX > 0
                        # Going right. Is not an edge if the tile to the left is solid.
                        neighborTile = layer.getTile(x, y, -1, 0)
                        if neighborTile == -1
                            newPosX = x - actor.colW - 0.01
                            newSpeedX = 0
                            collisions.any = true
                            collisions.right = true
                            Leo.view.drawOnce {shape:'Line', x:x, y:y, x2:x, y2:y+1, strokeStyle:'rgba(0,128,0,0.9)'} #Debug
                        else
                            Leo.view.drawOnce {shape:'Line', x:x, y:y, x2:x, y2:y+1, strokeStyle:'rgba(255,64,0,0.6)'} #Debug
                    else
                        # Going left. Is not an edge if the tile to the right is solid.
                        neighborTile = layer.getTile(x, y, 1, 0)
                        if neighborTile == -1
                            newPosX = x + 1
                            newSpeedX = 0
                            collisions.any = true
                            collisions.left = true
                            Leo.view.drawOnce {shape:'Line', x:x+1, y:y, x2:x+1, y2:y+1, strokeStyle:'rgba(0,128,0,0.9)'} #Debug
                        else
                            Leo.view.drawOnce {shape:'Line', x:x+1, y:y, x2:x+1, y2:y+1, strokeStyle:'rgba(255,64,0,0.6)'} #Debug
                else
                    # Vertical collisions
                    if actor.speedY < 0
                        # Going up. Is not an edge if the tile upwards is solid.
                        neighborTile = layer.getTile(x, y, 0, 1)
                        if neighborTile == -1
                            newPosY = y + 1
                            newSpeedY = 0
                            collisions.any = true
                            collisions.top = true
                            Leo.view.drawOnce {shape:'Line', x:x, y:y+1, x2:x+1, y2:y+1, strokeStyle:'rgba(0,128,0,0.9)'} #Debug
                        else
                            Leo.view.drawOnce {shape:'Line', x:x, y:y+1, x2:x+1, y2:y+1, strokeStyle:'rgba(255,64,0,0.6)'} #Debug
                    else if actor.speedY > 0
                        # Going down. Is not an edge if the tile downwards is solid.
                        neighborTile = layer.getTile(x, y, 0, -1)
                        if neighborTile == -1
                            newPosY = y - actor.colH
                            newSpeedY = 0
                            collisions.any = true
                            collisions.bottom = true
                            Leo.view.drawOnce {shape:'Line', x:x, y:y, x2:x+1, y2:y, strokeStyle:'rgba(0,128,0,0.9)'} #Debug
                        else
                            Leo.view.drawOnce {shape:'Line', x:x, y:y, x2:x+1, y2:y, strokeStyle:'rgba(255,64,0,0.6)'} #Debug

                # Debug highlight block
                if neighborTile == -1
                    # Collision
                    Leo.view.drawOnce {shape:'Rect', x:x, y:y, w:1, h:1, fillStyle:'rgba(0,255,0,0.6)'} #Debug
                else
                    # Internal edge; no collision
                    Leo.view.drawOnce {shape:'Rect', x:x, y:y, w:1, h:1, fillStyle:'rgba(255,255,0,0.5)'} #Debug

    # Apply new position and speed
    if o.reposition
        actor.posX = newPosX
        actor.posY = newPosY
        actor.speedX = newSpeedX
        actor.speedY = newSpeedY

    return collisions




# Utilities
Leo.util = {}

Leo.util.KEY_CODES = {'BACKSPACE':8,'TAB':9,'ENTER':13,'SHIFT':16,'CTRL':17,'ALT':18,'PAUSE_BREAK':19,'CAPS_LOCK':20,'ESCAPE':27,'PAGE_UP':33,'PAGE_DOWN':34,'END':35,'HOME':36,'LEFT':37,'UP':38,'RIGHT':39,'DOWN':40,'INSERT':45,'DELETE':46,'0':48,'1':49,'2':50,'3':51,'4':52,'5':53,'6':54,'7':55,'8':56,'9':57,'A':65,'B':66,'C':67,'D':68,'E':69,'F':70,'G':71,'H':72,'I':73,'J':74,'K':75,'L':76,'M':77,'N':78,'O':79,'P':80,'Q':81,'R':82,'S':83,'T':84,'U':85,'V':86,'W':87,'X':88,'Y':89,'Z':90,'LEFT_WINDOW_KEY':91,'RIGHT_WINDOW_KEY':92,'SELECT_KEY':93,'NUMPAD_0':96,'NUMPAD_1':97,'NUMPAD_2':98,'NUMPAD_3':99,'NUMPAD_4':100,'NUMPAD_5':101,'NUMPAD_6':102,'NUMPAD_7':103,'NUMPAD_8':104,'NUMPAD_9':105,'MULTIPLY':106,'*':106,'ADD':107,'+':107,'SUBTRACT':109,'DECIMAL_POINT':110,'DIVIDE':111,'F1':112,'F2':113,'F3':114,'F4':115,'F5':116,'F6':117,'F7':118,'F8':119,'F9':120,'F10':121,'F11':122,'F12':123,'NUM_LOCK':144,'SCROLL_LOCK':145,'SEMI-COLON':186,';':186,'EQUAL_SIGN':187,'=':187,'COMMA':188,',':188,'DASH':189,'-':189,'PERIOD':190,'.':190,'FORWARD_SLASH':191,'/':191,'GRAVE_ACCENT':192,'OPEN_BRACKET':219,'[':219,'BACK_SLASH':220,'\\':220,'CLOSE_BRAKET':221,']':221,'SINGLE_QUOTE':222,'\'':222}

Leo.util.documentHidden = ->
    vendors = ['ms', 'moz', 'webkit', 'o']
    i = 0
    if document.hidden?
        return document.hidden

    for vendor in vendors
        if typeof document[vendor + 'Hidden'] isnt 'undefined'
            return document[vendor + 'Hidden']

    return false

Leo.util.merge = ->
    ret = {}
    for obj in arguments
        if typeof obj isnt 'object' or
        (obj instanceof Array)
            continue
        for name, val of obj
            ret[name] = val
    return ret



Leo.Shape =
class Shape

    constructor: (data) -> # Shape::constructor
        defaultData =
            fillStyle: 'rgba(255,0,0,0.4)'
            strokeStyle: 'rgba(255,0,0,0.7)'
            h: 1
            w: 1
            x: 0
            y: 0
        data = Leo.util.merge(defaultData, data)
        for name, val of data
            this[name] = val

        Leo.shapes.push this


    draw: -> # Shape::draw
        if not @isVisible
            return false

        @drawX = Leo.view.posToPx(@x, 'x')
        @drawY = Leo.view.posToPx(@y, 'y')
        @drawW = @w * Leo.background.tileSize
        @drawH = @h * Leo.background.tileSize
        _frameBufferCtx.fillStyle = @fillStyle
        _frameBufferCtx.strokeStyle = @strokeStyle
        # Shape specific drawing in subclass (e.g. Rect)
        return true



Leo.Rect =
class Rect extends Shape

    draw: -> # Rect::draw
        unless super
            return false
        _frameBufferCtx.fillRect @drawX, @drawY, @drawW, @drawH
        return true



Leo.Line =
class Line extends Shape

    constructor: (data) -> # Shape::constructor
        defaultData =
            x2: 0
            y2: 0
        data = Leo.util.merge(defaultData, data)
        super(data)


    draw: -> # Line::draw
        unless super
            return false
        _frameBufferCtx.beginPath()
        _frameBufferCtx.moveTo @drawX, @drawY
        _frameBufferCtx.lineTo( Leo.view.posToPx(@x2, 'x'), Leo.view.posToPx(@y2, 'y') )
        _frameBufferCtx.closePath()
        _frameBufferCtx.stroke()
        return true



Leo.Actor =
class Actor

    constructor: (properties) -> # Actor::constructor
        # Defaults
        @spritesheet = '' # Name of the spritesheet file
        @animations =
            example:
                frames: [] # [{int x (pixels), y, w, h, offsetX, offsetY, int duration (milliseconds)}, ...]
                    # frames[f][0] = x
                    # frames[f][1] = y
                    # frames[f][2] = w
                    # frames[f][3] = h
                    # frames[f][4] = offsetX
                    # frames[f][5] = offsetY
                    # frames[f][6] = duration
                doLoop: false
                completeFallback: -> # Function at animation complete (or loop)
        @animFrameTimeLeft = 0 # Time left on current animation frame
        @animFrame = 0 # Current animation frame
        @animName = '' # Name of the current animation running
        @posX = 0
        @posY = 0
        @speedX = 0
        @speedY = 0

        # User defined properties
        for key, val of properties
            @[key] = val
        @spriteImg = Leo.sprite.getImg @spritesheet

        Leo.actors.push this


    draw: -> # Actor::draw
        frame = @animations[@animName].frames[@animFrame]
        _frameBufferCtx.drawImage @spriteImg,
            frame[0], # Source x
            frame[1], # Source y
            frame[2], # Source width
            frame[3], # Source height
            Leo.view.posToPx(@posX, 'x') + frame[4], # Position + frame offset X
            Leo.view.posToPx(@posY, 'y') + frame[5], # Position + frame offset Y
            frame[2], # Destination width
            frame[3], # Destination height


    setAnimation: (animName = '', animFrame = 0) -> # Actor::setAnimation
        @animFrame = animFrame
        @animFrameTimeLeft = @animations[animName].frames[0][6]
        @animName = animName


    advanceAnimation: (cycleLength) -> # Actor::advanceAnimation
        animation = @animations[@animName]
        maxFrame = animation.frames.length - 1
        if @animFrame > maxFrame then @animFrame = maxFrame
        @animFrameTimeLeft -= cycleLength
        while @animFrameTimeLeft < 0
            @animFrame++
            if @animFrame > maxFrame
                if animation.doLoop then @animFrame = 0 else @animFrame--
            @animFrameTimeLeft = animation.frames[@animFrame][6] + @animFrameTimeLeft

    jumpToAnimationFrame: (frameNum) ->
        maxFrameNum = @animations[@animName].frames.length - 1
        @animFrame = Math.min(frameNum, maxFrameNum)


    update: (cycleLength) -> # Actor::update
        # Animation
        @advanceAnimation cycleLength

        # Position
        @posX += @speedX * cycleLength
        @posY += @speedY * cycleLength


    decelerate: (axis, amount) -> # Actor::decelerate
        if not amount
            return
        axis = axis.toUpperCase()
        unitName = 'speed' + axis
        curSpeed = @[unitName]
        if curSpeed > 0
            @[unitName] = Math.max(curSpeed - amount, 0)
        else
            @[unitName] = Math.min(curSpeed + amount, 0)



Leo.Player =
class Player extends Actor

    constructor: (data) -> # Player::constructor
        super(data)

        @accX = 0
        @dirPhysical = 0
        @dirVisual = 1
        @state = new PlayerStateStanding(this)
        @stateBefore = null


    setState: (state) -> # Player::setState
        if @state instanceof state
            return
        @stateBefore = @state
        @state = new state(this)


    stateIs: (state) -> # Player::stateIs
        return @state instanceof state


    handleInput: (e) -> # Player::handleInput
        @state.handleInput(e)


    update: (cycleLength) -> # Player::update
        @speedY += Leo.environment.gravity * cycleLength
        @speedX += @accX * cycleLength
        @speedX = Math.min(@speedX, @speedXMax)
        @speedX = Math.max(@speedX, -@speedXMax)

        super(cycleLength)
        @state.update(cycleLength)

        collisions = Leo.collision.actorToLayer this, Leo.layers.get('ground'),
            reposition: true

        # Update player state
        if collisions.bottom
            if @dirPhysical == 0
                @setState PlayerStateStanding
                @decelerate('x', collisions.friction * @decelerationGround * cycleLength)
            else
                @setState PlayerStateRunning
        else if not @stateIs PlayerStateJumping
            @setState PlayerStateFalling
            if @dirPhysical == 0
                @decelerate('x', @decelerationAir * cycleLength)



# PlayerState
# |
# |__PlayerStateAir
# |   |__PlayerStateJumping
# |
# |__PlayerStateGround
#     |__PlayerStateStanding
#     |__PlayerStateRunning

Leo.PlayerState =
class PlayerState

    constructor: (@parent) -> # PlayerState::constructor


    handleInput: (e) -> # PlayerState::handleInput
        key = Leo.util.KEY_CODES
        switch e.keyCode

            when key.LEFT
                @parent.dirPhysical = -1
                @parent.dirVisual = -1

            when key.RIGHT
                @parent.dirPhysical = 1
                @parent.dirVisual = 1


    update: (cycleLength) -> # PlayerState::update



Leo.PlayerStateGround =
class PlayerStateGround extends PlayerState

    constructor: (data) -> # PlayerStateGround::constructor
        super(data)


    handleInput: (e) -> # PlayerStateGround::handleInput
        super(e)
        key = Leo.util.KEY_CODES

        if e.type is 'keydown'
            switch e.keyCode
                when key.UP, key.Z
                    @parent.setState PlayerStateJumping



Leo.PlayerStateStanding =
class PlayerStateStanding extends PlayerStateGround

    constructor: (data) -> # PlayerStateStanding::constructor
        super(data)

        @parent.accX = 0

        if @parent.dirVisual > 0
            @parent.setAnimation 'standingRight'
        else
            @parent.setAnimation 'standingLeft'


    handleInput: (e) -> # PlayerStateStanding::handleInput
        super(e)
        key = Leo.util.KEY_CODES

        if e.type is 'keydown'
            switch e.keyCode
                when key.LEFT, key.RIGHT
                    @parent.setState PlayerStateRunning



Leo.PlayerStateRunning =
class PlayerStateRunning extends PlayerStateGround

    constructor: (data) -> # PlayerStateRunning::constructor
        super(data)
        @_setSpeedAndAnim()

        if @parent.stateBefore instanceof PlayerStateAir
            @parent.jumpToAnimationFrame(1)


    handleInput: (e) -> # PlayerStateRunning::handleInput
        super(e)
        key = Leo.util.KEY_CODES

        if e.type is 'keydown'
            switch e.keyCode
                when key.LEFT, key.RIGHT
                    @_setSpeedAndAnim()

        else if e.type is 'keyup'
            switch e.keyCode
                when key.LEFT, key.RIGHT
                    rightPressed = Leo.io.isKeyPressed(key.RIGHT)
                    leftPressed = Leo.io.isKeyPressed(key.LEFT)
                    if not leftPressed and not rightPressed
                        @parent.setState PlayerStateStanding
                        @parent.dirPhysical = 0
                        @parent.accX = 0
                    else if leftPressed and not rightPressed
                        @parent.dirPhysical = -1
                        @parent.dirVisual = -1
                        @_setSpeedAndAnim { animFrame: 1 }
                    else # if not leftPressed and rightPressed
                        @parent.dirPhysical = 1
                        @parent.dirVisual = 1
                        @_setSpeedAndAnim { animFrame: 1 }


    _setSpeedAndAnim: (options = {})-> # PlayerStateRunning::_setSpeedAndAnim
        @parent.accX = @parent.accelerationGround * @parent.dirPhysical
        if @parent.dirVisual > 0
            @parent.setAnimation 'runningRight', options.animFrame
        else
            @parent.setAnimation 'runningLeft', options.animFrame


Leo.PlayerStateAir =
class PlayerStateAir extends PlayerState

    constructor: (data) -> # PlayerStateAir::constructor
        super

        if @parent.dirVisual > 0
            @parent.setAnimation 'jumpingRight'
        else
            @parent.setAnimation 'jumpingLeft'


    handleInput: (e) -> # PlayerStateAir::handleInput
        super
        key = Leo.util.KEY_CODES

        if e.type is 'keydown'
            switch e.keyCode
                when key.LEFT, key.RIGHT
                    @_setSpeedAndAnim()

        else if e.type is 'keyup'
            switch e.keyCode
                when key.LEFT, key.RIGHT
                    rightPressed = Leo.io.isKeyPressed(key.RIGHT)
                    leftPressed = Leo.io.isKeyPressed(key.LEFT)
                    if not leftPressed and not rightPressed
                        @parent.dirPhysical = 0
                        @parent.accX = 0
                    else if leftPressed and not rightPressed
                        @parent.dirPhysical = -1
                        @parent.dirVisual = -1
                        @_setSpeedAndAnim { animFrame: 1 }
                    else # if not leftPressed and rightPressed
                        @parent.dirPhysical = 1
                        @parent.dirVisual = 1
                        @_setSpeedAndAnim { animFrame: 1 }


    _setSpeedAndAnim: -> # PlayerStateAir::_setSpeedAndAnim
        @parent.accX = @parent.accelerationAir * @parent.dirPhysical
        if @parent.dirVisual > 0
            @parent.setAnimation 'jumpingRight'
        else
            @parent.setAnimation 'jumpingLeft'


    update: (cycleLength) -> # PlayerStateAir::update
        super



Leo.PlayerStateJumping =
class PlayerStateJumping extends PlayerStateAir

    constructor: (data) -> # PlayerStateJumping::constructor
        super
        @parent.speedY = -21


    handleInput: (e) -> # PlayerStateJumping::handleInput
        super
        key = Leo.util.KEY_CODES

        if e.type is 'keyup'
            switch e.keyCode
                when key.UP, key.Z
                    @parent.speedY *= 0.5
                    @parent.setState PlayerStateFalling


    update: (cycleLength) -> # PlayerStateJumping::update
        if @parent.speedY >= 0
            @parent.setState PlayerStateFalling



Leo.PlayerStateFalling =
class PlayerStateFalling extends PlayerStateAir



Leo.Layer =
class Layer
    constructor: (properties) -> # Layer::constructor
        # Defaults
        @spritesheet = '' # Name of the spritesheet file
        @chunks = [
            chunkOffsetX: 0
            chunkOffsetY: 0
            colBoxes: [] # [tl1,tr1,bl1,br1, ... tln,trn,bln,brn]
            tileOffsetX: 0 # Number of tiles offset in X
            tileOffsetY: 0 # Number of tiles offset in Y
            tiles:[] # Tile sprite positions [x1,y1, ... xn, yn] -1 is nothing/transparent
        ]
        @isLooping = false
        @parallax = 1.0

        # User defined properties
        for key, val of properties
            @[key] = val
        @spriteImg = Leo.sprite.getImg @spritesheet
        layer = this
        @spriteImg.addEventListener 'load', ->
            if not layer.chunks
                return
            for chunk in layer.chunks
                chunk.redraw()
            return

        @layerNumTilesX = 0
        for chunk, i in @chunks
            @chunks[i] = new Chunk(this, chunk)
            @layerNumTilesX += chunk.tiles.length + chunk.tileOffsetX


    draw: -> # Layer::draw
        if @isLooping
            chunk = @chunks[0]
            posX = Leo.view.posToPx(chunk.tileOffsetX + chunk.chunkOffsetX, 'x', @parallax)
            multiplier = ((Leo.view.cameraPosX / @layerNumTilesX * @parallax) >> 0) - 1
            posX += @layerNumTilesX * Leo.background.tileSize * multiplier
            while posX < _camW
                for chunk in @chunks
                    posY = Leo.view.posToPx(chunk.tileOffsetY + chunk.chunkOffsetY, 'y')
                    chunk.draw(posX, posY)
                    posX += chunk.drawBuffer.width + chunk.tileOffsetXPx
        else
            for chunk in @chunks
                posX = Leo.view.posToPx(chunk.tileOffsetX + chunk.chunkOffsetX, 'x', @parallax)
                posY = Leo.view.posToPx(chunk.tileOffsetY + chunk.chunkOffsetY, 'y')
                chunk.draw(posX, posY)
        return


    getTile: (tileX, tileY, offsetX = 0, offsetY = 0) -> # Layer::getTile
        chunkNo = Math.floor((tileX + offsetX) / @chunks[0].width)
        if chunkNo < 0 or chunkNo > @chunks.length - 1
            return -1
        chunk = @chunks[chunkNo]
        x = tileX - chunk.tileOffsetX + offsetX - chunk.width * chunkNo
        y = tileY - chunk.tileOffsetY + offsetY

        if 0 > x > chunk.width or
        0 > y > chunk.width
            return -1

        return chunk.tiles[x + y * chunk.width] or -1


    setTile: (tileX, tileY, tile) -> # Layer::setTile
        chunkNo = (tileX / @chunks[0].width) >> 0
        chunk = @chunks[chunkNo]
        chunk.drawBufferDirty = true
        x = tileX - chunk.tileOffsetX - chunk.width * chunkNo
        y = tileY - chunk.tileOffsetY
        chunk.tiles[x + y * chunk.width] = tile


    serialize: -> # Layer::serialize
        # Data format:
        # {type}{length}{data}...
        data = ''
        for chunk in @chunks
            data += String.fromCharCode(Leo.core.DATA_TYPES.CHUNK)
            chunkData = chunk.serialize()
            data += String.fromCharCode(chunkData.length) + chunkData
        return data


    deserialize: (data) -> # Layer::deserialize
        chunkOffsetX = 0
        @chunks.length = 0
        t = Leo.core.DATA_TYPES
        i = 0
        while i < data.length
            length = data.charCodeAt(i + 1)
            switch data.charCodeAt(i)
                when t.CHUNK
                    #TODO: Store and read chunk metadata
                    numChunks = @chunks.push new Chunk this,
                        width: 30
                        height: 17
                        chunkOffsetX: chunkOffsetX
                        chunkOffsetY: 0
                        tileOffsetX: 0
                        tileOffsetY: 13
                    @chunks[numChunks - 1].deserialize(data.substr(i + 2, length))
                    chunkOffsetX += 30
            i += 2 + length




Leo.Chunk =
class Chunk
    constructor: (layer, data) -> # Chunk::constructor
        @tiles = []
        for name, datum of data
            this[name] = datum

        @layer = layer

        @drawBuffer = document.createElement 'canvas'
        @drawBufferCtx = @drawBuffer.getContext '2d'
        @drawBufferDirty = true
        @drawBuffer.width = @width * Leo.background.tileSize
        @drawBuffer.height = ((@tiles.length / @width) >> 0) * Leo.background.tileSize
        @tileOffsetXPx = @tileOffsetX * Leo.background.tileSize

    draw: (posX, posY) -> # Chunk::draw
        # Don't draw chunks out of view
        if posX < -@drawBuffer.width or posX > _camW or
        posY < -@drawBuffer.height or posY > _camH
            return

        if @drawBufferDirty
            # Redraw chunk
            @drawBufferCtx.clearRect(0, 0, @drawBuffer.width, @drawBuffer.height)
            for i in [0..@tiles.length]
                x = i % @width
                y = ((i / @width) >> 0)
                @drawTile @drawBufferCtx,
                    @tiles[i],
                    x * Leo.background.tileSize,
                    (y + @chunkOffsetY) * Leo.background.tileSize,

            @drawBufferDirty = false

        _frameBufferCtx.drawImage @drawBuffer,
            0, # Source X
            0, # Source Y
            @drawBuffer.width, # Source width
            @drawBuffer.height, # Source height
            posX, # Destionation X
            posY, # Destionation Y
            @drawBuffer.width, # Destination width
            @drawBuffer.height, # Destination height


    redraw: -> # Chunk::redraw
        @drawBufferDirty = true


    drawTile: (ctx, spriteN, posX, posY) -> # Chunk::drawTile
        if spriteN == -1 then return
        tileSize = Leo.background.tileSize
        spriteWidth = 16
        spriteX = spriteN % spriteWidth #TODO: Make Sprite class with properties
        spriteY = (spriteN / spriteWidth) >> 0 #TODO: Make Sprite class with properties

        ctx.drawImage @layer.spriteImg,
            spriteX * tileSize,
            spriteY * tileSize,
            tileSize, # Source width
            tileSize, # Source height
            posX >> 0,
            posY >> 0,
            tileSize, # Destination width
            tileSize, # Destination height


    serialize: -> # Chunk::serialize
        data = ''
        for tile in @tiles
            data += String.fromCharCode(tile + 1) # +1 to make -1 -> 0. We can't store negative numbers.
        return data
        #TODO: Compress consecutive identical tiles


    deserialize: (data) -> # Chunk::deserialize
        @drawBufferDirty = true
        @tiles.length = 0
        for i in [0..data.length]
            @tiles.push data.charCodeAt(i) - 1  # -1 to reverse +1 from Chunk::serialize
        @drawBuffer.height = ((@tiles.length / @width) >> 0) * Leo.background.tileSize