###Copyright 2013 Magnus Leo. All rights reserved.###

#Internal variables
el = (id) -> document.getElementById id
_canvas = null
_ctx = null
_latestFrameTime = Date.now()

Leo = window.Leo =
    init: ->
        _canvas = el('leo-view')
        _canvas.width = _canvas.width * Leo.view.scale;
        _canvas.height = _canvas.height * Leo.view.scale;

        _ctx = _canvas.getContext('2d')
        _ctx.imageSmoothingEnabled = false;
        _ctx.webkitImageSmoothingEnabled = false;

        Leo.background.sprite = new Image()
        Leo.background.sprite.onload = ->
            webkitRequestAnimationFrame(Leo.cycle)
        Leo.background.sprite.src = '_img/sprite-background.png'

    draw: ->
        # Background color
        _ctx.fillStyle = Leo.background.color
        _ctx.fillRect 0, 0, _canvas.width, _canvas.height

        #Render background chunks
        for chunk in Leo.view.chunks
            for column, x in chunk.tiles
                for tile, y in column by 2
                    Leo.background.draw(
                        column[y],
                        column[y + 1],
                        (x + chunk.tileOffsetX - Leo.view.cameraPosX + chunk.chunkOffsetX) * Leo.background.tileSize * Leo.view.scale,
                        ((y >> 1) + chunk.tileOffsetY - Leo.view.cameraPosY + chunk.chunkOffsetY) * Leo.background.tileSize * Leo.view.scale,
                    )
        # Render Actors
        for actor in Leo.actors
            frame = actor.animations[actor.animName].frames[actor.animFrame]
            _ctx.drawImage actor.spriteImg,
                frame[0], #Source x
                frame[1], #Source y
                frame[2], #Source width
                frame[3], #Source height
                ((actor.posX - Leo.view.cameraPosX) * Leo.background.tileSize + frame[4]) * Leo.view.scale, # Position + frame offset X
                ((actor.posY - Leo.view.cameraPosY) * Leo.background.tileSize + frame[5]) * Leo.view.scale, # Position + frame offset Y
                frame[2] * Leo.view.scale, #Destination width
                frame[3] * Leo.view.scale, #Destination height

        #Cloud
        Leo.background.draw(3, 0, 5 * Leo.background.tileSize * Leo.view.scale, 6 * Leo.background.tileSize * Leo.view.scale)
        Leo.background.draw(4, 0, 6 * Leo.background.tileSize * Leo.view.scale, 6 * Leo.background.tileSize * Leo.view.scale)
        Leo.background.draw(5, 0, 7 * Leo.background.tileSize * Leo.view.scale, 6 * Leo.background.tileSize * Leo.view.scale)
        Leo.background.draw(6, 0, 8 * Leo.background.tileSize * Leo.view.scale, 6 * Leo.background.tileSize * Leo.view.scale)
        Leo.background.draw(3, 1, 5 * Leo.background.tileSize * Leo.view.scale, 7 * Leo.background.tileSize * Leo.view.scale)
        Leo.background.draw(4, 1, 6 * Leo.background.tileSize * Leo.view.scale, 7 * Leo.background.tileSize * Leo.view.scale)
        Leo.background.draw(5, 1, 7 * Leo.background.tileSize * Leo.view.scale, 7 * Leo.background.tileSize * Leo.view.scale)
        Leo.background.draw(6, 1, 8 * Leo.background.tileSize * Leo.view.scale, 7 * Leo.background.tileSize * Leo.view.scale)

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
            animation = actor.animations[actor.animName]
            maxFrame = animation.frames.length - 1
            if actor.animFrame > maxFrame then actor.animFrame = maxFrame
            actor.animFrameTimeLeft -= cycleLengthMs
            while actor.animFrameTimeLeft < 0
                actor.animFrame++
                if actor.animFrame > maxFrame
                    if animation.doLoop then actor.animFrame = 0
                actor.animFrameTimeLeft = animation.frames[actor.animFrame][6] + actor.animFrameTimeLeft

            # Position
            actor.posX += actor.speedX
            actor.posY += actor.speedY

        # Finish the frame
        Leo.draw()
        _latestFrameTime = thisFrameTime
        webkitRequestAnimationFrame(Leo.cycle)

        Leo.cycleCallback()
    cycleCallback: ->

    view:
        scale: 2
        cameraPosX: 2.0 # Unit tile
        cameraPosY: 0.0
        cameraSpeedX: 0.0 # One tiles per second, positive is right
        cameraSpeedY: 0.0
        chunks: [
            chunkOffsetX: 0 # Chunk offset in tiles from world origo, positive is right
            chunkOffsetY: 0 # Chunk offset in tiles from world origo, positive is up
            colBoxes: [] # [tl1,tr1,bl1,br1, ... tln,trn,bln,brn]
            tileOffsetX: 0 # Number of tiles offset in X
            tileOffsetY: 13 # Number of tiles offset in Y
            tiles:[ # Tile sprite positions [x1,y1, ... xn, yn] -1 is nothing/transparent
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [2,0, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
            ]
        ,
            chunkOffsetX: 30
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 0
            tileOffsetY: 13
            tiles: [
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [2,0, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
                [-1,-1, 0,0, 0,1, 0,1]
                [-1,-1, 1,0, 1,1, 1,1]
            ]
        ]
    
    background:
        tileSize: 16
        color: '#6ec0ff'
        draw: (spriteX, spriteY, posX, posY) ->
            if (spriteX == -1 || spriteY == -1)
                return;

            _ctx.drawImage this.sprite,
                spriteX * this.tileSize,
                spriteY * this.tileSize,
                this.tileSize, #Source width
                this.tileSize, #Source height
                posX,
                posY,
                this.tileSize * Leo.view.scale, #Destination width
                this.tileSize * Leo.view.scale, #Destination height
    actors: []
    util:
        KEY_CODES: {8:'backspace',9:'tab',13:'enter',16:'shift',17:'ctrl',18:'alt',19:'pause/break',20:'caps lock',27:'escape',33:'page up',34:'page down',35:'end',36:'home',37:'left',38:'up',39:'right',40:'down',45:'insert',46:'delete',48:'0',49:'1',50:'2',51:'3',52:'4',53:'5',54:'6',55:'7',56:'8',57:'9',65:'a',66:'b',67:'c',68:'d',69:'e',70:'f',71:'g',72:'h',73:'i',74:'j',75:'k',76:'l',77:'m',78:'n',79:'o',80:'p',81:'q',82:'r',83:'s',84:'t',85:'u',86:'v',87:'w',88:'x',89:'y',90:'z',91:'left window key',92:'right window key',93:'select key',96:'numpad 0',97:'numpad 1',98:'numpad 2',99:'numpad 3',100:'numpad 4',101:'numpad 5',102:'numpad 6',103:'numpad 7',104:'numpad 8',105:'numpad 9',106:'multiply',106:'*',107:'add',107:'+',109:'subtract',110:'decimal point',111:'divide',112:'f1',113:'f2',114:'f3',115:'f4',116:'f5',117:'f6',118:'f7',119:'f8',120:'f9',121:'f10',122:'f11',123:'f12',144:'num lock',145:'scroll lock',186:'semi-colon',186:';',187:'equal sign',187:'=',188:'comma',188:',',189:'dash',189:'-',190:'period',190:'.',191:'forward slash',191:'/',192:'grave accent',219:'open bracket',219:'[',220:'back slash',220:'\\',221:'close braket',221:']',222:'single quote',222:'\''}


class LeoActor
    constructor: (properties) ->
        # Defaults
        @spritesheet = "" # Name of the spritesheet file
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
        @animName = "" # Name of the current animation running
        @posX = 0
        @posY = 0
        @speedX = 0
        @speedY = 0

        # User defined properties
        for key, val of properties
            @[key] = val
        @spriteImg = new Image()
        @spriteImg.src = '_img/' + @spritesheet
    setAnimation: (animName = '') ->
        @animFrame = 0
        @animFrameTimeLeft = @animations[animName].frames[0][6]
        @animName = animName


window.onload = ->
    Leo.init()
    Leo.actors.push new LeoActor(
        spritesheet: "sprite-olle.png"
        animations:
            running:
                frames: [
                    [19,0, 30,32, -9,0, 192]
                    [49,0, 13,32,   0,0, 192]
                ]
                doLoop: true
            standing:
                frames: [
                    [0,0, 19,32, 0,0, 1000]
                ]
                doLoop: true
        animName: "standing"
        posX: 4
        posY: 12
    )
    Leo.player = Leo.actors[Leo.actors.length - 1]

    window.addEventListener 'keydown', (e) ->
        e.preventDefault()
        #TODO: Add Leo.events.keydown that handles keyboard repeat
        switch Leo.util.KEY_CODES[e.keyCode]
            when 'left'
                Leo.player.speedX = -0.15
                Leo.player.setAnimation "running"
            when 'right'
                Leo.player.speedX = 0.15
                Leo.player.setAnimation "running"

    window.addEventListener 'keyup', (e) ->
        Leo.player.speedX = 0
        Leo.player.setAnimation "standing"

    Leo.cycleCallback = ->
        Leo.view.cameraPosX = Leo.player.posX - 15
