###Copyright 2013 Magnus Leo. All rights reserved.###

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
_editTile = [-1, -1]

# Public variables
Leo.environment =
    gravity: 1.0 # Tiles per second^2

Leo.view =
    scale: 2
    cameraPosX: 2.0 # Unit tile
    cameraPosY: 0.0
    cameraSpeedX: 0.0 # One tiles per second, positive is right
    cameraSpeedY: 0.0
    cameraWidth: 30
    cameraHeight: 17

Leo.background =
    tileSize: 16
    color: '#6ec0ff'

Leo.actors = []


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
        chunkW   = Leo.view.cameraWidth
        chunkH   = Leo.view.cameraHeight
        tileSize = Leo.background.tileSize

        chunkX   = ((camX + mouseX / scale / tileSize) / chunkW) >> 0
        tileX    = (mouseX / scale / tileSize - (chunkX * chunkW - camX)) >> 0

        chunkY   = ((camY + mouseY / scale / tileSize) / chunkH) >> 0
        tileY    = (mouseY / scale / tileSize - (chunkY * chunkH - camY)) >> 0

        layer = Leo.layers.get('ground')
        tile     = layer.getTile(chunkX, tileX, tileY)

        if e.altKey
            _editTile = tile
        else
           layer.setTile(chunkX, tileX, tileY, _editTile)

        #TODO: Use this information for something, like drawing!

    _view.addEventListener 'mouseup', (e) ->
        e.preventDefault()

    window.addEventListener 'keydown', Leo.event._keydown
    window.addEventListener 'keyup',   Leo.event._keyup

    window.requestAnimationFrame(Leo.core.cycle)

Leo.core.draw = ->
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

    _viewCtx.drawImage _frameBuffer,
        0,
        0,
        _frameBuffer.width * Leo.view.scale,
        _frameBuffer.height * Leo.view.scale

Leo.core.cycle = ->
    # Frame timing
    thisFrameTime = Date.now()
    cycleLengthMs = thisFrameTime - _latestFrameTime # Unit milliseconds
    cycleLengthS = cycleLengthMs * 0.001 # Unit seconds

    # Camera
    Leo.view.cameraPosX += Leo.view.cameraSpeedX * cycleLengthS

    # Actors
    for actor in Leo.actors
        actor.update(cycleLengthMs)

    # Finish the frame
    Leo.core.draw()
    _latestFrameTime = thisFrameTime
    window.requestAnimationFrame(Leo.core.cycle)

    Leo.cycleCallback()


Leo.cycleCallback = -> # Override Leo.cycleCallback with your own function


# Events
Leo.event = {}

Leo.event._keydown = (e) ->
    e.preventDefault()

    # Prevent keydown repeat
    keyIndex = _pressedKeys.indexOf e.keyCode
    if keyIndex is -1
        _pressedKeys.push e.keyCode
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




# Utilities
Leo.util = {}

