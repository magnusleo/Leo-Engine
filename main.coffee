#Copyright 2013 Magnus Leo. All rights reserved.

#Internal variables
el = (id) -> document.getElementById id
canvas = null
ctx = null
latestFrameAt = Date.now()

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
            , 30000)
            webkitRequestAnimationFrame(Leo.cycle)
        Leo.background.sprite.src = '_img/sprite-background.png'

    draw: ->
        #Sky
        ctx.fillStyle = Leo.background.color
        ctx.fillRect 0, 0, canvas.width, canvas.height

        #Render background chunks
        for chunk in Leo.view.chunks
            console.log chunk.chunkOffsetX
            for column, x in chunk.tiles
                for tile, y in column by 2
                    Leo.background.draw(
                        column[y],
                        column[y + 1],
                        (x + chunk.tileOffsetX + Leo.view.cameraPosX + chunk.chunkOffsetX) * Leo.background.tileSize * Leo.view.scale,
                        ((y >> 1) + chunk.tileOffsetY + Leo.view.cameraPosY + chunk.chunkOffsetY) * Leo.background.tileSize * Leo.view.scale,
                    )

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
        thisFrameAt = Date.now()
        cycleLength = thisFrameAt - latestFrameAt

        Leo.view.cameraPosX += Leo.view.cameraSpeedX * cycleLength * 0.001
        Leo.draw()

        latestFrameAt = thisFrameAt
        webkitRequestAnimationFrame(Leo.cycle)

    view:
        scale: 2
        cameraPosX: 0.0 # Unit tile
        cameraPosY: 0.0
        cameraSpeedX: -1.0 # One tiles per second, positive is right
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


window.onload = ->
    Leo.init()
