### Copyright (c) 2014 Magnus Leo. All rights reserved. ###

Leo = window.Leo ?= {}
Leo.event = {}

Leo.event._keydown = (e) ->
    unless e.ctrlKey or e.metaKey
        e.preventDefault()

    # Prevent keydown repeat
    keyIndex = _pressedKeys.indexOf e.keyCode
    if keyIndex is -1
        _pressedKeys.push e.keyCode

        key = Leo.util.KEY_CODES
        switch e.keyCode
            when key.S
                data = Leo.layers.get('ground').serialize()
                localStorage.setItem('ground', data)

            when key.L
                data = localStorage.getItem('ground')
                Leo.layers.get('ground').deserialize(data)

        Leo.event.keydown e

Leo.event.keydown = (e) ->
    # Override Leo.event.keydown with your keydown function

Leo.event._keyup = (e) ->
    e.preventDefault()
    keyIndex = _pressedKeys.indexOf e.keyCode
    if keyIndex isnt -1
        _pressedKeys.splice keyIndex, 1
    Leo.event.keyup e

Leo.event.keyup = (e) ->
    # Override Leo.event.keyup with your keyup function


# I/O
Leo.io = {}

Leo.io.getPressedKeys = ->
    return _pressedKeys

Leo.io.isKeyPressed = (key) ->
    if typeof key is 'string'
        key = Leo.util.KEY_CODES[key.toUpperCase()]
    unless typeof key is 'number'
        return false

    return _pressedKeys.indexOf(key) > -1

Leo.io.anyKeyPressed = (keys) ->
    keyCodes = Leo.util.KEY_CODES
    if typeof key is 'string'
        key = [key]
    for key in keys
        if typeof key is 'string'
            key = keyCodes[key.toUpperCase()]
        if _pressedKeys.indexOf(key) > -1
            return true
    return false

Leo.io.allKeysPressed = (keys) ->
    keyCodes = Leo.util.KEY_CODES
    if typeof key is 'string'
        key = [key]
    for key in keys
        if typeof key is 'string'
            key = keyCodes[key.toUpperCase()]
        if _pressedKeys.indexOf(key) == -1
            return false
    return true