Leo.util.KEY_CODES = {'BACKSPACE':8,'TAB':9,'ENTER':13,'SHIFT':16,'CTRL':17,'ALT':18,'PAUSE_BREAK':19,'CAPS_LOCK':20,'ESCAPE':27,'PAGE_UP':33,'PAGE_DOWN':34,'END':35,'HOME':36,'LEFT':37,'UP':38,'RIGHT':39,'DOWN':40,'INSERT':45,'DELETE':46,'0':48,'1':49,'2':50,'3':51,'4':52,'5':53,'6':54,'7':55,'8':56,'9':57,'A':65,'B':66,'C':67,'D':68,'E':69,'F':70,'G':71,'H':72,'I':73,'J':74,'K':75,'L':76,'M':77,'N':78,'O':79,'P':80,'Q':81,'R':82,'S':83,'T':84,'U':85,'V':86,'W':87,'X':88,'Y':89,'Z':90,'LEFT_WINDOW_KEY':91,'RIGHT_WINDOW_KEY':92,'SELECT_KEY':93,'NUMPAD_0':96,'NUMPAD_1':97,'NUMPAD_2':98,'NUMPAD_3':99,'NUMPAD_4':100,'NUMPAD_5':101,'NUMPAD_6':102,'NUMPAD_7':103,'NUMPAD_8':104,'NUMPAD_9':105,'MULTIPLY':106,'*':106,'ADD':107,'+':107,'SUBTRACT':109,'DECIMAL_POINT':110,'DIVIDE':111,'F1':112,'F2':113,'F3':114,'F4':115,'F5':116,'F6':117,'F7':118,'F8':119,'F9':120,'F10':121,'F11':122,'F12':123,'NUM_LOCK':144,'SCROLL_LOCK':145,'SEMI-COLON':186,';':186,'EQUAL_SIGN':187,'=':187,'COMMA':188,',':188,'DASH':189,'-':189,'PERIOD':190,'.':190,'FORWARD_SLASH':191,'/':191,'GRAVE_ACCENT':192,'OPEN_BRACKET':219,'[':219,'BACK_SLASH':220,'\\':220,'CLOSE_BRAKET':221,']':221,'SINGLE_QUOTE':222,'\'':222}


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


    draw: -> # Actor::draw
        frame = @animations[@animName].frames[@animFrame]
        _frameBufferCtx.drawImage @spriteImg,
            frame[0], # Source x
            frame[1], # Source y
            frame[2], # Source width
            frame[3], # Source height
            ((@posX - Leo.view.cameraPosX) * Leo.background.tileSize + frame[4]) >> 0, # Position + frame offset X
            ((@posY - Leo.view.cameraPosY) * Leo.background.tileSize + frame[5]) >> 0, # Position + frame offset Y
            frame[2], # Destination width
            frame[3], # Destination height


    setAnimation: (animName = '', animFrame = 0) -> # Actor::setAnimation
        @animFrame = animFrame
        @animFrameTimeLeft = @animations[animName].frames[0][6]
        @animName = animName


    advanceAnimation: (cycleLengthMs) -> # Actor::advanceAnimation
        animation = @animations[@animName]
        maxFrame = animation.frames.length - 1
        if @animFrame > maxFrame then @animFrame = maxFrame
        @animFrameTimeLeft -= cycleLengthMs
        while @animFrameTimeLeft < 0
            @animFrame++
            if @animFrame > maxFrame
                if animation.doLoop then @animFrame = 0 else @animFrame--
            @animFrameTimeLeft = animation.frames[@animFrame][6] + @animFrameTimeLeft


    update: (cycleLengthMs) -> # Actor::update
        # Animation
        @advanceAnimation cycleLengthMs

        # Position
        @posX += @speedX
        @posY += @speedY



Leo.Player =
class Player extends Actor

    constructor: (data) -> # Player::constructor
        super(data)
        Leo.actors.push this

        @state = new PlayerStateStanding(this)
        @stateBefore = null


    setState: (state) -> # Player::setState
        if @state is state
            return
        @stateBefore = @state
        @state = new state(this)


    handleInput: (e) -> # Player::handleInput
        @state.handleInput(e)


    update: (cycleLengthMs) -> # Player::update
        @speedY += Leo.environment.gravity * cycleLengthMs * 0.001

        super(cycleLengthMs)
        @state.update(cycleLengthMs)

        if @posY > 12 #Debug
            @posY = 12



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
                @parent.direction = -1

            when key.RIGHT
                @parent.direction = 1


    update: (cycleLengthMs) -> # PlayerState::update



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

        @parent.speedX = 0

        if @parent.direction > 0
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
            @parent.animFrame = 1


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
                    keyIndexLeft = _pressedKeys.indexOf key.LEFT
                    keyIndexRight = _pressedKeys.indexOf key.RIGHT
                    if keyIndexLeft is -1 and keyIndexRight is -1
                        @parent.setState PlayerStateStanding
                    else if keyIndexLeft is -1 and keyIndexRight > -1
                        @parent.direction = 1
                        @_setSpeedAndAnim { animFrame: 1 }
                    else # if keyIndexLeft > -1 and keyIndexRight is -1
                        @parent.direction = -1
                        @_setSpeedAndAnim { animFrame: 1 }


    _setSpeedAndAnim: (options = {})-> # PlayerStateRunning::_setSpeedAndAnim
        @parent.speedX = 0.15 * @parent.direction
        if @parent.direction > 0
            @parent.setAnimation 'runningRight', options.animFrame
        else
            @parent.setAnimation 'runningLeft', options.animFrame


