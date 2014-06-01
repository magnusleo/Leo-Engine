### Copyright (c) 2014 Magnus Leo. All rights reserved. ###

Leo = window.Leo ?= {}
Leo.collision = {}

Leo.collision.actorToLayer = (actor, layer, options) ->
    o =
        reposition: false
    o = Leo.util.merge(o, options)

    collisions =
        any: false
        bottom: false
        top: false
        left: false
        right: false
        friction: 1.0 #TODO: Get data from colliding tiles

    newPosX = actor.posX
    newPosY = actor.posY
    newSpeedX = actor.speedX
    newSpeedY = actor.speedY

    startX = actor.posX >> 0
    endX   = (actor.posX + actor.colW) >> 0
    startY = actor.posY >> 0
    endY   = (actor.posY + actor.colH) >> 0

    # Check if overlapping tiles are collidable
    for y in [startY..endY]
        for x in [startX..endX]
            tile = layer.getTile(x, y)
            if tile > -1
                ###
                +----+  Actor moves from A1 to A2
                | A1 |  and collides with background tile Bg.
                |    |  Actor moves with vector (speedX, speedY)
                +----+
                     +----+  The angle between AcBc and the movement vector determines
                     | A2 |  if it is a horizontal or vertical collision.
                     |  Bc-----+
                     +--|-Ac   |
                        |  Bg  |
                        +------+
                ###
                if actor.speedX == 0
                    isHorizontalCollision = false
                else if actor.speedY == 0
                    isHorizontalCollision = true
                else
                    # Get actor's foremost corner in the movement vector
                    # and the backgrounds opposing corner
                    a2Corner = {}
                    bgCorner = {}

                    if actor.speedX > 0
                        a2Corner.x = actor.posX + actor.colW
                        bgCorner.x = x
                    else
                        a2Corner.x = actor.posX
                        bgCorner.x = x + 1

                    if actor.speedY > 0
                        a2Corner.y = actor.posY + actor.colH
                        bgCorner.y = y
                    else
                        a2Corner.y = actor.posY
                        bgCorner.y = y + 1

                    # Determine by the angle if it is a horizontal or vertical collision
                    movAng = Math.abs(actor.speedY / actor.speedX)
                    colAng = Math.abs((a2Corner.y - bgCorner.y) / (a2Corner.x - bgCorner.x))
                    if movAng - colAng < 0.01
                        isHorizontalCollision = true
                    else
                        isHorizontalCollision = false

                if isHorizontalCollision
                    # Horizontal collisions
                    if actor.speedX > 0
                        # Going right. Is not an edge if the tile to the left is solid.
                        neighborTile = layer.getTile(x, y, -1, 0)
                        if neighborTile == -1
                            newPosX = x - actor.colW - 0.01
                            newSpeedX = 0
                            collisions.any = true
                            collisions.right = true
                            Leo.view.drawOnce {shape:'Line', x:x, y:y, x2:x, y2:y+1, strokeStyle:'rgba(0,128,0,0.9)'} #Debug
                        else
                            Leo.view.drawOnce {shape:'Line', x:x, y:y, x2:x, y2:y+1, strokeStyle:'rgba(255,64,0,0.6)'} #Debug
                    else
                        # Going left. Is not an edge if the tile to the right is solid.
                        neighborTile = layer.getTile(x, y, 1, 0)
                        if neighborTile == -1
                            newPosX = x + 1
                            newSpeedX = 0
                            collisions.any = true
                            collisions.left = true
                            Leo.view.drawOnce {shape:'Line', x:x+1, y:y, x2:x+1, y2:y+1, strokeStyle:'rgba(0,128,0,0.9)'} #Debug
                        else
                            Leo.view.drawOnce {shape:'Line', x:x+1, y:y, x2:x+1, y2:y+1, strokeStyle:'rgba(255,64,0,0.6)'} #Debug
                else
                    # Vertical collisions
                    if actor.speedY < 0
                        # Going up. Is not an edge if the tile upwards is solid.
                        neighborTile = layer.getTile(x, y, 0, 1)
                        if neighborTile == -1
                            newPosY = y + 1
                            newSpeedY = 0
                            collisions.any = true
                            collisions.top = true
                            Leo.view.drawOnce {shape:'Line', x:x, y:y+1, x2:x+1, y2:y+1, strokeStyle:'rgba(0,128,0,0.9)'} #Debug
                        else
                            Leo.view.drawOnce {shape:'Line', x:x, y:y+1, x2:x+1, y2:y+1, strokeStyle:'rgba(255,64,0,0.6)'} #Debug
                    else if actor.speedY > 0
                        # Going down. Is not an edge if the tile downwards is solid.
                        neighborTile = layer.getTile(x, y, 0, -1)
                        if neighborTile == -1
                            newPosY = y - actor.colH
                            newSpeedY = 0
                            collisions.any = true
                            collisions.bottom = true
                            Leo.view.drawOnce {shape:'Line', x:x, y:y, x2:x+1, y2:y, strokeStyle:'rgba(0,128,0,0.9)'} #Debug
                        else
                            Leo.view.drawOnce {shape:'Line', x:x, y:y, x2:x+1, y2:y, strokeStyle:'rgba(255,64,0,0.6)'} #Debug

                # Debug highlight block
                if neighborTile == -1
                    # Collision
                    Leo.view.drawOnce {shape:'Rect', x:x, y:y, w:1, h:1, fillStyle:'rgba(0,255,0,0.6)'} #Debug
                else
                    # Internal edge; no collision
                    Leo.view.drawOnce {shape:'Rect', x:x, y:y, w:1, h:1, fillStyle:'rgba(255,255,0,0.5)'} #Debug

    # Apply new position and speed
    if o.reposition
        actor.posX = newPosX
        actor.posY = newPosY
        actor.speedX = newSpeedX
        actor.speedY = newSpeedY

    return collisions
