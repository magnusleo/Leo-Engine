### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

Shape = require('./Shape')
core = require('./core')

module.exports =
class Rect extends Shape

    draw: -> # Rect::draw
        unless super
            return false
        core.frameBufferCtx.fillRect @drawX, @drawY, @drawW, @drawH
        return true