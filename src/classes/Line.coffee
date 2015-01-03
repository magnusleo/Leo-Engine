### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

Shape = require('./Shape')
util = require('../modules/util')
core = require('../modules/core')
view = require('../modules/view')

module.exports =
class Line extends Shape

    constructor: (data) -> # Shape::constructor
        defaultData =
            x2: 0
            y2: 0
        data = util.merge(defaultData, data)
        super(data)


    draw: -> # Line::draw
        unless super
            return false
        core.frameBufferCtx.beginPath()
        core.frameBufferCtx.moveTo @drawX, @drawY
        core.frameBufferCtx.lineTo( view.posToPx(@x2, 'x'), view.posToPx(@y2, 'y') )
        core.frameBufferCtx.closePath()
        core.frameBufferCtx.stroke()
        return true
