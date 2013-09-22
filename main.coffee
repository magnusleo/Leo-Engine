###Copyright 2013 Magnus Leo. All rights reserved.###

#Internal variables
el = (id) -> document.getElementById id
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

Leo = window.Leo =
    init: ->
        _view = el('leo-view')
        Leo._view = _view

        _frameBuffer.width  = _view.width
        _frameBuffer.height = _view.height

        _view.width          = _view.width  * Leo.view.scale
        _view.height         = _view.height * Leo.view.scale

        _viewCtx = _view.getContext('2d')
        _viewCtx.imageSmoothingEnabled = _viewCtx.webkitImageSmoothingEnabled = false


        window.addEventListener 'keydown', Leo.event._keydown
        window.addEventListener 'keyup',   Leo.event._keyup

        webkitRequestAnimationFrame(Leo.cycle)

    draw: ->
        # Calculate camera pixel values
        _camX = Leo.view.cameraPosX * Leo.background.tileSize
        _camY = Leo.view.cameraPosY * Leo.background.tileSize
        _camW = Leo.view.cameraWidth * Leo.background.tileSize
        _camH = Leo.view.cameraHeight * Leo.background.tileSize

        # Background color
        _frameBufferCtx.fillStyle = Leo.background.color
        _frameBufferCtx.fillRect 0, 0, _view.width, _view.height

        # Render layers
        for layer in Leo.layers
            layer.draw()

        # Render Actors
        for actor in Leo.actors
            actor.draw()

        _viewCtx.drawImage _frameBuffer,
            0,
            0,
            _frameBuffer.width * Leo.view.scale,
            _frameBuffer.height * Leo.view.scale

    cycle: ->
        # Frame timing
        thisFrameTime = Date.now()
        cycleLengthMs = thisFrameTime - _latestFrameTime # Unit milliseconds
        cycleLengthS = cycleLengthMs * 0.001 # Unit seconds

        # Camera
        Leo.view.cameraPosX += Leo.view.cameraSpeedX * cycleLengthS

        # Actors
        for actor in Leo.actors
            # Animation
            actor.advanceAnimation cycleLengthMs

            # Position
            actor.posX += actor.speedX
            actor.posY += actor.speedY

        # Finish the frame
        Leo.draw()
        _latestFrameTime = thisFrameTime
        webkitRequestAnimationFrame(Leo.cycle)

        Leo.cycleCallback()
    cycleCallback: -> # Override Leo.cycleCallback with your own function

    view:
        scale: 2
        cameraPosX: 2.0 # Unit tile
        cameraPosY: 0.0
        cameraSpeedX: 0.0 # One tiles per second, positive is right
        cameraSpeedY: 0.0
        cameraWidth: 30
        cameraHeight: 17
    
    background:
        tileSize: 16
        color: '#6ec0ff'

    actors: []
    layers: []
    event:
        _keydown: (e) ->
            e.preventDefault()

            # Prevent keydown repeat
            keyIndex = _pressedKeys.indexOf e.keyCode
            if keyIndex is -1
                _pressedKeys.push e.keyCode
                Leo.event.keydown e

        keydown: (e) ->
            # Override Leo.event.keydown with your keydown function

        _keyup: (e) ->
            e.preventDefault()
            keyIndex = _pressedKeys.indexOf e.keyCode
            if keyIndex isnt -1
                _pressedKeys.splice keyIndex, 1
            Leo.event.keyup e

        keyup: (e) ->
            # Override Leo.event.keyup with your keyup function

    sprites:
        getImg: (path) ->
            _img = Leo.sprites._img
            if _img[path]
                return _img[path]
            else
                _imgObj = _img[path] = new Image()
                _imgObj.src = '_img/' + path
                return _imgObj

        remove: (path) ->
            _img = Leo.sprites._img
            if _img[path] then _img[path] = null

        _img: {} # Hashmap of image objects with the sprite path as key

    util:
        KEY_CODES: {8:'backspace',9:'tab',13:'enter',16:'shift',17:'ctrl',18:'alt',19:'pause/break',20:'caps lock',27:'escape',33:'page up',34:'page down',35:'end',36:'home',37:'left',38:'up',39:'right',40:'down',45:'insert',46:'delete',48:'0',49:'1',50:'2',51:'3',52:'4',53:'5',54:'6',55:'7',56:'8',57:'9',65:'a',66:'b',67:'c',68:'d',69:'e',70:'f',71:'g',72:'h',73:'i',74:'j',75:'k',76:'l',77:'m',78:'n',79:'o',80:'p',81:'q',82:'r',83:'s',84:'t',85:'u',86:'v',87:'w',88:'x',89:'y',90:'z',91:'left window key',92:'right window key',93:'select key',96:'numpad 0',97:'numpad 1',98:'numpad 2',99:'numpad 3',100:'numpad 4',101:'numpad 5',102:'numpad 6',103:'numpad 7',104:'numpad 8',105:'numpad 9',106:'multiply',106:'*',107:'add',107:'+',109:'subtract',110:'decimal point',111:'divide',112:'f1',113:'f2',114:'f3',115:'f4',116:'f5',117:'f6',118:'f7',119:'f8',120:'f9',121:'f10',122:'f11',123:'f12',144:'num lock',145:'scroll lock',186:'semi-colon',186:';',187:'equal sign',187:'=',188:'comma',188:',',189:'dash',189:'-',190:'period',190:'.',191:'forward slash',191:'/',192:'grave accent',219:'open bracket',219:'[',220:'back slash',220:'\\',221:'close braket',221:']',222:'single quote',222:'\''}


