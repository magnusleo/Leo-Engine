### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

layers = require('./layers')
util = require('./util')

event = {}
module.exports = event

event.pressedKeys = []

event._keydown = (e) ->
    unless e.ctrlKey or e.metaKey
        e.preventDefault()

    # Prevent keydown repeat
    keyIndex = event.pressedKeys.indexOf e.keyCode
    if keyIndex is -1
        event.pressedKeys.push e.keyCode

        key = util.KEY_CODES
        switch e.keyCode
            when key.S
                data = layers.get('ground').serialize()
                localStorage.setItem('ground', data)

            when key.L
                data = localStorage.getItem('ground')
                layers.get('ground').deserialize(data)

        event.keydown e

event.keydown = (e) ->
    # Override event.keydown with your keydown function

event._keyup = (e) ->
    e.preventDefault()
    keyIndex = event.pressedKeys.indexOf e.keyCode
    if keyIndex isnt -1
        event.pressedKeys.splice keyIndex, 1
    event.keyup e

event.keyup = (e) ->
    # Override event.keyup with your keyup function