###Copyright 2013 Magnus Leo. All rights reserved.###

#Internal variables
el = (id) -> document.getElementById id
canvas = null
ctx = null
latestFrameTime = Date.now()

Leo = window.Leo =
    init: ->
        canvas = el('leo-view')
        canvas.width = canvas.width * Leo.view.scale;
        canvas.height = canvas.height * Leo.view.scale;

        ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;

        Leo.background.sprite = new Image()
        Leo.background.sprite.onload = ->
            setInterval(->
                Leo.view.cameraPosX = 0.0
            , 15000)
            webkitRequestAnimationFrame(Leo.cycle)
        Leo.background.sprite.src = '_img/sprite-background.png'

    draw: ->
        #Sky
        ctx.fillStyle = Leo.background.color
        ctx.fillRect 0, 0, canvas.width, canvas.height

        #Render background chunks
        for chunk in Leo.view.chunks
            for column, x in chunk.tiles
                for tile, y in column by 2
                    Leo.background.draw(
                        column[y],
                        column[y + 1],
                        (x + chunk.tileOffsetX + Leo.view.cameraPosX + chunk.chunkOffsetX) * Leo.background.tileSize * Leo.view.scale,
                        ((y >> 1) + chunk.tileOffsetY + Leo.view.cameraPosY + chunk.chunkOffsetY) * Leo.background.tileSize * Leo.view.scale,
                    )
        # Render Actors
        for actor in Leo.actors
            frame = actor.animations[actor.animName].frames[actor.animFrame]
            ctx.drawImage actor.spriteImg,
                frame[0], #Source x
                frame[1], #Source y
                frame[2], #Source width
                frame[3], #Source height
                (actor.posX + frame[4]) * Leo.view.scale, # Position + frame offset X
                (actor.posY + frame[5]) * Leo.view.scale, # Position + frame offset Y
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
        cycleLengthMs = thisFrameTime - latestFrameTime # Unit milliseconds
        cycleLengthS = cycleLengthMs * 0.001 # Unit seconds

        # Camera
        Leo.view.cameraPosX += Leo.view.cameraSpeedX * cycleLengthS

        # Actors
        for actor in Leo.actors
            #Animation
            animation = actor.animations[actor.animName]
            maxFrame = animation.frames.length - 1
            actor.animFrameTimeLeft -= cycleLengthMs
            while actor.animFrameTimeLeft < 0
                actor.animFrame++
                if actor.animFrame > maxFrame
                    if animation.doLoop then actor.animFrame = 0
                actor.animFrameTimeLeft = animation.frames[actor.animFrame][6] + actor.animFrameTimeLeft

        # Finish the frame
        Leo.draw()
        latestFrameTime = thisFrameTime
        webkitRequestAnimationFrame(Leo.cycle)

    view:
        scale: 2
        cameraPosX: 0.0 # Unit tile
        cameraPosY: 0.0
        cameraSpeedX: -2.0 # One tiles per second, positive is right
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

            ctx.drawImage this.sprite,
                spriteX * this.tileSize,
                spriteY * this.tileSize,
                this.tileSize, #Source width
                this.tileSize, #Source height
                posX,
                posY,
                this.tileSize * Leo.view.scale, #Destination width
                this.tileSize * Leo.view.scale, #Destination height
    actors: []

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
        animName: "running"
        posX: 128
        posY: 192
    )
