### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

core = require('../modules/core')
Sprite = require('./Sprite')

module.exports =
class Actor

    constructor: (properties) -> # Actor::constructor
        # Defaults
        @posX = 0
        @posY = 0
        @speedX = 0
        @speedY = 0

        # User defined properties
        for key, val of properties
            @[key] = val

        core.actors.push this


    draw: -> # Actor::draw
        @sprite.draw(@posX, @posY)


    setSprite: (sprite) -> # Actor::setSprite
        unless sprite instanceof Sprite
            throw 'Actor::setSprite - Missing Sprite'
        @sprite = sprite


    update: (cycleLength) -> # Actor::update
        # Animation
        @sprite.advanceAnimation(cycleLength)

        # Position
        @posX += @speedX * cycleLength
        @posY += @speedY * cycleLength


    decelerate: (axis, amount) -> # Actor::decelerate
        if not amount
            return
        axis = axis.toUpperCase()
        unitName = 'speed' + axis
        curSpeed = @[unitName]
        if curSpeed > 0
            @[unitName] = Math.max(curSpeed - amount, 0)
        else
            @[unitName] = Math.min(curSpeed + amount, 0)
