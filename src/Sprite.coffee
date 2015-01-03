### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

Animation = require('./Animation')
core = require('./core')
view = require('./view')

module.exports =
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
        core.frameBufferCtx.drawImage @spriteImg,
            frameData[0], # Source x
            frameData[1], # Source y
            frameData[2], # Source width
            frameData[3], # Source height
            view.posToPx(x, 'x') + frameData[4], # Position + frame offset X
            view.posToPx(y, 'y') + frameData[5], # Position + frame offset Y
            frameData[2], # Destination width
            frameData[3], # Destination height


    getImg: -> # Sprite::getImg
        path = @spritesheet
        if _img = @_img[path]
            return _img[path]
        else
            _imgObj = @_img[path] = new Image()
            _imgObj.src = core.imgPath + path
            return _imgObj

    _img: {} # Shared hashmap of image objects with the sprite path as key
