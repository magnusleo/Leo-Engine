#Copyright 2013 Magnus Leo. All rights reserved.

#Internal variables
el = (id) -> document.getElementById id
canvas = null
ctx = null

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
            Leo.draw()
        Leo.background.sprite.src = '_img/sprite-background.png'

    draw: ->
        #Sky
        ctx.fillStyle = Leo.background.color
        ctx.fillRect 0, 0, canvas.width, canvas.height

        #Ground
        # i = 0
        # numTiles = canvas.width / Leo.view.scale / Leo.background.tileSize
        # while i < numTiles
        #     Leo.background.draw(0, 0, i, 15)
        #     Leo.background.draw(0, 1, i, 16)
        #     Leo.background.draw(0, 1, i, 17)
        #     i++

        #Render background chunks
        for chunk in Leo.view.chunks
            for column, x in chunk.tiles
                for tile, y in column by 2
                    #TODO: Don't draw transparent tiles (column[y * 2] == 0)
                    console.log y #Debug
                    Leo.background.draw(
                        column[y * 2],
                        column[y * 2 + 1],
                        x + chunk.tileOffsetX,
                        y + chunk.tileOffsetY,
                    )

        #Cloud
        Leo.background.draw(3, 0, 5, 6)
        Leo.background.draw(4, 0, 6, 6)
        Leo.background.draw(5, 0, 7, 6)
        Leo.background.draw(6, 0, 8, 6)
        Leo.background.draw(3, 1, 5, 7)
        Leo.background.draw(4, 1, 6, 7)
        Leo.background.draw(5, 1, 7, 7)
        Leo.background.draw(6, 1, 8, 7)

    view:
        scale: 2
        chunks: [
            colBoxes: [] # [tl1,tr1,bl1,br1, ... tln,trn,bln,brn]
            tileOffsetX: 0 # Number of tiles offset in X
            tileOffsetY: 13 # Number of tiles offset in Y
            tiles: [ # Tile sprite positions [x1,y1, ... xn, yn] -1 is nothing/transparent
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
            console.log spriteX, spriteY, posX, posY #Debug
            ctx.drawImage this.sprite,
                spriteX * this.tileSize,
                spriteY * this.tileSize,
                this.tileSize, #Source width
                this.tileSize, #Source height
                posX * this.tileSize * Leo.view.scale,
                posY * this.tileSize * Leo.view.scale,
                this.tileSize * Leo.view.scale, #Destination width
                this.tileSize * Leo.view.scale, #Destination height


window.onload = ->
    Leo.init()
