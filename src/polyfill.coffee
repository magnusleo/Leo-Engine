# https://gist.github.com/paulirish/1579671/682e5c880c92b445650c4880a6bf9f3897ec1c5b
do ->
    lastTime = 0
    vendors = ["ms", "moz", "webkit", "o"]
    x = 0

    while x < vendors.length and not window.requestAnimationFrame
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"]
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] or window[vendors[x] + "CancelRequestAnimationFrame"]
        ++x
    unless window.requestAnimationFrame
        window.requestAnimationFrame = (callback, element) ->
            currTime = new Date().getTime()
            timeToCall = Math.max(0, 16 - (currTime - lastTime))
            id = window.setTimeout(->
                callback currTime + timeToCall
            , timeToCall)
            lastTime = currTime + timeToCall
            id
    unless window.cancelAnimationFrame
        window.cancelAnimationFrame = (id) ->
            clearTimeout id