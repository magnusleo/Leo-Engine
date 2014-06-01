### Copyright (c) 2014 Magnus Leo. All rights reserved. ###

Leo = window.Leo ?= {}

Leo.Shape =
class Shape

    constructor: (data) -> # Shape::constructor
        defaultData =
            fillStyle: 'rgba(255,0,0,0.4)'
            strokeStyle: 'rgba(255,0,0,0.7)'
            h: 1
            w: 1
            x: 0
            y: 0
        data = Leo.util.merge(defaultData, data)
        for name, val of data
            this[name] = val

        Leo.shapes.push this


    draw: -> # Shape::draw
        if not @isVisible
            return false

        @drawX = Leo.view.posToPx(@x, 'x')
        @drawY = Leo.view.posToPx(@y, 'y')
        @drawW = @w * Leo.background.tileSize
        @drawH = @h * Leo.background.tileSize
        _frameBufferCtx.fillStyle = @fillStyle
        _frameBufferCtx.strokeStyle = @strokeStyle
        # Shape specific drawing in subclass (e.g. Rect)
        return true



Leo.Rect =
class Rect extends Shape

    draw: -> # Rect::draw
        unless super
            return false
        _frameBufferCtx.fillRect @drawX, @drawY, @drawW, @drawH
        return true



Leo.Line =
class Line extends Shape

    constructor: (data) -> # Shape::constructor
        defaultData =
            x2: 0
            y2: 0
        data = Leo.util.merge(defaultData, data)
        super(data)


    draw: -> # Line::draw
        unless super
            return false
        _frameBufferCtx.beginPath()
        _frameBufferCtx.moveTo @drawX, @drawY
        _frameBufferCtx.lineTo( Leo.view.posToPx(@x2, 'x'), Leo.view.posToPx(@y2, 'y') )
        _frameBufferCtx.closePath()
        _frameBufferCtx.stroke()
        return true
