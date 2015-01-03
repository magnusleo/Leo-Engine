### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

layers = {}
module.exports = layers

layers.objects = []

layers.add = (layerObj) ->
    if not layerObj?.id or
    layers.get(layerObj.id)
        return null

    layers.objects.push(layerObj)

layers.get = (id) ->
    for layerObj in layers.objects
        if layerObj.id is id
            return layerObj
    return null


# TODO: Do like Actor sprites and assign Sprite objects to Layers.
layers.getImg = (path) ->
    _img = layers._img
    if _img[path]
        return _img[path]
    else
        _imgObj = _img[path] = new Image()
        _imgObj.src = '_img/' + path
        return _imgObj

layers.removeImg = (path) ->
    _img = layers._img
    if _img[path] then _img[path] = null

layers._img = {} # Hashmap of image objects with the sprite path as key