class LeoActor
    constructor: (properties) ->
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
        @spriteImg = Leo.sprites.getImg @spritesheet

    draw: ->
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

    setAnimation: (animName = '') ->
        @animFrame = 0
        @animFrameTimeLeft = @animations[animName].frames[0][6]
        @animName = animName

    advanceAnimation: (cycleLengthMs) ->
        animation = @animations[@animName]
        maxFrame = animation.frames.length - 1
        if @animFrame > maxFrame then @animFrame = maxFrame
        @animFrameTimeLeft -= cycleLengthMs
        while @animFrameTimeLeft < 0
            @animFrame++
            if @animFrame > maxFrame
                if animation.doLoop then @animFrame = 0 else @animFrame--
            @animFrameTimeLeft = animation.frames[@animFrame][6] + @animFrameTimeLeft


class LeoLayer
    constructor: (properties) ->
        # Defaults
        @spritesheet = '' # Name of the spritesheet file
        @tileSize = 16 # Pixel size of one tile
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
        @spriteImg = Leo.sprites.getImg @spritesheet

        @layerNumTilesX = 0
        for chunk in @chunks
            chunk.drawBuffer = document.createElement 'canvas'
            chunk.drawBufferCtx = chunk.drawBuffer.getContext '2d'
            chunk.drawBufferDirty = true
            chunk.drawBuffer.width = chunk.tiles.length * @tileSize
            chunk.drawBuffer.height = chunk.tiles[0].length / 2 * @tileSize
            chunk.tileOffsetXPx = chunk.tileOffsetX * @tileSize
            @layerNumTilesX += chunk.tiles.length + chunk.tileOffsetX


    draw: ->
        if @isLooping
            chunk = @chunks[0]
            posX = ((chunk.tileOffsetX - Leo.view.cameraPosX + chunk.chunkOffsetX) * Leo.background.tileSize * @parallax) >> 0
            multiplier = ((Leo.view.cameraPosX / @layerNumTilesX * @parallax) >> 0) - 1
            posX += @layerNumTilesX * Leo.background.tileSize * multiplier
            while posX < _camW
                for chunk in @chunks
                    posY = ((chunk.tileOffsetY - Leo.view.cameraPosY + chunk.chunkOffsetY) * Leo.background.tileSize) >> 0
                    @drawChunk(chunk, posX, posY)
                    posX += chunk.drawBuffer.width + chunk.tileOffsetXPx
        else
            for chunk in @chunks
                posX = ((chunk.tileOffsetX - Leo.view.cameraPosX + chunk.chunkOffsetX) * Leo.background.tileSize * @parallax) >> 0
                posY = ((chunk.tileOffsetY - Leo.view.cameraPosY + chunk.chunkOffsetY) * Leo.background.tileSize) >> 0
                @drawChunk(chunk, posX, posY)
        return


    drawChunk: (chunk, posX, posY) ->
        # Don't draw chunks out of view
        if posX < -chunk.drawBuffer.width or posX > _camW or
        posY < -chunk.drawBuffer.height or posY > _camH
            return

        if chunk.drawBufferDirty
            # Redraw chunk
            for column, x in chunk.tiles
                for tile, y in column by 2
                    @drawTile chunk.drawBufferCtx,
                        column[y],
                        column[y + 1],
                        x * Leo.background.tileSize,
                        ((y >> 1) + chunk.chunkOffsetY) * Leo.background.tileSize,
            chunk.drawBufferDirty = false

        _frameBufferCtx.drawImage chunk.drawBuffer,
            0, # Source X
            0, # Source Y
            chunk.drawBuffer.width, # Source width
            chunk.drawBuffer.height, # Source height
            posX, # Destionation X
            posY, # Destionation Y
            chunk.drawBuffer.width, # Destination width
            chunk.drawBuffer.height, # Destination height


    drawTile: (ctx, spriteX, spriteY, posX, posY) ->
        if spriteX == -1 or spriteY == -1 then return

        ctx.drawImage @spriteImg,
            spriteX * @tileSize,
            spriteY * @tileSize,
            @tileSize, # Source width
            @tileSize, # Source height
            posX >> 0,
            posY >> 0,
            @tileSize, # Destination width
            @tileSize, # Destination height



