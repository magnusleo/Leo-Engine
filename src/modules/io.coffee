### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

util = require('./util')
event = require('./event')

io = {}
module.exports = io

io.getPressedKeys = ->
    return event.pressedKeys

io.isKeyPressed = (key) ->
    if typeof key is 'string'
        key = util.KEY_CODES[key.toUpperCase()]
    unless typeof key is 'number'
        return false

    return event.pressedKeys.indexOf(key) > -1

io.anyKeyPressed = (keys) ->
    keyCodes = util.KEY_CODES
    if typeof key is 'string'
        key = [key]
    for key in keys
        if typeof key is 'string'
            key = keyCodes[key.toUpperCase()]
        if event.pressedKeys.indexOf(key) > -1
            return true
    return false

io.allKeysPressed = (keys) ->
    keyCodes = util.KEY_CODES
    if typeof key is 'string'
        key = [key]
    for key in keys
        if typeof key is 'string'
            key = keyCodes[key.toUpperCase()]
        if event.pressedKeys.indexOf(key) == -1
            return false
    return true