Leo.PlayerStateAir =
class PlayerStateAir extends PlayerState

    constructor: (data) -> # PlayerStateAir::constructor
        super(data)


    handleInput: (e) -> # PlayerStateAir::handleInput
        super(e)


    update: (cycleLengthMs) -> # PlayerStateAir::update
        super(cycleLengthMs)
        if @parent.posY >= 12 #Debug
            if @parent.speedX == 0
                @parent.setState PlayerStateStanding
            else
                @parent.setState PlayerStateRunning



Leo.PlayerStateJumping =
class PlayerStateJumping extends PlayerStateAir

    constructor: (data) -> # PlayerStateJumping::constructor
        super(data)

        @parent.speedY = -0.35

        if @parent.direction > 0
            @parent.setAnimation 'jumpingRight'
        else
            @parent.setAnimation 'jumpingLeft'


    handleInput: (e) -> # PlayerStateJumping::handleInput
        super(e)
        key = Leo.util.KEY_CODES

        if e.type is 'keydown'
            switch e.keyCode
                when key.LEFT
                    @parent.direction = -1
                    @_setSpeedAndAnim()

                when key.RIGHT
                    @parent.direction = 1
                    @_setSpeedAndAnim()

        else if e.type is 'keyup'
            switch e.keyCode
                when key.LEFT, key.RIGHT
                    keyIndexLeft = _pressedKeys.indexOf key.LEFT
                    keyIndexRight = _pressedKeys.indexOf key.RIGHT
                    if keyIndexLeft is -1 and keyIndexRight is -1
                        @parent.speedX = 0
                    else if keyIndexLeft is -1 and keyIndexRight > -1
                        @parent.direction = 1
                        @_setSpeedAndAnim()
                    else # if keyIndexLeft > -1 and keyIndexRight is -1
                        @parent.direction = -1
                        @_setSpeedAndAnim()


    _setSpeedAndAnim: -> # PlayerStateJumping::_setSpeedAndAnim
        @parent.speedX = 0.15 * @parent.direction
        if @parent.direction > 0
            @parent.setAnimation 'jumpingRight'
        else
            @parent.setAnimation 'jumpingLeft'



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
            posX = ((chunk.tileOffsetX - Leo.view.cameraPosX + chunk.chunkOffsetX) * Leo.background.tileSize * @parallax) >> 0
            multiplier = ((Leo.view.cameraPosX / @layerNumTilesX * @parallax) >> 0) - 1
            posX += @layerNumTilesX * Leo.background.tileSize * multiplier
            while posX < _camW
                for chunk in @chunks
                    posY = ((chunk.tileOffsetY - Leo.view.cameraPosY + chunk.chunkOffsetY) * Leo.background.tileSize) >> 0
                    chunk.draw(posX, posY)
                    posX += chunk.drawBuffer.width + chunk.tileOffsetXPx
        else
            for chunk in @chunks
                posX = ((chunk.tileOffsetX - Leo.view.cameraPosX + chunk.chunkOffsetX) * Leo.background.tileSize * @parallax) >> 0
                posY = ((chunk.tileOffsetY - Leo.view.cameraPosY + chunk.chunkOffsetY) * Leo.background.tileSize) >> 0
                chunk.draw(posX, posY)
        return


    getTile: (chunkX, tileX, tileY) -> # Layer::getTile
        chunk = @chunks[chunkX]
        x = tileX - chunk.tileOffsetX
        y = (tileY - chunk.tileOffsetY) * 2
        column = chunk.tiles[x]
        tile = [column[y], column[y + 1]]
        return tile


    setTile: (chunkX, tileX, tileY, tile) -> # Layer::setTile
        chunk = @chunks[chunkX]
        chunk.drawBufferDirty = true
        x = tileX - chunk.tileOffsetX
        y = (tileY - chunk.tileOffsetY) * 2
        column = chunk.tiles[x]
        column[y] = tile[0]
        column[y + 1] = tile[1]