window.onload = ->
    Leo.init()
    Leo.actors.push new LeoActor(
        spritesheet: 'sprite-olle.png'
        animations:
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
    )
    Leo.player = Leo.actors[Leo.actors.length - 1]

    Leo.event.keydown = (e) ->
        switch Leo.util.KEY_CODES[e.keyCode]
            when 'left'
                Leo.player.speedX = -0.15
                Leo.player.setAnimation 'runningLeft'
            when 'right'
                Leo.player.speedX = 0.15
                Leo.player.setAnimation 'runningRight'
            when 'r'
                window.location.reload()

    Leo.event.keyup = (e) ->
        switch Leo.util.KEY_CODES[e.keyCode]
            when 'left'
                Leo.player.setAnimation 'standingLeft'
                Leo.player.speedX = 0
            when 'right'
                Leo.player.setAnimation 'standingRight'
                Leo.player.speedX = 0

    Leo.cycleCallback = ->
        Leo.view.cameraPosX = Leo.player.posX - 15

    Leo.layers.push new LeoLayer(
        name: 'mountains'
        spritesheet: 'sprite-background.png'
        isLooping: true
        parallax: 0.5
        chunks: [
            chunkOffsetX: 0
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 0
            tileOffsetY: 10
            tiles:[
                [-1,-1, 4,1,   4,2,   4,3,   4,3, 4,4,  7,0]
                [5,0,   5,1,   5,2,   5,3,   5,4, 4,4,  8,0]
                [6,0,   6,1,   6,2,   6,3,   6,3, 4,4,  9,0]
                [-1,-1, 7,1,   7,2,   7,3,   7,4, 4,4, 10,0]
                [-1,-1, -1,-1, 8,2,   8,3,   8,4, 4,4, 11,0]
                [-1,-1, -1,-1, -1,-1, 9,3,   9,4, 4,4,  7,0]
                [-1,-1, -1,-1, 10,2,  10,3, 10,4, 4,4,  8,0]
                [-1,-1, 11,1,  11,2,  11,3, 11,4, 4,4,  9,0]
                [-1,-1, 12,1,  12,2,  12,3, 12,4, 4,4, 10,0]
                [-1,-1, -1,-1, 13,2,  13,3, 13,4, 4,4, 11,0]
            ]
        ]
    )

    Leo.layers.push new LeoLayer(
        name: 'cloud 1'
        spritesheet: 'sprite-background.png'
        isLooping: true
        parallax: 0.21
        chunks: [
            chunkOffsetX: 50
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 30
            tileOffsetY: 3
            tiles:[
                [0,0, 0,1]
                [1,0, 1,1]
                [2,0, 2,1]
                [3,0, 3,1]
            ]
        ]
    )

    Leo.layers.push new LeoLayer(
        name: 'cloud 2'
        spritesheet: 'sprite-background.png'
        isLooping: true
        parallax: 0.2
        chunks: [
            chunkOffsetX: 0
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 29
            tileOffsetY: 5
            tiles:[
                [0,0, 0,1]
                [1,0, 1,1]
                [2,0, 2,1]
                [3,0, 3,1]
            ]
        ]
    )

    Leo.layers.push new LeoLayer(
        name: 'ground'
        spritesheet: 'sprite-background.png'
        chunks: [
            chunkOffsetX: 0
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 0
            tileOffsetY: 13
            tiles:[
                [-1,-1, 0,2, 0,3, 0,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [4,0, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
            ]
        ,
            chunkOffsetX: 30
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 0
            tileOffsetY: 13
            tiles: [
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [4,0, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 2,2, 2,3, 2,3]
                [-1,-1, 1,2, 1,3, 1,3]
                [-1,-1, 3,2, 3,3, 3,3]
            ]
        ]
    )
