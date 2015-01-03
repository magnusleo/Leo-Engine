### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

Actor = require('./Actor')
collision = require('./collision')
environment = require('./environment')
event = require('./event')
io = require('./io')
layers = require('./layers')
util = require('./util')

module.exports =
class Player extends Actor

    constructor: (data) -> # Player::constructor
        super

        @accX = 0
        @dirPhysical = 0
        @dirVisual = 1
        @state = new PlayerStateStanding(this)
        @stateBefore = null


    setState: (state) -> # Player::setState
        if @state instanceof state
            return
        @stateBefore = @state
        @state = new state(this)


    stateIs: (state) -> # Player::stateIs
        return @state instanceof state


    handleInput: (e) -> # Player::handleInput
        @state.handleInput(e)


    update: (cycleLength) -> # Player::update
        @speedY += environment.gravity * cycleLength
        @speedX += @accX * cycleLength
        @speedX = Math.min(@speedX, @speedXMax)
        @speedX = Math.max(@speedX, -@speedXMax)

        super(cycleLength)
        @state.update(cycleLength)

        collisions = collision.actorToLayer this, layers.get('ground'),
            reposition: true

        # Update player state
        if collisions.bottom
            if @dirPhysical == 0
                @setState PlayerStateStanding
                @decelerate('x', collisions.friction * @decelerationGround * cycleLength)
            else
                @setState PlayerStateRunning
        else if not @stateIs PlayerStateJumping
            @setState PlayerStateFalling
            if @dirPhysical == 0
                @decelerate('x', @decelerationAir * cycleLength)



# PlayerState
# |
# |__PlayerStateAir
# |   |__PlayerStateJumping
# |
# |__PlayerStateGround
#     |__PlayerStateStanding
#     |__PlayerStateRunning

PlayerState =
class PlayerState

    constructor: (@parent) -> # PlayerState::constructor


    handleInput: (e) -> # PlayerState::handleInput
        key = util.KEY_CODES
        switch e.keyCode

            when key.LEFT
                @parent.dirPhysical = -1
                @parent.dirVisual = -1

            when key.RIGHT
                @parent.dirPhysical = 1
                @parent.dirVisual = 1


    update: (cycleLength) -> # PlayerState::update



PlayerStateGround =
class PlayerStateGround extends PlayerState

    constructor: (data) -> # PlayerStateGround::constructor
        super(data)


    handleInput: (e) -> # PlayerStateGround::handleInput
        super(e)
        key = util.KEY_CODES

        if e.type is 'keydown'
            switch e.keyCode
                when key.UP, key.Z
                    @parent.setState PlayerStateJumping



PlayerStateStanding =
class PlayerStateStanding extends PlayerStateGround

    constructor: (data) -> # PlayerStateStanding::constructor
        super(data)

        @parent.accX = 0

        if @parent.dirVisual > 0
            @parent.sprite.setAnimation 'standingRight'
        else
            @parent.sprite.setAnimation 'standingLeft'


    handleInput: (e) -> # PlayerStateStanding::handleInput
        super(e)
        key = util.KEY_CODES

        if e.type is 'keydown'
            switch e.keyCode
                when key.LEFT, key.RIGHT
                    @parent.setState PlayerStateRunning



PlayerStateRunning =
class PlayerStateRunning extends PlayerStateGround

    constructor: (data) -> # PlayerStateRunning::constructor
        super(data)
        @_setSpeedAndAnim()

        if @parent.stateBefore instanceof PlayerStateAir
            @parent.sprite.getCurrentAnimation().jumpToFrame(1)


    handleInput: (e) -> # PlayerStateRunning::handleInput
        super(e)
        key = util.KEY_CODES

        if e.type is 'keydown'
            switch e.keyCode
                when key.LEFT, key.RIGHT
                    @_setSpeedAndAnim()

        else if e.type is 'keyup'
            switch e.keyCode
                when key.LEFT, key.RIGHT
                    rightPressed = io.isKeyPressed(key.RIGHT)
                    leftPressed = io.isKeyPressed(key.LEFT)
                    if not leftPressed and not rightPressed
                        @parent.setState PlayerStateStanding
                        @parent.dirPhysical = 0
                        @parent.accX = 0
                    else if leftPressed and not rightPressed
                        @parent.dirPhysical = -1
                        @parent.dirVisual = -1
                        @_setSpeedAndAnim { frameNum: 1 }
                    else # if not leftPressed and rightPressed
                        @parent.dirPhysical = 1
                        @parent.dirVisual = 1
                        @_setSpeedAndAnim { frameNum: 1 }


    _setSpeedAndAnim: (options = {})-> # PlayerStateRunning::_setSpeedAndAnim
        @parent.accX = @parent.accelerationGround * @parent.dirPhysical
        if @parent.dirVisual > 0
            @parent.sprite.setAnimation 'runningRight', options.frameNum
        else
            @parent.sprite.setAnimation 'runningLeft', options.frameNum


PlayerStateAir =
class PlayerStateAir extends PlayerState

    constructor: (data) -> # PlayerStateAir::constructor
        super

        if @parent.dirVisual > 0
            @parent.sprite.setAnimation 'jumpingRight'
        else
            @parent.sprite.setAnimation 'jumpingLeft'


    handleInput: (e) -> # PlayerStateAir::handleInput
        super
        key = util.KEY_CODES

        if e.type is 'keydown'
            switch e.keyCode
                when key.LEFT, key.RIGHT
                    @_setSpeedAndAnim()

        else if e.type is 'keyup'
            switch e.keyCode
                when key.LEFT, key.RIGHT
                    rightPressed = io.isKeyPressed(key.RIGHT)
                    leftPressed = io.isKeyPressed(key.LEFT)
                    if not leftPressed and not rightPressed
                        @parent.dirPhysical = 0
                        @parent.accX = 0
                    else if leftPressed and not rightPressed
                        @parent.dirPhysical = -1
                        @parent.dirVisual = -1
                        @_setSpeedAndAnim { frameNum: 1 }
                    else # if not leftPressed and rightPressed
                        @parent.dirPhysical = 1
                        @parent.dirVisual = 1
                        @_setSpeedAndAnim { frameNum: 1 }


    _setSpeedAndAnim: -> # PlayerStateAir::_setSpeedAndAnim
        @parent.accX = @parent.accelerationAir * @parent.dirPhysical
        if @parent.dirVisual > 0
            @parent.sprite.setAnimation 'jumpingRight'
        else
            @parent.sprite.setAnimation 'jumpingLeft'


    update: (cycleLength) -> # PlayerStateAir::update
        super



PlayerStateJumping =
class PlayerStateJumping extends PlayerStateAir

    constructor: (data) -> # PlayerStateJumping::constructor
        super
        @parent.speedY = -21


    handleInput: (e) -> # PlayerStateJumping::handleInput
        super
        key = util.KEY_CODES

        if e.type is 'keyup'
            switch e.keyCode
                when key.UP, key.Z
                    @parent.speedY *= 0.5
                    @parent.setState PlayerStateFalling


    update: (cycleLength) -> # PlayerStateJumping::update
        if @parent.speedY >= 0
            @parent.setState PlayerStateFalling



PlayerStateFalling =
class PlayerStateFalling extends PlayerStateAir
