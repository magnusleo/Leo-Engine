### Copyright 2014 Magnus Leo. All rights reserved. ###

window.addEventListener 'load', ->
    Leo.core.init()


    # Events

    Leo.event.keydown = (e) ->
        key = Leo.util.KEY_CODES
        switch e.keyCode
            when key.R
                window.location.reload()
            else
                Leo.player.handleInput(e)

    Leo.event.keyup = (e) ->
        Leo.player.handleInput(e)


    # Player

    playerSprite = new Leo.sprite.Sprite('sprite-olle.png')

    playerSprite.addAnimation
        name: 'jumpingLeft'
        frames: [
            {x:19, y:33, w:30, h:32, offsetX:-4, offsetY:0, duration:0.192}
        ]
        isLooping: false

    playerSprite.addAnimation
        name: 'jumpingRight'
        frames: [
            {x:19, y:0, w:30, h:32, offsetX:-8, offsetY:0, duration:0.192}
        ]
        isLooping: false

    playerSprite.addAnimation
        name: 'runningLeft'
        frames: [
            {x:19, y:33, w:30, h:32, offsetX:-6, offsetY:-1, duration:0.18}
            {x:49, y:33, w:13, h:32, offsetX:1, offsetY:0, duration:0.13}
            {x:62, y:33, w:23, h:32, offsetX:-4, offsetY:-1, duration:0.18}
            {x:49, y:33, w:13, h:32, offsetX:1, offsetY:0, duration:0.13}
        ]
        isLooping: true

    playerSprite.addAnimation
        name: 'runningRight'
        frames: [
            {x:19, y:0, w:30, h:32, offsetX:-9, offsetY:-1, duration:0.18}
            {x:49, y:0, w:13, h:32, offsetX:1, offsetY:0, duration:0.13}
            {x:62, y:0, w:23, h:32, offsetX:-4, offsetY:-1, duration:0.18}
            {x:49, y:0, w:13, h:32, offsetX:1, offsetY:0, duration:0.13}
        ]
        isLooping: true

    playerSprite.addAnimation
        name: 'standingLeft'
        frames: [
            {x:0, y:33, w:19, h:32, offsetX:1, offsetY:0, duration:1}
        ]
        isLooping: false

    playerSprite.addAnimation
        name: 'standingRight'
        frames: [
            {x:0, y:0, w:19, h:32, offsetX:-1, offsetY:0, duration:1}
        ]
        isLooping: false

    Leo.player = new Leo.Player
        sprite: playerSprite
        posX: 6
        posY: 6
        colW: 1
        colH: 2
        speedXMax: 9
        accelerationAir: 900
        decelerationAir: 900
        accelerationGround: 900
        decelerationGround: 900


    # Camera

    Leo.cycleCallback = ->
        Leo.view.cameraPosX = Leo.player.posX - 15


    # Background

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


    # Ground

    Leo.layers.add new Leo.Layer
        id: 'ground'
        spritesheet: 'sprite-background.png'
        chunks: [
            chunkOffsetX: 0
            chunkOffsetY: 0
            colBoxes: []
            tileOffsetX: 0
            tileOffsetY: 13
            tiles: [-1,-1,-1,4,-1,-1,-1,-1,-1,-1,-1,32,34,33,35,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,32,33,34,33,35,-1,-1,-1,-1,-1,-1,-1,48,51,-1,-1,-1,-1,-1,-1,-1,32,33,34,33,34,33,34,33,35,48,49,50,49,50,33,34,35,-1,-1,-1,-1,48,51,-1,-1,-1,-1,32,33,34,50,49,50,49,50,49,50,49,51,48,49,50,49,50,49,50,49,34,33,34,33,50,49,34,33,34,33,50,49,50,50,49,50,49,50,49,50,49,51]
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
