### Copyright (c) 2014 Magnus Leo. All rights reserved. ###

Leo = window.Leo ?= {}
Leo.sprite = {}

Leo.sprite.Sprite =
class Sprite

    constructor: (path) -> # Sprite::constructor
        @spritesheet = path
        @spriteImg = @getImg(path)
        @animations = {}
        @currentAnimation = null


    addAnimation: (animationData) -> # Sprite::addAnimation
        unless animationData
            throw 'Sprite::addAnimation - Missing animationData'

        unless animationData.name
            throw 'Sprite::addAnimation - Missing animationData.name'

        console.assert !@animations[animationData.name] #Debug
        @animations[animationData.name] = new Animation this, animationData


    setAnimation: (animName, frameNum = 0) -> # Sprite::setAnimation
        @currentAnimation = animName
        @animations[@currentAnimation].jumpToFrame(frameNum)


    advanceAnimation: (cycleLength) -> # Sprite::advanceAnimation
        @animations[@currentAnimation].advance(cycleLength)


    getCurrentAnimation: ->
        return @animations[@currentAnimation]


    draw: (x, y) -> # Sprite::draw
        frame = @animations[@currentAnimation].getCurrentFrame()
        frameData = frame.data
        _frameBufferCtx.drawImage @spriteImg,
            frameData[0], # Source x
            frameData[1], # Source y
            frameData[2], # Source width
            frameData[3], # Source height
            Leo.view.posToPx(x, 'x') + frameData[4], # Position + frame offset X
            Leo.view.posToPx(y, 'y') + frameData[5], # Position + frame offset Y
            frameData[2], # Destination width
            frameData[3], # Destination height


    getImg: -> # Sprite::getImg
        path = @spritesheet
        if _img = @_img[path]
            return _img[path]
        else
            _imgObj = @_img[path] = new Image()
            _imgObj.src = Leo.core.imgPath + path
            return _imgObj

    _img: {} # Shared hashmap of image objects with the sprite path as key



Leo.sprite.Animation =
class Animation

    constructor: (sprite, options) -> # Animation::constructor
        defaultOptions =
            isLooping: false
        @options = Leo.util.merge(defaultOptions, options)

        unless sprite instanceof Sprite
            throw 'Missing animation sprite'
        @sprite = sprite

        @frameTimeLeft = 0 # Time left on current animation frame
        @frameNum = 0 # Current animation frame
        @name = options.name

        @frames = []
        for frameData in @options.frames
            @addFrame(frameData)


    addFrame: (frame) -> # Animation::addFrame
        unless frame instanceof Frame
            frame = new Frame(frame)

        unless frame instanceof Frame
            throw 'Animation::addFrame - Missing Frame'

        @frames.push frame


    advance: (cycleLength) -> # Animation::advance
        maxFrame = @frames.length - 1
        @frameNum = Math.min(@frameNum, maxFrame)
        @frameTimeLeft -= cycleLength
        while @frameTimeLeft < 0
            @frameNum++
            if @frameNum > maxFrame
                if @options.isLooping  then @frameNum = 0 else @frameNum--
            @frameTimeLeft = @frames[@frameNum].data[6] + @frameTimeLeft


    jumpToFrame: (frameNum) -> # Animation::jumpToFrame
        frameNum >> 0
        frameNum = Math.min(frameNum, @frames.length - 1)
        frameNum = Math.max(frameNum, 0)
        @frameNum = frameNum
        @frameTimeLeft = @frames[frameNum].data[6]


    getCurrentFrame: -> # Animation::getCurrentFrame
        return @frames[@frameNum]



Leo.sprite.Frame =
class Frame

    constructor: (data) -> # Frame::constructor
        defaultData =
            x: 0
            y: 0
            w: 16
            h: 16
            offsetX: 0
            offsetY: 0
            duration: 200
        data = Leo.util.merge(defaultData, data)
        @data = [data.x, data.y, data.w, data.h, data.offsetX, data.offsetY, data.duration]
