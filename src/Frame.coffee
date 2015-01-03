### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

util = require('./util')

module.exports =
class Frame

    constructor: (data) -> # Frame::constructor
        defaultData =
            x: 0
            y: 0
            w: 16
            h: 16
            offsetX: 0
            offsetY: 0
            duration: 200
        data = util.merge(defaultData, data)
        @data = [data.x, data.y, data.w, data.h, data.offsetX, data.offsetY, data.duration]
