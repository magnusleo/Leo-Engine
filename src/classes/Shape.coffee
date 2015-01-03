### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

core = require('../modules/core')
background = require('../modules/background')
util = require('../modules/util')
view = require('../modules/view')

module.exports =
class Shape

    constructor: (data) -> # Shape::constructor
        defaultData =
            fillStyle: 'rgba(255,0,0,0.4)'
            strokeStyle: 'rgba(255,0,0,0.7)'
            h: 1
            w: 1
            x: 0
            y: 0
        data = util.merge(defaultData, data)
        for name, val of data
            this[name] = val

        core.shapes.push this


    draw: -> # Shape::draw
        if not @isVisible
            return false

        @drawX = view.posToPx(@x, 'x')
        @drawY = view.posToPx(@y, 'y')
        @drawW = @w * background.tileSize
        @drawH = @h * background.tileSize
        core.frameBufferCtx.fillStyle = @fillStyle
        core.frameBufferCtx.strokeStyle = @strokeStyle
        # Shape specific drawing in subclass (e.g. Rect)
        return true
