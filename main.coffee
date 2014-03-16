### Copyright 2014 Magnus Leo. All rights reserved. ###

window.addEventListener 'load', ->
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
                    [19,33, 30,32, -4,0, 0.192]
                ]
                doLoop: false
            jumpingRight:
                frames: [
                    [19,0, 30,32, -8,0, 0.192]
                ]
                doLoop: false
            runningLeft:
                frames: [
                    [19,33, 30,32, -6,-1, 0.18]
                    [49,33, 13,32,  1,0,  0.13]
                    [62,33, 23,32, -4,-1, 0.18]
                    [49,33, 13,32,  1,0,  0.13]
                ]
                doLoop: true
            runningRight:
                frames: [
                    [19,0, 30,32,  -9,-1, 0.18]
                    [49,0, 13,32,   1,0,  0.13]
                    [62,0, 23,32,  -4,-1, 0.18]
                    [49,0, 13,32,   1,0,  0.13]
                ]
                doLoop: true
            standingLeft:
                frames: [
                    [0,33, 19,32, 1,0, 1]
                ]
                doLoop: false
            standingRight:
                frames: [
                    [0,0, 19,32, -1,0, 1]
                ]
                doLoop: false
        animName: 'standingRight'
        posX: 6
        posY: 6
        colW: 1
        colH: 2
        speedXMax: 9
        accelerationAir: 900
        decelerationAir: 900
        accelerationGround: 900
        decelerationGround: 900

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