Leo.Chunk =
class Chunk
    constructor: (layer, data) -> # Chunk::constructor
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
        if spriteX == -1 or spriteY == -1 then return
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



window.onload = ->
    Leo.core.init()

    Leo.event.keydown = (e) ->
        key = Leo.util.KEY_CODES
        switch e.keyCode
            when key.R
                window.location.reload()
            else
                Leo.player.handleInput(e)

    Leo.event.keyup = (e) ->
        Leo.player.handleInput(e)

    Leo.player = new Leo.Player
        spritesheet: 'sprite-olle.png'
        animations:
            jumpingLeft:
                frames: [
                    [19,33, 30,32, -4,0, 192]
                ]
                doLoop: false
            jumpingRight:
                frames: [
                    [19,0, 30,32, -8,0, 192]
                ]
                doLoop: false
            runningLeft:
                frames: [
                    [19,33, 30,32, -4,0, 192]
                    [49,33, 13,32,  4,0, 192]
                ]
                doLoop: true
            runningRight:
                frames: [
                    [19,0, 30,32, -8,0, 192]
                    [49,0, 13,32,  1,0, 192]
                ]
                doLoop: true
            standingLeft:
                frames: [
                    [0,33, 19,32, 1,0, 1000]
                ]
                doLoop: false
            standingRight:
                frames: [
                    [0,0, 19,32, -1,0, 1000]
                ]
                doLoop: false
        animName: 'standingRight'
        posX: 6
        posY: 12

    Leo.cycleCallback = ->
        Leo.view.cameraPosX = Leo.player.posX - 15

    Leo.layers.add new Leo.Layer
        id: 'mountains'
        spritesheet: 'sprite-background.png'
        isLooping: true
        parallax: 0.5
        chunks: [
            chunkOffsetX: 0
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 0
            tileOffsetY: 10
            tiles: [-1,5,6,-1,-1,-1,-1,-1,-1,-1,20,21,22,23,-1,-1,-1,27,28,-1,36,37,38,39,40,-1,42,43,44,45,52,53,54,55,56,57,58,59,60,61,68,69,70,71,72,73,74,75,76,77,68,68,68,68,68,68,68,68,68,68,7,8,9,10,11,7,8,9,10,11]
            width: 10
        ]

    Leo.layers.add new Leo.Layer
        id: 'cloud 1'
        spritesheet: 'sprite-background.png'
        isLooping: true
        parallax: 0.21
        chunks: [
            chunkOffsetX: 50
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 30
            tileOffsetY: 3
            tiles: [0,1,2,3,16,17,18,19]
            width: 4
        ]

    Leo.layers.add new Leo.Layer
        id: 'cloud 2'
        spritesheet: 'sprite-background.png'
        isLooping: true
        parallax: 0.2
        chunks: [
            chunkOffsetX: 0
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 29
            tileOffsetY: 5
            tiles: [0,1,2,3,16,17,18,19]
            width: 4
        ]

    Leo.layers.add new Leo.Layer
        id: 'ground'
        spritesheet: 'sprite-background.png'
        chunks: [
            chunkOffsetX: 0
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 0
            tileOffsetY: 13
            tiles: [-1,-1,-1,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,32,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,35,48,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,51,48,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,51]
            width: 30
        ,
            chunkOffsetX: 30
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 0
            tileOffsetY: 13
            tiles: [-1,-1,-1,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,32,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,34,33,35,48,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,51,48,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,50,49,51]
            width: 30
        ]
