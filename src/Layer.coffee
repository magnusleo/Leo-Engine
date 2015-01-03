### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

core = require('./core')
background = require('./background')
layers = require('./layers')
view = require('./view')

module.exports =
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
        @spriteImg = layers.getImg @spritesheet
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
            posX = view.posToPx(chunk.tileOffsetX + chunk.chunkOffsetX, 'x', @parallax)
            multiplier = ((view.cameraPosX / @layerNumTilesX * @parallax) >> 0) - 1
            posX += @layerNumTilesX * background.tileSize * multiplier
            while posX < core.camW
                for chunk in @chunks
                    posY = view.posToPx(chunk.tileOffsetY + chunk.chunkOffsetY, 'y')
                    chunk.draw(posX, posY)
                    posX += chunk.drawBuffer.width + chunk.tileOffsetXPx
        else
            for chunk in @chunks
                posX = view.posToPx(chunk.tileOffsetX + chunk.chunkOffsetX, 'x', @parallax)
                posY = view.posToPx(chunk.tileOffsetY + chunk.chunkOffsetY, 'y')
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
            data += String.fromCharCode(core.DATA_TYPES.CHUNK)
            chunkData = chunk.serialize()
            data += String.fromCharCode(chunkData.length) + chunkData
        return data


    deserialize: (data) -> # Layer::deserialize
        chunkOffsetX = 0
        @chunks.length = 0
        t = core.DATA_TYPES
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



class Chunk

    constructor: (layer, data) -> # Chunk::constructor
        @tiles = []
        for name, datum of data
            this[name] = datum

        @layer = layer

        @drawBuffer = document.createElement 'canvas'
        @drawBufferCtx = @drawBuffer.getContext '2d'
        @drawBufferDirty = true
        @drawBuffer.width = @width * background.tileSize
        @drawBuffer.height = ((@tiles.length / @width) >> 0) * background.tileSize
        @tileOffsetXPx = @tileOffsetX * background.tileSize


    draw: (posX, posY) -> # Chunk::draw
        # Don't draw chunks out of view
        if posX < -@drawBuffer.width or posX > core.camW or
        posY < -@drawBuffer.height or posY > core.camH
            return

        if @drawBufferDirty
            # Redraw chunk
            @drawBufferCtx.clearRect(0, 0, @drawBuffer.width, @drawBuffer.height)
            for i in [0..@tiles.length]
                x = i % @width
                y = ((i / @width) >> 0)
                @drawTile @drawBufferCtx,
                    @tiles[i],
                    x * background.tileSize,
                    (y + @chunkOffsetY) * background.tileSize,

            @drawBufferDirty = false

        core.frameBufferCtx.drawImage @drawBuffer,
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
        tileSize = background.tileSize
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
        @drawBuffer.height = ((@tiles.length / @width) >> 0) * background.tileSize
