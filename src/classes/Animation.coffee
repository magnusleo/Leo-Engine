### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

Frame = require('./Frame')
util = require('../modules/util')

module.exports =
class Animation

    constructor: (sprite, options) -> # Animation::constructor
        defaultOptions =
            isLooping: false
        @options = util.merge(defaultOptions, options)

        unless sprite
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
