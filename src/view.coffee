### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

background = require('./background')

view = {}
module.exports = view

view.scale = 2
view.cameraPosX = 2.0 # Unit tile
view.cameraPosY = 0.0
view.cameraSpeedX = 0.0 # One tiles per second, positive is right
view.cameraSpeedY = 0.0
view.cameraWidth = 30
view.cameraHeight = 17

view.posToPx = (posX, axis, parallax = 1.0) ->
    return ((posX - view['cameraPos' + axis.toUpperCase()]) * background.tileSize * parallax) >> 0

view.drawOnceQue = []
view.drawOnce = (data) ->
    view.drawOnceQue.push data
