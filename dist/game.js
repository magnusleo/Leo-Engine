(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Actor, Sprite, core;

core = require('../modules/core');

Sprite = require('./Sprite');

module.exports = Actor = (function() {
  function Actor(properties) {
    var key, val;
    this.posX = 0;
    this.posY = 0;
    this.speedX = 0;
    this.speedY = 0;
    for (key in properties) {
      val = properties[key];
      this[key] = val;
    }
    core.actors.push(this);
  }

  Actor.prototype.draw = function() {
    return this.sprite.draw(this.posX, this.posY);
  };

  Actor.prototype.setSprite = function(sprite) {
    if (!(sprite instanceof Sprite)) {
      throw 'Actor::setSprite - Missing Sprite';
    }
    return this.sprite = sprite;
  };

  Actor.prototype.update = function(cycleLength) {
    this.sprite.advanceAnimation(cycleLength);
    this.posX += this.speedX * cycleLength;
    return this.posY += this.speedY * cycleLength;
  };

  Actor.prototype.decelerate = function(axis, amount) {
    var curSpeed, unitName;
    if (!amount) {
      return;
    }
    axis = axis.toUpperCase();
    unitName = 'speed' + axis;
    curSpeed = this[unitName];
    if (curSpeed > 0) {
      return this[unitName] = Math.max(curSpeed - amount, 0);
    } else {
      return this[unitName] = Math.min(curSpeed + amount, 0);
    }
  };

  return Actor;

})();



},{"../modules/core":13,"./Sprite":9}],2:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Animation, Frame, util;

Frame = require('./Frame');

util = require('../modules/util');

module.exports = Animation = (function() {
  function Animation(sprite, options) {
    var defaultOptions, frameData, _i, _len, _ref;
    defaultOptions = {
      isLooping: false
    };
    this.options = util.merge(defaultOptions, options);
    if (!sprite) {
      throw 'Missing animation sprite';
    }
    this.sprite = sprite;
    this.frameTimeLeft = 0;
    this.frameNum = 0;
    this.name = options.name;
    this.frames = [];
    _ref = this.options.frames;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      frameData = _ref[_i];
      this.addFrame(frameData);
    }
  }

  Animation.prototype.addFrame = function(frame) {
    if (!(frame instanceof Frame)) {
      frame = new Frame(frame);
    }
    if (!(frame instanceof Frame)) {
      throw 'Animation::addFrame - Missing Frame';
    }
    return this.frames.push(frame);
  };

  Animation.prototype.advance = function(cycleLength) {
    var maxFrame, _results;
    maxFrame = this.frames.length - 1;
    this.frameNum = Math.min(this.frameNum, maxFrame);
    this.frameTimeLeft -= cycleLength;
    _results = [];
    while (this.frameTimeLeft < 0) {
      this.frameNum++;
      if (this.frameNum > maxFrame) {
        if (this.options.isLooping) {
          this.frameNum = 0;
        } else {
          this.frameNum--;
        }
      }
      _results.push(this.frameTimeLeft = this.frames[this.frameNum].data[6] + this.frameTimeLeft);
    }
    return _results;
  };

  Animation.prototype.jumpToFrame = function(frameNum) {
    frameNum >> 0;
    frameNum = Math.min(frameNum, this.frames.length - 1);
    frameNum = Math.max(frameNum, 0);
    this.frameNum = frameNum;
    return this.frameTimeLeft = this.frames[frameNum].data[6];
  };

  Animation.prototype.getCurrentFrame = function() {
    return this.frames[this.frameNum];
  };

  return Animation;

})();



},{"../modules/util":18,"./Frame":3}],3:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Frame, util;

util = require('../modules/util');

module.exports = Frame = (function() {
  function Frame(data) {
    var defaultData;
    defaultData = {
      x: 0,
      y: 0,
      w: 16,
      h: 16,
      offsetX: 0,
      offsetY: 0,
      duration: 200
    };
    data = util.merge(defaultData, data);
    this.data = [data.x, data.y, data.w, data.h, data.offsetX, data.offsetY, data.duration];
  }

  return Frame;

})();



},{"../modules/util":18}],4:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Chunk, Layer, background, core, layers, view;

core = require('../modules/core');

background = require('../modules/background');

layers = require('../modules/layers');

view = require('../modules/view');

module.exports = Layer = (function() {
  function Layer(properties) {
    var chunk, i, key, layer, val, _i, _len, _ref;
    this.spritesheet = '';
    this.chunks = [
      {
        chunkOffsetX: 0,
        chunkOffsetY: 0,
        colBoxes: [],
        tileOffsetX: 0,
        tileOffsetY: 0,
        tiles: []
      }
    ];
    this.isLooping = false;
    this.parallax = 1.0;
    for (key in properties) {
      val = properties[key];
      this[key] = val;
    }
    this.spriteImg = layers.getImg(this.spritesheet);
    layer = this;
    this.spriteImg.addEventListener('load', function() {
      var chunk, _i, _len, _ref;
      if (!layer.chunks) {
        return;
      }
      _ref = layer.chunks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        chunk = _ref[_i];
        chunk.redraw();
      }
    });
    this.layerNumTilesX = 0;
    _ref = this.chunks;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      chunk = _ref[i];
      this.chunks[i] = new Chunk(this, chunk);
      this.layerNumTilesX += chunk.tiles.length + chunk.tileOffsetX;
    }
  }

  Layer.prototype.draw = function() {
    var chunk, multiplier, posX, posY, _i, _j, _len, _len1, _ref, _ref1;
    if (this.isLooping) {
      chunk = this.chunks[0];
      posX = view.posToPx(chunk.tileOffsetX + chunk.chunkOffsetX, 'x', this.parallax);
      multiplier = ((view.cameraPosX / this.layerNumTilesX * this.parallax) >> 0) - 1;
      posX += this.layerNumTilesX * background.tileSize * multiplier;
      while (posX < core.camW) {
        _ref = this.chunks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          chunk = _ref[_i];
          posY = view.posToPx(chunk.tileOffsetY + chunk.chunkOffsetY, 'y');
          chunk.draw(posX, posY);
          posX += chunk.drawBuffer.width + chunk.tileOffsetXPx;
        }
      }
    } else {
      _ref1 = this.chunks;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        chunk = _ref1[_j];
        posX = view.posToPx(chunk.tileOffsetX + chunk.chunkOffsetX, 'x', this.parallax);
        posY = view.posToPx(chunk.tileOffsetY + chunk.chunkOffsetY, 'y');
        chunk.draw(posX, posY);
      }
    }
  };

  Layer.prototype.getTile = function(tileX, tileY, offsetX, offsetY) {
    var chunk, chunkNo, x, y;
    if (offsetX == null) {
      offsetX = 0;
    }
    if (offsetY == null) {
      offsetY = 0;
    }
    chunkNo = Math.floor((tileX + offsetX) / this.chunks[0].width);
    if (chunkNo < 0 || chunkNo > this.chunks.length - 1) {
      return -1;
    }
    chunk = this.chunks[chunkNo];
    x = tileX - chunk.tileOffsetX + offsetX - chunk.width * chunkNo;
    y = tileY - chunk.tileOffsetY + offsetY;
    if ((0 > x && x > chunk.width) || (0 > y && y > chunk.width)) {
      return -1;
    }
    return chunk.tiles[x + y * chunk.width] || -1;
  };

  Layer.prototype.setTile = function(tileX, tileY, tile) {
    var chunk, chunkNo, x, y;
    chunkNo = (tileX / this.chunks[0].width) >> 0;
    chunk = this.chunks[chunkNo];
    chunk.drawBufferDirty = true;
    x = tileX - chunk.tileOffsetX - chunk.width * chunkNo;
    y = tileY - chunk.tileOffsetY;
    return chunk.tiles[x + y * chunk.width] = tile;
  };

  Layer.prototype.serialize = function() {
    var chunk, chunkData, data, _i, _len, _ref;
    data = '';
    _ref = this.chunks;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chunk = _ref[_i];
      data += String.fromCharCode(core.DATA_TYPES.CHUNK);
      chunkData = chunk.serialize();
      data += String.fromCharCode(chunkData.length) + chunkData;
    }
    return data;
  };

  Layer.prototype.deserialize = function(data) {
    var chunkOffsetX, i, length, numChunks, t, _results;
    chunkOffsetX = 0;
    this.chunks.length = 0;
    t = core.DATA_TYPES;
    i = 0;
    _results = [];
    while (i < data.length) {
      length = data.charCodeAt(i + 1);
      switch (data.charCodeAt(i)) {
        case t.CHUNK:
          numChunks = this.chunks.push(new Chunk(this, {
            width: 30,
            height: 17,
            chunkOffsetX: chunkOffsetX,
            chunkOffsetY: 0,
            tileOffsetX: 0,
            tileOffsetY: 13
          }));
          this.chunks[numChunks - 1].deserialize(data.substr(i + 2, length));
          chunkOffsetX += 30;
      }
      _results.push(i += 2 + length);
    }
    return _results;
  };

  return Layer;

})();

Chunk = (function() {
  function Chunk(layer, data) {
    var datum, name;
    this.tiles = [];
    for (name in data) {
      datum = data[name];
      this[name] = datum;
    }
    this.layer = layer;
    this.drawBuffer = document.createElement('canvas');
    this.drawBufferCtx = this.drawBuffer.getContext('2d');
    this.drawBufferDirty = true;
    this.drawBuffer.width = this.width * background.tileSize;
    this.drawBuffer.height = ((this.tiles.length / this.width) >> 0) * background.tileSize;
    this.tileOffsetXPx = this.tileOffsetX * background.tileSize;
  }

  Chunk.prototype.draw = function(posX, posY) {
    var i, x, y, _i, _ref;
    if (posX < -this.drawBuffer.width || posX > core.camW || posY < -this.drawBuffer.height || posY > core.camH) {
      return;
    }
    if (this.drawBufferDirty) {
      this.drawBufferCtx.clearRect(0, 0, this.drawBuffer.width, this.drawBuffer.height);
      for (i = _i = 0, _ref = this.tiles.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        x = i % this.width;
        y = (i / this.width) >> 0;
        this.drawTile(this.drawBufferCtx, this.tiles[i], x * background.tileSize, (y + this.chunkOffsetY) * background.tileSize);
      }
      this.drawBufferDirty = false;
    }
    return core.frameBufferCtx.drawImage(this.drawBuffer, 0, 0, this.drawBuffer.width, this.drawBuffer.height, posX, posY, this.drawBuffer.width, this.drawBuffer.height);
  };

  Chunk.prototype.redraw = function() {
    return this.drawBufferDirty = true;
  };

  Chunk.prototype.drawTile = function(ctx, spriteN, posX, posY) {
    var spriteWidth, spriteX, spriteY, tileSize;
    if (spriteN === -1) {
      return;
    }
    tileSize = background.tileSize;
    spriteWidth = 16;
    spriteX = spriteN % spriteWidth;
    spriteY = (spriteN / spriteWidth) >> 0;
    return ctx.drawImage(this.layer.spriteImg, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, posX >> 0, posY >> 0, tileSize, tileSize);
  };

  Chunk.prototype.serialize = function() {
    var data, tile, _i, _len, _ref;
    data = '';
    _ref = this.tiles;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tile = _ref[_i];
      data += String.fromCharCode(tile + 1);
    }
    return data;
  };

  Chunk.prototype.deserialize = function(data) {
    var i, _i, _ref;
    this.drawBufferDirty = true;
    this.tiles.length = 0;
    for (i = _i = 0, _ref = data.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      this.tiles.push(data.charCodeAt(i) - 1);
    }
    return this.drawBuffer.height = ((this.tiles.length / this.width) >> 0) * background.tileSize;
  };

  return Chunk;

})();



},{"../modules/background":11,"../modules/core":13,"../modules/layers":17,"../modules/view":19}],5:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Line, Shape, core, util, view,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Shape = require('./Shape');

util = require('../modules/util');

core = require('../modules/core');

view = require('../modules/view');

module.exports = Line = (function(_super) {
  __extends(Line, _super);

  function Line(data) {
    var defaultData;
    defaultData = {
      x2: 0,
      y2: 0
    };
    data = util.merge(defaultData, data);
    Line.__super__.constructor.call(this, data);
  }

  Line.prototype.draw = function() {
    if (!Line.__super__.draw.apply(this, arguments)) {
      return false;
    }
    core.frameBufferCtx.beginPath();
    core.frameBufferCtx.moveTo(this.drawX, this.drawY);
    core.frameBufferCtx.lineTo(view.posToPx(this.x2, 'x'), view.posToPx(this.y2, 'y'));
    core.frameBufferCtx.closePath();
    core.frameBufferCtx.stroke();
    return true;
  };

  return Line;

})(Shape);



},{"../modules/core":13,"../modules/util":18,"../modules/view":19,"./Shape":8}],6:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Actor, Player, PlayerState, PlayerStateAir, PlayerStateFalling, PlayerStateGround, PlayerStateJumping, PlayerStateRunning, PlayerStateStanding, collision, environment, event, io, layers, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Actor = require('./Actor');

collision = require('../modules/collision');

environment = require('../modules/environment');

event = require('../modules/event');

io = require('../modules/io');

layers = require('../modules/layers');

util = require('../modules/util');

module.exports = Player = (function(_super) {
  __extends(Player, _super);

  function Player(data) {
    Player.__super__.constructor.apply(this, arguments);
    this.accX = 0;
    this.dirPhysical = 0;
    this.dirVisual = 1;
    this.state = new PlayerStateStanding(this);
    this.stateBefore = null;
  }

  Player.prototype.setState = function(state) {
    if (this.state instanceof state) {
      return;
    }
    this.stateBefore = this.state;
    return this.state = new state(this);
  };

  Player.prototype.stateIs = function(state) {
    return this.state instanceof state;
  };

  Player.prototype.handleInput = function(e) {
    return this.state.handleInput(e);
  };

  Player.prototype.update = function(cycleLength) {
    var collisions;
    this.speedY += environment.gravity * cycleLength;
    this.speedX += this.accX * cycleLength;
    this.speedX = Math.min(this.speedX, this.speedXMax);
    this.speedX = Math.max(this.speedX, -this.speedXMax);
    Player.__super__.update.call(this, cycleLength);
    this.state.update(cycleLength);
    collisions = collision.actorToLayer(this, layers.get('ground'), {
      reposition: true
    });
    if (collisions.bottom) {
      if (this.dirPhysical === 0) {
        this.setState(PlayerStateStanding);
        return this.decelerate('x', collisions.friction * this.decelerationGround * cycleLength);
      } else {
        return this.setState(PlayerStateRunning);
      }
    } else if (!this.stateIs(PlayerStateJumping)) {
      this.setState(PlayerStateFalling);
      if (this.dirPhysical === 0) {
        return this.decelerate('x', this.decelerationAir * cycleLength);
      }
    }
  };

  return Player;

})(Actor);

PlayerState = PlayerState = (function() {
  function PlayerState(parent) {
    this.parent = parent;
  }

  PlayerState.prototype.handleInput = function(e) {
    var key;
    key = util.KEY_CODES;
    switch (e.keyCode) {
      case key.LEFT:
        this.parent.dirPhysical = -1;
        return this.parent.dirVisual = -1;
      case key.RIGHT:
        this.parent.dirPhysical = 1;
        return this.parent.dirVisual = 1;
    }
  };

  PlayerState.prototype.update = function(cycleLength) {};

  return PlayerState;

})();

PlayerStateGround = PlayerStateGround = (function(_super) {
  __extends(PlayerStateGround, _super);

  function PlayerStateGround(data) {
    PlayerStateGround.__super__.constructor.call(this, data);
  }

  PlayerStateGround.prototype.handleInput = function(e) {
    var key;
    PlayerStateGround.__super__.handleInput.call(this, e);
    key = util.KEY_CODES;
    if (e.type === 'keydown') {
      switch (e.keyCode) {
        case key.UP:
        case key.Z:
          return this.parent.setState(PlayerStateJumping);
      }
    }
  };

  return PlayerStateGround;

})(PlayerState);

PlayerStateStanding = PlayerStateStanding = (function(_super) {
  __extends(PlayerStateStanding, _super);

  function PlayerStateStanding(data) {
    PlayerStateStanding.__super__.constructor.call(this, data);
    this.parent.accX = 0;
    if (this.parent.dirVisual > 0) {
      this.parent.sprite.setAnimation('standingRight');
    } else {
      this.parent.sprite.setAnimation('standingLeft');
    }
  }

  PlayerStateStanding.prototype.handleInput = function(e) {
    var key;
    PlayerStateStanding.__super__.handleInput.call(this, e);
    key = util.KEY_CODES;
    if (e.type === 'keydown') {
      switch (e.keyCode) {
        case key.LEFT:
        case key.RIGHT:
          return this.parent.setState(PlayerStateRunning);
      }
    }
  };

  return PlayerStateStanding;

})(PlayerStateGround);

PlayerStateRunning = PlayerStateRunning = (function(_super) {
  __extends(PlayerStateRunning, _super);

  function PlayerStateRunning(data) {
    PlayerStateRunning.__super__.constructor.call(this, data);
    this._setSpeedAndAnim();
    if (this.parent.stateBefore instanceof PlayerStateAir) {
      this.parent.sprite.getCurrentAnimation().jumpToFrame(1);
    }
  }

  PlayerStateRunning.prototype.handleInput = function(e) {
    var key, leftPressed, rightPressed;
    PlayerStateRunning.__super__.handleInput.call(this, e);
    key = util.KEY_CODES;
    if (e.type === 'keydown') {
      switch (e.keyCode) {
        case key.LEFT:
        case key.RIGHT:
          return this._setSpeedAndAnim();
      }
    } else if (e.type === 'keyup') {
      switch (e.keyCode) {
        case key.LEFT:
        case key.RIGHT:
          rightPressed = io.isKeyPressed(key.RIGHT);
          leftPressed = io.isKeyPressed(key.LEFT);
          if (!leftPressed && !rightPressed) {
            this.parent.setState(PlayerStateStanding);
            this.parent.dirPhysical = 0;
            return this.parent.accX = 0;
          } else if (leftPressed && !rightPressed) {
            this.parent.dirPhysical = -1;
            this.parent.dirVisual = -1;
            return this._setSpeedAndAnim({
              frameNum: 1
            });
          } else {
            this.parent.dirPhysical = 1;
            this.parent.dirVisual = 1;
            return this._setSpeedAndAnim({
              frameNum: 1
            });
          }
      }
    }
  };

  PlayerStateRunning.prototype._setSpeedAndAnim = function(options) {
    if (options == null) {
      options = {};
    }
    this.parent.accX = this.parent.accelerationGround * this.parent.dirPhysical;
    if (this.parent.dirVisual > 0) {
      return this.parent.sprite.setAnimation('runningRight', options.frameNum);
    } else {
      return this.parent.sprite.setAnimation('runningLeft', options.frameNum);
    }
  };

  return PlayerStateRunning;

})(PlayerStateGround);

PlayerStateAir = PlayerStateAir = (function(_super) {
  __extends(PlayerStateAir, _super);

  function PlayerStateAir(data) {
    PlayerStateAir.__super__.constructor.apply(this, arguments);
    if (this.parent.dirVisual > 0) {
      this.parent.sprite.setAnimation('jumpingRight');
    } else {
      this.parent.sprite.setAnimation('jumpingLeft');
    }
  }

  PlayerStateAir.prototype.handleInput = function(e) {
    var key, leftPressed, rightPressed;
    PlayerStateAir.__super__.handleInput.apply(this, arguments);
    key = util.KEY_CODES;
    if (e.type === 'keydown') {
      switch (e.keyCode) {
        case key.LEFT:
        case key.RIGHT:
          return this._setSpeedAndAnim();
      }
    } else if (e.type === 'keyup') {
      switch (e.keyCode) {
        case key.LEFT:
        case key.RIGHT:
          rightPressed = io.isKeyPressed(key.RIGHT);
          leftPressed = io.isKeyPressed(key.LEFT);
          if (!leftPressed && !rightPressed) {
            this.parent.dirPhysical = 0;
            return this.parent.accX = 0;
          } else if (leftPressed && !rightPressed) {
            this.parent.dirPhysical = -1;
            this.parent.dirVisual = -1;
            return this._setSpeedAndAnim({
              frameNum: 1
            });
          } else {
            this.parent.dirPhysical = 1;
            this.parent.dirVisual = 1;
            return this._setSpeedAndAnim({
              frameNum: 1
            });
          }
      }
    }
  };

  PlayerStateAir.prototype._setSpeedAndAnim = function() {
    this.parent.accX = this.parent.accelerationAir * this.parent.dirPhysical;
    if (this.parent.dirVisual > 0) {
      return this.parent.sprite.setAnimation('jumpingRight');
    } else {
      return this.parent.sprite.setAnimation('jumpingLeft');
    }
  };

  PlayerStateAir.prototype.update = function(cycleLength) {
    return PlayerStateAir.__super__.update.apply(this, arguments);
  };

  return PlayerStateAir;

})(PlayerState);

PlayerStateJumping = PlayerStateJumping = (function(_super) {
  __extends(PlayerStateJumping, _super);

  function PlayerStateJumping(data) {
    PlayerStateJumping.__super__.constructor.apply(this, arguments);
    this.parent.speedY = -21;
  }

  PlayerStateJumping.prototype.handleInput = function(e) {
    var key;
    PlayerStateJumping.__super__.handleInput.apply(this, arguments);
    key = util.KEY_CODES;
    if (e.type === 'keyup') {
      switch (e.keyCode) {
        case key.UP:
        case key.Z:
          this.parent.speedY *= 0.5;
          return this.parent.setState(PlayerStateFalling);
      }
    }
  };

  PlayerStateJumping.prototype.update = function(cycleLength) {
    if (this.parent.speedY >= 0) {
      return this.parent.setState(PlayerStateFalling);
    }
  };

  return PlayerStateJumping;

})(PlayerStateAir);

PlayerStateFalling = PlayerStateFalling = (function(_super) {
  __extends(PlayerStateFalling, _super);

  function PlayerStateFalling() {
    return PlayerStateFalling.__super__.constructor.apply(this, arguments);
  }

  return PlayerStateFalling;

})(PlayerStateAir);



},{"../modules/collision":12,"../modules/environment":14,"../modules/event":15,"../modules/io":16,"../modules/layers":17,"../modules/util":18,"./Actor":1}],7:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Rect, Shape, core,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Shape = require('./Shape');

core = require('../modules/core');

module.exports = Rect = (function(_super) {
  __extends(Rect, _super);

  function Rect() {
    return Rect.__super__.constructor.apply(this, arguments);
  }

  Rect.prototype.draw = function() {
    if (!Rect.__super__.draw.apply(this, arguments)) {
      return false;
    }
    core.frameBufferCtx.fillRect(this.drawX, this.drawY, this.drawW, this.drawH);
    return true;
  };

  return Rect;

})(Shape);



},{"../modules/core":13,"./Shape":8}],8:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Shape, background, core, util, view;

core = require('../modules/core');

background = require('../modules/background');

util = require('../modules/util');

view = require('../modules/view');

module.exports = Shape = (function() {
  function Shape(data) {
    var defaultData, name, val;
    defaultData = {
      fillStyle: 'rgba(255,0,0,0.4)',
      strokeStyle: 'rgba(255,0,0,0.7)',
      h: 1,
      w: 1,
      x: 0,
      y: 0
    };
    data = util.merge(defaultData, data);
    for (name in data) {
      val = data[name];
      this[name] = val;
    }
    core.shapes.push(this);
  }

  Shape.prototype.draw = function() {
    if (!this.isVisible) {
      return false;
    }
    this.drawX = view.posToPx(this.x, 'x');
    this.drawY = view.posToPx(this.y, 'y');
    this.drawW = this.w * background.tileSize;
    this.drawH = this.h * background.tileSize;
    core.frameBufferCtx.fillStyle = this.fillStyle;
    core.frameBufferCtx.strokeStyle = this.strokeStyle;
    return true;
  };

  return Shape;

})();



},{"../modules/background":11,"../modules/core":13,"../modules/util":18,"../modules/view":19}],9:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Animation, Sprite, core, view;

Animation = require('./Animation');

core = require('../modules/core');

view = require('../modules/view');

module.exports = Sprite = (function() {
  function Sprite(path) {
    this.spritesheet = path;
    this.spriteImg = this.getImg(path);
    this.animations = {};
    this.currentAnimation = null;
  }

  Sprite.prototype.addAnimation = function(animationData) {
    if (!animationData) {
      throw 'Sprite::addAnimation - Missing animationData';
    }
    if (!animationData.name) {
      throw 'Sprite::addAnimation - Missing animationData.name';
    }
    console.assert(!this.animations[animationData.name]);
    return this.animations[animationData.name] = new Animation(this, animationData);
  };

  Sprite.prototype.setAnimation = function(animName, frameNum) {
    if (frameNum == null) {
      frameNum = 0;
    }
    this.currentAnimation = animName;
    return this.animations[this.currentAnimation].jumpToFrame(frameNum);
  };

  Sprite.prototype.advanceAnimation = function(cycleLength) {
    return this.animations[this.currentAnimation].advance(cycleLength);
  };

  Sprite.prototype.getCurrentAnimation = function() {
    return this.animations[this.currentAnimation];
  };

  Sprite.prototype.draw = function(x, y) {
    var frame, frameData;
    frame = this.animations[this.currentAnimation].getCurrentFrame();
    frameData = frame.data;
    return core.frameBufferCtx.drawImage(this.spriteImg, frameData[0], frameData[1], frameData[2], frameData[3], view.posToPx(x, 'x') + frameData[4], view.posToPx(y, 'y') + frameData[5], frameData[2], frameData[3]);
  };

  Sprite.prototype.getImg = function() {
    var path, _img, _imgObj;
    path = this.spritesheet;
    if (_img = this._img[path]) {
      return _img[path];
    } else {
      _imgObj = this._img[path] = new Image();
      _imgObj.src = core.imgPath + path;
      return _imgObj;
    }
  };

  Sprite.prototype._img = {};

  return Sprite;

})();



},{"../modules/core":13,"../modules/view":19,"./Animation":2}],10:[function(require,module,exports){

/* Copyright (c) 2014 Magnus Leo. All rights reserved. */
var Layer, Player, Sprite, core, event, layers, util, view;

core = require('./modules/core');

event = require('./modules/event');

Layer = require('./classes/Layer');

layers = require('./modules/layers');

Player = require('./classes/Player');

Sprite = require('./classes/Sprite');

util = require('./modules/util');

view = require('./modules/view');

window.addEventListener('load', function() {
  var player, playerSprite;
  core.init();
  event.keydown = function(e) {
    var key;
    key = util.KEY_CODES;
    switch (e.keyCode) {
      case key.R:
        return window.location.reload();
      default:
        return player.handleInput(e);
    }
  };
  event.keyup = function(e) {
    return player.handleInput(e);
  };
  playerSprite = new Sprite('sprite-olle.png');
  playerSprite.addAnimation({
    name: 'jumpingLeft',
    frames: [
      {
        x: 19,
        y: 33,
        w: 30,
        h: 32,
        offsetX: -4,
        offsetY: 0,
        duration: 0.192
      }
    ],
    isLooping: false
  });
  playerSprite.addAnimation({
    name: 'jumpingRight',
    frames: [
      {
        x: 19,
        y: 0,
        w: 30,
        h: 32,
        offsetX: -8,
        offsetY: 0,
        duration: 0.192
      }
    ],
    isLooping: false
  });
  playerSprite.addAnimation({
    name: 'runningLeft',
    frames: [
      {
        x: 19,
        y: 33,
        w: 30,
        h: 32,
        offsetX: -6,
        offsetY: -1,
        duration: 0.18
      }, {
        x: 49,
        y: 33,
        w: 13,
        h: 32,
        offsetX: 1,
        offsetY: 0,
        duration: 0.13
      }, {
        x: 62,
        y: 33,
        w: 23,
        h: 32,
        offsetX: -4,
        offsetY: -1,
        duration: 0.18
      }, {
        x: 49,
        y: 33,
        w: 13,
        h: 32,
        offsetX: 1,
        offsetY: 0,
        duration: 0.13
      }
    ],
    isLooping: true
  });
  playerSprite.addAnimation({
    name: 'runningRight',
    frames: [
      {
        x: 19,
        y: 0,
        w: 30,
        h: 32,
        offsetX: -9,
        offsetY: -1,
        duration: 0.18
      }, {
        x: 49,
        y: 0,
        w: 13,
        h: 32,
        offsetX: 1,
        offsetY: 0,
        duration: 0.13
      }, {
        x: 62,
        y: 0,
        w: 23,
        h: 32,
        offsetX: -4,
        offsetY: -1,
        duration: 0.18
      }, {
        x: 49,
        y: 0,
        w: 13,
        h: 32,
        offsetX: 1,
        offsetY: 0,
        duration: 0.13
      }
    ],
    isLooping: true
  });
  playerSprite.addAnimation({
    name: 'standingLeft',
    frames: [
      {
        x: 0,
        y: 33,
        w: 19,
        h: 32,
        offsetX: 1,
        offsetY: 0,
        duration: 1
      }
    ],
    isLooping: false
  });
  playerSprite.addAnimation({
    name: 'standingRight',
    frames: [
      {
        x: 0,
        y: 0,
        w: 19,
        h: 32,
        offsetX: -1,
        offsetY: 0,
        duration: 1
      }
    ],
    isLooping: false
  });
  player = new Player({
    sprite: playerSprite,
    posX: 6,
    posY: 6,
    colW: 1,
    colH: 2,
    speedXMax: 9,
    accelerationAir: 900,
    decelerationAir: 900,
    accelerationGround: 900,
    decelerationGround: 900
  });
  core.cycleCallback = function() {
    return view.cameraPosX = player.posX - 15;
  };
  layers.add(new Layer({
    id: 'mountains',
    spritesheet: 'sprite-background.png',
    isLooping: true,
    parallax: 0.5,
    chunks: [
      {
        chunkOffsetX: 0,
        chunkOffsetY: 0,
        colBoxes: [],
        tileOffsetX: 0,
        tileOffsetY: 10,
        tiles: [-1, 5, 6, -1, -1, -1, -1, -1, -1, -1, 20, 21, 22, 23, -1, -1, -1, 27, 28, -1, 36, 37, 38, 39, 40, -1, 42, 43, 44, 45, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 7, 8, 9, 10, 11, 7, 8, 9, 10, 11],
        width: 10
      }
    ]
  }));
  layers.add(new Layer({
    id: 'cloud 1',
    spritesheet: 'sprite-background.png',
    isLooping: true,
    parallax: 0.21,
    chunks: [
      {
        chunkOffsetX: 50,
        chunkOffsetY: 0,
        colBoxes: [],
        tileOffsetX: 30,
        tileOffsetY: 3,
        tiles: [0, 1, 2, 3, 16, 17, 18, 19],
        width: 4
      }
    ]
  }));
  layers.add(new Layer({
    id: 'cloud 2',
    spritesheet: 'sprite-background.png',
    isLooping: true,
    parallax: 0.2,
    chunks: [
      {
        chunkOffsetX: 0,
        chunkOffsetY: 0,
        colBoxes: [],
        tileOffsetX: 29,
        tileOffsetY: 5,
        tiles: [0, 1, 2, 3, 16, 17, 18, 19],
        width: 4
      }
    ]
  }));
  return layers.add(new Layer({
    id: 'ground',
    spritesheet: 'sprite-background.png',
    chunks: [
      {
        chunkOffsetX: 0,
        chunkOffsetY: 0,
        colBoxes: [],
        tileOffsetX: 0,
        tileOffsetY: 13,
        tiles: [-1, -1, -1, 4, -1, -1, -1, -1, -1, -1, -1, 32, 34, 33, 35, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 32, 33, 34, 33, 35, -1, -1, -1, -1, -1, -1, -1, 48, 51, -1, -1, -1, -1, -1, -1, -1, 32, 33, 34, 33, 34, 33, 34, 33, 35, 48, 49, 50, 49, 50, 33, 34, 35, -1, -1, -1, -1, 48, 51, -1, -1, -1, -1, 32, 33, 34, 50, 49, 50, 49, 50, 49, 50, 49, 51, 48, 49, 50, 49, 50, 49, 50, 49, 34, 33, 34, 33, 50, 49, 34, 33, 34, 33, 50, 49, 50, 50, 49, 50, 49, 50, 49, 50, 49, 51],
        width: 30
      }, {
        chunkOffsetX: 30,
        chunkOffsetY: 0,
        colBoxes: [],
        tileOffsetX: 0,
        tileOffsetY: 13,
        tiles: [-1, -1, -1, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 32, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 35, 48, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 51, 48, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 51],
        width: 30
      }
    ]
  }));
});



},{"./classes/Layer":4,"./classes/Player":6,"./classes/Sprite":9,"./modules/core":13,"./modules/event":15,"./modules/layers":17,"./modules/util":18,"./modules/view":19}],11:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var background;

module.exports = background = {
  tileSize: 16,
  color: '#6ec0ff'
};



},{}],12:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Line, Rect, collision, util, view;

collision = {};

module.exports = collision;

Line = require('../classes/Line');

Rect = require('../classes/Rect');

util = require('./util');

view = require('./view');

collision.actorToLayer = function(actor, layer, options) {
  var a2Corner, bgCorner, colAng, collisions, endX, endY, isHorizontalCollision, movAng, neighborTile, newPosX, newPosY, newSpeedX, newSpeedY, o, startX, startY, tile, x, y, _i, _j;
  o = {
    reposition: false
  };
  o = util.merge(o, options);
  collisions = {
    any: false,
    bottom: false,
    top: false,
    left: false,
    right: false,
    friction: 1.0
  };
  newPosX = actor.posX;
  newPosY = actor.posY;
  newSpeedX = actor.speedX;
  newSpeedY = actor.speedY;
  startX = actor.posX >> 0;
  endX = (actor.posX + actor.colW) >> 0;
  startY = actor.posY >> 0;
  endY = (actor.posY + actor.colH) >> 0;
  for (y = _i = startY; startY <= endY ? _i <= endY : _i >= endY; y = startY <= endY ? ++_i : --_i) {
    for (x = _j = startX; startX <= endX ? _j <= endX : _j >= endX; x = startX <= endX ? ++_j : --_j) {
      tile = layer.getTile(x, y);
      if (tile > -1) {

        /*
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
         */
        if (actor.speedX === 0) {
          isHorizontalCollision = false;
        } else if (actor.speedY === 0) {
          isHorizontalCollision = true;
        } else {
          a2Corner = {};
          bgCorner = {};
          if (actor.speedX > 0) {
            a2Corner.x = actor.posX + actor.colW;
            bgCorner.x = x;
          } else {
            a2Corner.x = actor.posX;
            bgCorner.x = x + 1;
          }
          if (actor.speedY > 0) {
            a2Corner.y = actor.posY + actor.colH;
            bgCorner.y = y;
          } else {
            a2Corner.y = actor.posY;
            bgCorner.y = y + 1;
          }
          movAng = Math.abs(actor.speedY / actor.speedX);
          colAng = Math.abs((a2Corner.y - bgCorner.y) / (a2Corner.x - bgCorner.x));
          if (movAng - colAng < 0.01) {
            isHorizontalCollision = true;
          } else {
            isHorizontalCollision = false;
          }
        }
        if (isHorizontalCollision) {
          if (actor.speedX > 0) {
            neighborTile = layer.getTile(x, y, -1, 0);
            if (neighborTile === -1) {
              newPosX = x - actor.colW - 0.01;
              newSpeedX = 0;
              collisions.any = true;
              collisions.right = true;
              view.drawOnce({
                "class": Line,
                x: x,
                y: y,
                x2: x,
                y2: y + 1,
                strokeStyle: 'rgba(0,128,0,0.9)'
              });
            } else {
              view.drawOnce({
                "class": Line,
                x: x,
                y: y,
                x2: x,
                y2: y + 1,
                strokeStyle: 'rgba(255,64,0,0.6)'
              });
            }
          } else {
            neighborTile = layer.getTile(x, y, 1, 0);
            if (neighborTile === -1) {
              newPosX = x + 1;
              newSpeedX = 0;
              collisions.any = true;
              collisions.left = true;
              view.drawOnce({
                "class": Line,
                x: x + 1,
                y: y,
                x2: x + 1,
                y2: y + 1,
                strokeStyle: 'rgba(0,128,0,0.9)'
              });
            } else {
              view.drawOnce({
                "class": Line,
                x: x + 1,
                y: y,
                x2: x + 1,
                y2: y + 1,
                strokeStyle: 'rgba(255,64,0,0.6)'
              });
            }
          }
        } else {
          if (actor.speedY < 0) {
            neighborTile = layer.getTile(x, y, 0, 1);
            if (neighborTile === -1) {
              newPosY = y + 1;
              newSpeedY = 0;
              collisions.any = true;
              collisions.top = true;
              view.drawOnce({
                "class": Line,
                x: x,
                y: y + 1,
                x2: x + 1,
                y2: y + 1,
                strokeStyle: 'rgba(0,128,0,0.9)'
              });
            } else {
              view.drawOnce({
                "class": Line,
                x: x,
                y: y + 1,
                x2: x + 1,
                y2: y + 1,
                strokeStyle: 'rgba(255,64,0,0.6)'
              });
            }
          } else if (actor.speedY > 0) {
            neighborTile = layer.getTile(x, y, 0, -1);
            if (neighborTile === -1) {
              newPosY = y - actor.colH;
              newSpeedY = 0;
              collisions.any = true;
              collisions.bottom = true;
              view.drawOnce({
                "class": Line,
                x: x,
                y: y,
                x2: x + 1,
                y2: y,
                strokeStyle: 'rgba(0,128,0,0.9)'
              });
            } else {
              view.drawOnce({
                "class": Line,
                x: x,
                y: y,
                x2: x + 1,
                y2: y,
                strokeStyle: 'rgba(255,64,0,0.6)'
              });
            }
          }
        }
        if (neighborTile === -1) {
          view.drawOnce({
            "class": Rect,
            x: x,
            y: y,
            w: 1,
            h: 1,
            fillStyle: 'rgba(0,255,0,0.6)'
          });
        } else {
          view.drawOnce({
            "class": Rect,
            x: x,
            y: y,
            w: 1,
            h: 1,
            fillStyle: 'rgba(255,255,0,0.5)'
          });
        }
      }
    }
  }
  if (o.reposition) {
    actor.posX = newPosX;
    actor.posY = newPosY;
    actor.speedX = newSpeedX;
    actor.speedY = newSpeedY;
  }
  return collisions;
};



},{"../classes/Line":5,"../classes/Rect":7,"./util":18,"./view":19}],13:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var background, core, event, layers, util, view, _editTile, _frameBuffer, _latestFrameTime, _view, _viewCtx;

background = require('./background');

event = require('./event');

layers = require('./layers');

util = require('./util');

view = require('./view');

core = {};

module.exports = core;

_view = null;

_viewCtx = null;

_frameBuffer = document.createElement('canvas');

_latestFrameTime = Date.now();

_editTile = -1;

core.frameBufferCtx = _frameBuffer.getContext('2d');

core.camX = 0;

core.camY = 0;

core.camW = 0;

core.camH = 0;

core.actors = [];

core.shapes = [];

core.imgPath = '_img/';

core.init = function() {
  _view = document.getElementById('leo-view');
  _frameBuffer.width = _view.width;
  _frameBuffer.height = _view.height;
  _view.width = _view.width * view.scale;
  _view.height = _view.height * view.scale;
  _viewCtx = _view.getContext('2d');
  _viewCtx.imageSmoothingEnabled = _viewCtx.webkitImageSmoothingEnabled = _viewCtx.mozImageSmoothingEnabled = false;
  _view.addEventListener('mousedown', function(e) {
    var camX, camY, layer, mouseX, mouseY, scale, tile, tileSize, tileX, tileY;
    if (e.button !== 0) {
      return;
    }
    e.preventDefault();
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    camX = view.cameraPosX;
    camY = view.cameraPosY;
    scale = view.scale;
    tileSize = background.tileSize;
    tileX = (mouseX / scale / tileSize + camX) >> 0;
    tileY = (mouseY / scale / tileSize + camY) >> 0;
    layer = layers.get('ground');
    tile = layer.getTile(tileX, tileY);
    console.log(tileX, tileY);
    if (e.altKey) {
      return _editTile = tile;
    } else {
      return layer.setTile(tileX, tileY, _editTile);
    }
  });
  _view.addEventListener('mouseup', function(e) {
    return e.preventDefault();
  });
  window.addEventListener('keydown', event._keydown);
  window.addEventListener('keyup', event._keyup);
  return window.requestAnimationFrame(core.cycle);
};

core.draw = function() {
  var actor, layer, name, shape, so, val, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
  if (util.documentHidden()) {
    return;
  }
  core.camX = view.cameraPosX * background.tileSize;
  core.camY = view.cameraPosY * background.tileSize;
  core.camW = view.cameraWidth * background.tileSize;
  core.camH = view.cameraHeight * background.tileSize;
  core.frameBufferCtx.fillStyle = background.color;
  core.frameBufferCtx.fillRect(0, 0, _view.width, _view.height);
  _ref = layers.objects;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    layer = _ref[_i];
    layer.draw();
  }
  _ref1 = core.actors;
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    actor = _ref1[_j];
    actor.draw();
  }
  _ref2 = core.shapes;
  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
    shape = _ref2[_k];
    shape.draw();
  }
  while (so = view.drawOnceQue.pop()) {
    shape = new so["class"]();
    for (name in so) {
      val = so[name];
      shape[name] = val;
    }
    shape.isVisible = true;
    shape.draw();
    shape.isVisible = false;
  }
  return _viewCtx.drawImage(_frameBuffer, 0, 0, _frameBuffer.width * view.scale, _frameBuffer.height * view.scale);
};

core.cycle = function() {
  var actor, cycleLength, thisFrameTime, _i, _len, _ref;
  thisFrameTime = Date.now();
  cycleLength = Math.min(thisFrameTime - _latestFrameTime, 100) * 0.001;
  if (!cycleLength) {
    return;
  }
  view.cameraPosX += view.cameraSpeedX * cycleLength;
  _ref = core.actors;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    actor = _ref[_i];
    actor.update(cycleLength);
  }
  core.draw();
  _latestFrameTime = thisFrameTime;
  window.requestAnimationFrame(core.cycle);
  return core.cycleCallback(cycleLength);
};

core.DATA_TYPES = {
  CHUNK: 0
};

core.cycleCallback = function() {};



},{"./background":11,"./event":15,"./layers":17,"./util":18,"./view":19}],14:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var environment;

module.exports = environment = {
  gravity: 60
};



},{}],15:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var event, layers, util;

layers = require('./layers');

util = require('./util');

event = {};

module.exports = event;

event.pressedKeys = [];

event._keydown = function(e) {
  var data, key, keyIndex;
  if (!(e.ctrlKey || e.metaKey)) {
    e.preventDefault();
  }
  keyIndex = event.pressedKeys.indexOf(e.keyCode);
  if (keyIndex === -1) {
    event.pressedKeys.push(e.keyCode);
    key = util.KEY_CODES;
    switch (e.keyCode) {
      case key.S:
        data = layers.get('ground').serialize();
        localStorage.setItem('ground', data);
        break;
      case key.L:
        data = localStorage.getItem('ground');
        layers.get('ground').deserialize(data);
    }
    return event.keydown(e);
  }
};

event.keydown = function(e) {};

event._keyup = function(e) {
  var keyIndex;
  e.preventDefault();
  keyIndex = event.pressedKeys.indexOf(e.keyCode);
  if (keyIndex !== -1) {
    event.pressedKeys.splice(keyIndex, 1);
  }
  return event.keyup(e);
};

event.keyup = function(e) {};



},{"./layers":17,"./util":18}],16:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var event, io, util;

util = require('./util');

event = require('./event');

io = {};

module.exports = io;

io.getPressedKeys = function() {
  return event.pressedKeys;
};

io.isKeyPressed = function(key) {
  if (typeof key === 'string') {
    key = util.KEY_CODES[key.toUpperCase()];
  }
  if (typeof key !== 'number') {
    return false;
  }
  return event.pressedKeys.indexOf(key) > -1;
};

io.anyKeyPressed = function(keys) {
  var key, keyCodes, _i, _len;
  keyCodes = util.KEY_CODES;
  if (typeof key === 'string') {
    key = [key];
  }
  for (_i = 0, _len = keys.length; _i < _len; _i++) {
    key = keys[_i];
    if (typeof key === 'string') {
      key = keyCodes[key.toUpperCase()];
    }
    if (event.pressedKeys.indexOf(key) > -1) {
      return true;
    }
  }
  return false;
};

io.allKeysPressed = function(keys) {
  var key, keyCodes, _i, _len;
  keyCodes = util.KEY_CODES;
  if (typeof key === 'string') {
    key = [key];
  }
  for (_i = 0, _len = keys.length; _i < _len; _i++) {
    key = keys[_i];
    if (typeof key === 'string') {
      key = keyCodes[key.toUpperCase()];
    }
    if (event.pressedKeys.indexOf(key) === -1) {
      return false;
    }
  }
  return true;
};



},{"./event":15,"./util":18}],17:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var layers;

layers = {};

module.exports = layers;

layers.objects = [];

layers.add = function(layerObj) {
  if (!(layerObj != null ? layerObj.id : void 0) || layers.get(layerObj.id)) {
    return null;
  }
  return layers.objects.push(layerObj);
};

layers.get = function(id) {
  var layerObj, _i, _len, _ref;
  _ref = layers.objects;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    layerObj = _ref[_i];
    if (layerObj.id === id) {
      return layerObj;
    }
  }
  return null;
};

layers.getImg = function(path) {
  var _img, _imgObj;
  _img = layers._img;
  if (_img[path]) {
    return _img[path];
  } else {
    _imgObj = _img[path] = new Image();
    _imgObj.src = '_img/' + path;
    return _imgObj;
  }
};

layers.removeImg = function(path) {
  var _img;
  _img = layers._img;
  if (_img[path]) {
    return _img[path] = null;
  }
};

layers._img = {};



},{}],18:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var util;

util = {};

module.exports = util;

util.KEY_CODES = {
  'BACKSPACE': 8,
  'TAB': 9,
  'ENTER': 13,
  'SHIFT': 16,
  'CTRL': 17,
  'ALT': 18,
  'PAUSE_BREAK': 19,
  'CAPS_LOCK': 20,
  'ESCAPE': 27,
  'PAGE_UP': 33,
  'PAGE_DOWN': 34,
  'END': 35,
  'HOME': 36,
  'LEFT': 37,
  'UP': 38,
  'RIGHT': 39,
  'DOWN': 40,
  'INSERT': 45,
  'DELETE': 46,
  '0': 48,
  '1': 49,
  '2': 50,
  '3': 51,
  '4': 52,
  '5': 53,
  '6': 54,
  '7': 55,
  '8': 56,
  '9': 57,
  'A': 65,
  'B': 66,
  'C': 67,
  'D': 68,
  'E': 69,
  'F': 70,
  'G': 71,
  'H': 72,
  'I': 73,
  'J': 74,
  'K': 75,
  'L': 76,
  'M': 77,
  'N': 78,
  'O': 79,
  'P': 80,
  'Q': 81,
  'R': 82,
  'S': 83,
  'T': 84,
  'U': 85,
  'V': 86,
  'W': 87,
  'X': 88,
  'Y': 89,
  'Z': 90,
  'LEFT_WINDOW_KEY': 91,
  'RIGHT_WINDOW_KEY': 92,
  'SELECT_KEY': 93,
  'NUMPAD_0': 96,
  'NUMPAD_1': 97,
  'NUMPAD_2': 98,
  'NUMPAD_3': 99,
  'NUMPAD_4': 100,
  'NUMPAD_5': 101,
  'NUMPAD_6': 102,
  'NUMPAD_7': 103,
  'NUMPAD_8': 104,
  'NUMPAD_9': 105,
  'MULTIPLY': 106,
  '*': 106,
  'ADD': 107,
  '+': 107,
  'SUBTRACT': 109,
  'DECIMAL_POINT': 110,
  'DIVIDE': 111,
  'F1': 112,
  'F2': 113,
  'F3': 114,
  'F4': 115,
  'F5': 116,
  'F6': 117,
  'F7': 118,
  'F8': 119,
  'F9': 120,
  'F10': 121,
  'F11': 122,
  'F12': 123,
  'NUM_LOCK': 144,
  'SCROLL_LOCK': 145,
  'SEMI-COLON': 186,
  ';': 186,
  'EQUAL_SIGN': 187,
  '=': 187,
  'COMMA': 188,
  ',': 188,
  'DASH': 189,
  '-': 189,
  'PERIOD': 190,
  '.': 190,
  'FORWARD_SLASH': 191,
  '/': 191,
  'GRAVE_ACCENT': 192,
  'OPEN_BRACKET': 219,
  '[': 219,
  'BACK_SLASH': 220,
  '\\': 220,
  'CLOSE_BRAKET': 221,
  ']': 221,
  'SINGLE_QUOTE': 222,
  '\'': 222
};

util.documentHidden = function() {
  var i, vendor, vendors, _i, _len;
  vendors = ['ms', 'moz', 'webkit', 'o'];
  i = 0;
  if (document.hidden != null) {
    return document.hidden;
  }
  for (_i = 0, _len = vendors.length; _i < _len; _i++) {
    vendor = vendors[_i];
    if (typeof document[vendor + 'Hidden'] !== 'undefined') {
      return document[vendor + 'Hidden'];
    }
  }
  return false;
};

util.merge = function() {
  var name, obj, ret, val, _i, _len;
  ret = {};
  for (_i = 0, _len = arguments.length; _i < _len; _i++) {
    obj = arguments[_i];
    if (typeof obj !== 'object' || (obj instanceof Array)) {
      continue;
    }
    for (name in obj) {
      val = obj[name];
      ret[name] = val;
    }
  }
  return ret;
};



},{}],19:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var background, view;

background = require('./background');

view = {};

module.exports = view;

view.scale = 2;

view.cameraPosX = 2.0;

view.cameraPosY = 0.0;

view.cameraSpeedX = 0.0;

view.cameraSpeedY = 0.0;

view.cameraWidth = 30;

view.cameraHeight = 17;

view.posToPx = function(posX, axis, parallax) {
  if (parallax == null) {
    parallax = 1.0;
  }
  return ((posX - view['cameraPos' + axis.toUpperCase()]) * background.tileSize * parallax) >> 0;
};

view.drawOnceQue = [];

view.drawOnce = function(data) {
  return view.drawOnceQue.push(data);
};



},{"./background":11}]},{},[10])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9jbGFzc2VzL0FjdG9yLmNvZmZlZSIsIi9Vc2Vycy9tYWdudXMvTWFnbnVzL1dlYmJ1dHZlY2tsaW5nL0xlbyBFbmdpbmUvc3JjL2NsYXNzZXMvQW5pbWF0aW9uLmNvZmZlZSIsIi9Vc2Vycy9tYWdudXMvTWFnbnVzL1dlYmJ1dHZlY2tsaW5nL0xlbyBFbmdpbmUvc3JjL2NsYXNzZXMvRnJhbWUuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvY2xhc3Nlcy9MYXllci5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9jbGFzc2VzL0xpbmUuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvY2xhc3Nlcy9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvY2xhc3Nlcy9SZWN0LmNvZmZlZSIsIi9Vc2Vycy9tYWdudXMvTWFnbnVzL1dlYmJ1dHZlY2tsaW5nL0xlbyBFbmdpbmUvc3JjL2NsYXNzZXMvU2hhcGUuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvY2xhc3Nlcy9TcHJpdGUuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9tb2R1bGVzL2JhY2tncm91bmQuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvbW9kdWxlcy9jb2xsaXNpb24uY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvbW9kdWxlcy9jb3JlLmNvZmZlZSIsIi9Vc2Vycy9tYWdudXMvTWFnbnVzL1dlYmJ1dHZlY2tsaW5nL0xlbyBFbmdpbmUvc3JjL21vZHVsZXMvZW52aXJvbm1lbnQuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvbW9kdWxlcy9ldmVudC5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9tb2R1bGVzL2lvLmNvZmZlZSIsIi9Vc2Vycy9tYWdudXMvTWFnbnVzL1dlYmJ1dHZlY2tsaW5nL0xlbyBFbmdpbmUvc3JjL21vZHVsZXMvbGF5ZXJzLmNvZmZlZSIsIi9Vc2Vycy9tYWdudXMvTWFnbnVzL1dlYmJ1dHZlY2tsaW5nL0xlbyBFbmdpbmUvc3JjL21vZHVsZXMvdXRpbC5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9tb2R1bGVzL3ZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFBQSx5REFBQTtBQUFBLElBQUEsbUJBQUE7O0FBQUEsSUFFQSxHQUFPLE9BQUEsQ0FBUSxpQkFBUixDQUZQLENBQUE7O0FBQUEsTUFHQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBSFQsQ0FBQTs7QUFBQSxNQUtNLENBQUMsT0FBUCxHQUNNO0FBRVcsRUFBQSxlQUFDLFVBQUQsR0FBQTtBQUVULFFBQUEsUUFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxDQUFSLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxJ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QSxDQUFRLGNBQVIsQ0FGYixDQUFBOztBQUFBLElBSUEsR0FBTyxFQUpQLENBQUE7O0FBQUEsTUFLTSxDQUFDLE9BQVAsR0FBaUIsSUFMakIsQ0FBQTs7QUFBQSxJQU9JLENBQUMsS0FBTCxHQUFhLENBUGIsQ0FBQTs7QUFBQSxJQVFJLENBQUMsVUFBTCxHQUFrQixHQVJsQixDQUFBOztBQUFBLElBU0ksQ0FBQyxVQUFMLEdBQWtCLEdBVGxCLENBQUE7O0FBQUEsSUFVSSxDQUFDLFlBQUwsR0FBb0IsR0FWcEIsQ0FBQTs7QUFBQSxJQVdJLENBQUMsWUFBTCxHQUFvQixHQVhwQixDQUFBOztBQUFBLElBWUksQ0FBQyxXQUFMLEdBQW1CLEVBWm5CLENBQUE7O0FBQUEsSUFhSSxDQUFDLFlBQUwsR0FBb0IsRUFicEIsQ0FBQTs7QUFBQSxJQWVJLENBQUMsT0FBTCxHQUFlLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxRQUFiLEdBQUE7O0lBQWEsV0FBVztHQUNuQztBQUFBLFNBQU8sQ0FBQyxDQUFDLElBQUEsR0FBTyxJQUFLLENBQUEsV0FBQSxHQUFjLElBQUksQ0FBQyxXQUFMLENBQUEsQ0FBZCxDQUFiLENBQUEsR0FBa0QsVUFBVSxDQUFDLFFBQTdELEdBQXdFLFFBQXpFLENBQUEsSUFBc0YsQ0FBN0YsQ0FEVztBQUFBLENBZmYsQ0FBQTs7QUFBQSxJQWtCSSxDQUFDLFdBQUwsR0FBbUIsRUFsQm5CLENBQUE7O0FBQUEsSUFtQkksQ0FBQyxRQUFMLEdBQWdCLFNBQUMsSUFBRCxHQUFBO1NBQ1osSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFqQixDQUFzQixJQUF0QixFQURZO0FBQUEsQ0FuQmhCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxuY29yZSA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29yZScpXG5TcHJpdGUgPSByZXF1aXJlKCcuL1Nwcml0ZScpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEFjdG9yXG5cbiAgICBjb25zdHJ1Y3RvcjogKHByb3BlcnRpZXMpIC0+ICMgQWN0b3I6OmNvbnN0cnVjdG9yXG4gICAgICAgICMgRGVmYXVsdHNcbiAgICAgICAgQHBvc1ggPSAwXG4gICAgICAgIEBwb3NZID0gMFxuICAgICAgICBAc3BlZWRYID0gMFxuICAgICAgICBAc3BlZWRZID0gMFxuXG4gICAgICAgICMgVXNlciBkZWZpbmVkIHByb3BlcnRpZXNcbiAgICAgICAgZm9yIGtleSwgdmFsIG9mIHByb3BlcnRpZXNcbiAgICAgICAgICAgIEBba2V5XSA9IHZhbFxuXG4gICAgICAgIGNvcmUuYWN0b3JzLnB1c2ggdGhpc1xuXG5cbiAgICBkcmF3OiAtPiAjIEFjdG9yOjpkcmF3XG4gICAgICAgIEBzcHJpdGUuZHJhdyhAcG9zWCwgQHBvc1kpXG5cblxuICAgIHNldFNwcml0ZTogKHNwcml0ZSkgLT4gIyBBY3Rvcjo6c2V0U3ByaXRlXG4gICAgICAgIHVubGVzcyBzcHJpdGUgaW5zdGFuY2VvZiBTcHJpdGVcbiAgICAgICAgICAgIHRocm93ICdBY3Rvcjo6c2V0U3ByaXRlIC0gTWlzc2luZyBTcHJpdGUnXG4gICAgICAgIEBzcHJpdGUgPSBzcHJpdGVcblxuXG4gICAgdXBkYXRlOiAoY3ljbGVMZW5ndGgpIC0+ICMgQWN0b3I6OnVwZGF0ZVxuICAgICAgICAjIEFuaW1hdGlvblxuICAgICAgICBAc3ByaXRlLmFkdmFuY2VBbmltYXRpb24oY3ljbGVMZW5ndGgpXG5cbiAgICAgICAgIyBQb3NpdGlvblxuICAgICAgICBAcG9zWCArPSBAc3BlZWRYICogY3ljbGVMZW5ndGhcbiAgICAgICAgQHBvc1kgKz0gQHNwZWVkWSAqIGN5Y2xlTGVuZ3RoXG5cblxuICAgIGRlY2VsZXJhdGU6IChheGlzLCBhbW91bnQpIC0+ICMgQWN0b3I6OmRlY2VsZXJhdGVcbiAgICAgICAgaWYgbm90IGFtb3VudFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGF4aXMgPSBheGlzLnRvVXBwZXJDYXNlKClcbiAgICAgICAgdW5pdE5hbWUgPSAnc3BlZWQnICsgYXhpc1xuICAgICAgICBjdXJTcGVlZCA9IEBbdW5pdE5hbWVdXG4gICAgICAgIGlmIGN1clNwZWVkID4gMFxuICAgICAgICAgICAgQFt1bml0TmFtZV0gPSBNYXRoLm1heChjdXJTcGVlZCAtIGFtb3VudCwgMClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQFt1bml0TmFtZV0gPSBNYXRoLm1pbihjdXJTcGVlZCArIGFtb3VudCwgMClcbiIsIiMjIyBDb3B5cmlnaHQgKGMpIDIwMTUgTWFnbnVzIExlby4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gIyMjXG5cbkZyYW1lID0gcmVxdWlyZSgnLi9GcmFtZScpXG51dGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQW5pbWF0aW9uXG5cbiAgICBjb25zdHJ1Y3RvcjogKHNwcml0ZSwgb3B0aW9ucykgLT4gIyBBbmltYXRpb246OmNvbnN0cnVjdG9yXG4gICAgICAgIGRlZmF1bHRPcHRpb25zID1cbiAgICAgICAgICAgIGlzTG9vcGluZzogZmFsc2VcbiAgICAgICAgQG9wdGlvbnMgPSB1dGlsLm1lcmdlKGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKVxuXG4gICAgICAgIHVubGVzcyBzcHJpdGVcbiAgICAgICAgICAgICB0aHJvdyAnTWlzc2luZyBhbmltYXRpb24gc3ByaXRlJ1xuICAgICAgICBAc3ByaXRlID0gc3ByaXRlXG5cbiAgICAgICAgQGZyYW1lVGltZUxlZnQgPSAwICMgVGltZSBsZWZ0IG9uIGN1cnJlbnQgYW5pbWF0aW9uIGZyYW1lXG4gICAgICAgIEBmcmFtZU51bSA9IDAgIyBDdXJyZW50IGFuaW1hdGlvbiBmcmFtZVxuICAgICAgICBAbmFtZSA9IG9wdGlvbnMubmFtZVxuXG4gICAgICAgIEBmcmFtZXMgPSBbXVxuICAgICAgICBmb3IgZnJhbWVEYXRhIGluIEBvcHRpb25zLmZyYW1lc1xuICAgICAgICAgICAgQGFkZEZyYW1lKGZyYW1lRGF0YSlcblxuXG4gICAgYWRkRnJhbWU6IChmcmFtZSkgLT4gIyBBbmltYXRpb246OmFkZEZyYW1lXG4gICAgICAgIHVubGVzcyBmcmFtZSBpbnN0YW5jZW9mIEZyYW1lXG4gICAgICAgICAgICBmcmFtZSA9IG5ldyBGcmFtZShmcmFtZSlcblxuICAgICAgICB1bmxlc3MgZnJhbWUgaW5zdGFuY2VvZiBGcmFtZVxuICAgICAgICAgICAgdGhyb3cgJ0FuaW1hdGlvbjo6YWRkRnJhbWUgLSBNaXNzaW5nIEZyYW1lJ1xuXG4gICAgICAgIEBmcmFtZXMucHVzaCBmcmFtZVxuXG5cbiAgICBhZHZhbmNlOiAoY3ljbGVMZW5ndGgpIC0+ICMgQW5pbWF0aW9uOjphZHZhbmNlXG4gICAgICAgIG1heEZyYW1lID0gQGZyYW1lcy5sZW5ndGggLSAxXG4gICAgICAgIEBmcmFtZU51bSA9IE1hdGgubWluKEBmcmFtZU51bSwgbWF4RnJhbWUpXG4gICAgICAgIEBmcmFtZVRpbWVMZWZ0IC09IGN5Y2xlTGVuZ3RoXG4gICAgICAgIHdoaWxlIEBmcmFtZVRpbWVMZWZ0IDwgMFxuICAgICAgICAgICAgQGZyYW1lTnVtKytcbiAgICAgICAgICAgIGlmIEBmcmFtZU51bSA+IG1heEZyYW1lXG4gICAgICAgICAgICAgICAgaWYgQG9wdGlvbnMuaXNMb29waW5nICB0aGVuIEBmcmFtZU51bSA9IDAgZWxzZSBAZnJhbWVOdW0tLVxuICAgICAgICAgICAgQGZyYW1lVGltZUxlZnQgPSBAZnJhbWVzW0BmcmFtZU51bV0uZGF0YVs2XSArIEBmcmFtZVRpbWVMZWZ0XG5cblxuICAgIGp1bXBUb0ZyYW1lOiAoZnJhbWVOdW0pIC0+ICMgQW5pbWF0aW9uOjpqdW1wVG9GcmFtZVxuICAgICAgICBmcmFtZU51bSA+PiAwXG4gICAgICAgIGZyYW1lTnVtID0gTWF0aC5taW4oZnJhbWVOdW0sIEBmcmFtZXMubGVuZ3RoIC0gMSlcbiAgICAgICAgZnJhbWVOdW0gPSBNYXRoLm1heChmcmFtZU51bSwgMClcbiAgICAgICAgQGZyYW1lTnVtID0gZnJhbWVOdW1cbiAgICAgICAgQGZyYW1lVGltZUxlZnQgPSBAZnJhbWVzW2ZyYW1lTnVtXS5kYXRhWzZdXG5cblxuICAgIGdldEN1cnJlbnRGcmFtZTogLT4gIyBBbmltYXRpb246OmdldEN1cnJlbnRGcmFtZVxuICAgICAgICByZXR1cm4gQGZyYW1lc1tAZnJhbWVOdW1dXG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG51dGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRnJhbWVcblxuICAgIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT4gIyBGcmFtZTo6Y29uc3RydWN0b3JcbiAgICAgICAgZGVmYXVsdERhdGEgPVxuICAgICAgICAgICAgeDogMFxuICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgdzogMTZcbiAgICAgICAgICAgIGg6IDE2XG4gICAgICAgICAgICBvZmZzZXRYOiAwXG4gICAgICAgICAgICBvZmZzZXRZOiAwXG4gICAgICAgICAgICBkdXJhdGlvbjogMjAwXG4gICAgICAgIGRhdGEgPSB1dGlsLm1lcmdlKGRlZmF1bHREYXRhLCBkYXRhKVxuICAgICAgICBAZGF0YSA9IFtkYXRhLngsIGRhdGEueSwgZGF0YS53LCBkYXRhLmgsIGRhdGEub2Zmc2V0WCwgZGF0YS5vZmZzZXRZLCBkYXRhLmR1cmF0aW9uXVxuIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxuY29yZSA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29yZScpXG5iYWNrZ3JvdW5kID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9iYWNrZ3JvdW5kJylcbmxheWVycyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbGF5ZXJzJylcbnZpZXcgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3ZpZXcnKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMYXllclxuXG4gICAgY29uc3RydWN0b3I6IChwcm9wZXJ0aWVzKSAtPiAjIExheWVyOjpjb25zdHJ1Y3RvclxuICAgICAgICAjIERlZmF1bHRzXG4gICAgICAgIEBzcHJpdGVzaGVldCA9ICcnICMgTmFtZSBvZiB0aGUgc3ByaXRlc2hlZXQgZmlsZVxuICAgICAgICBAY2h1bmtzID0gW1xuICAgICAgICAgICAgY2h1bmtPZmZzZXRYOiAwXG4gICAgICAgICAgICBjaHVua09mZnNldFk6IDBcbiAgICAgICAgICAgIGNvbEJveGVzOiBbXSAjIFt0bDEsdHIxLGJsMSxicjEsIC4uLiB0bG4sdHJuLGJsbixicm5dXG4gICAgICAgICAgICB0aWxlT2Zmc2V0WDogMCAjIE51bWJlciBvZiB0aWxlcyBvZmZzZXQgaW4gWFxuICAgICAgICAgICAgdGlsZU9mZnNldFk6IDAgIyBOdW1iZXIgb2YgdGlsZXMgb2Zmc2V0IGluIFlcbiAgICAgICAgICAgIHRpbGVzOltdICMgVGlsZSBzcHJpdGUgcG9zaXRpb25zIFt4MSx5MSwgLi4uIHhuLCB5bl0gLTEgaXMgbm90aGluZy90cmFuc3BhcmVudFxuICAgICAgICBdXG4gICAgICAgIEBpc0xvb3BpbmcgPSBmYWxzZVxuICAgICAgICBAcGFyYWxsYXggPSAxLjBcblxuICAgICAgICAjIFVzZXIgZGVmaW5lZCBwcm9wZXJ0aWVzXG4gICAgICAgIGZvciBrZXksIHZhbCBvZiBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBAW2tleV0gPSB2YWxcbiAgICAgICAgQHNwcml0ZUltZyA9IGxheWVycy5nZXRJbWcgQHNwcml0ZXNoZWV0XG4gICAgICAgIGxheWVyID0gdGhpc1xuICAgICAgICBAc3ByaXRlSW1nLmFkZEV2ZW50TGlzdGVuZXIgJ2xvYWQnLCAtPlxuICAgICAgICAgICAgaWYgbm90IGxheWVyLmNodW5rc1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgZm9yIGNodW5rIGluIGxheWVyLmNodW5rc1xuICAgICAgICAgICAgICAgIGNodW5rLnJlZHJhdygpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBAbGF5ZXJOdW1UaWxlc1ggPSAwXG4gICAgICAgIGZvciBjaHVuaywgaSBpbiBAY2h1bmtzXG4gICAgICAgICAgICBAY2h1bmtzW2ldID0gbmV3IENodW5rKHRoaXMsIGNodW5rKVxuICAgICAgICAgICAgQGxheWVyTnVtVGlsZXNYICs9IGNodW5rLnRpbGVzLmxlbmd0aCArIGNodW5rLnRpbGVPZmZzZXRYXG5cblxuICAgIGRyYXc6IC0+ICMgTGF5ZXI6OmRyYXdcbiAgICAgICAgaWYgQGlzTG9vcGluZ1xuICAgICAgICAgICAgY2h1bmsgPSBAY2h1bmtzWzBdXG4gICAgICAgICAgICBwb3NYID0gdmlldy5wb3NUb1B4KGNodW5rLnRpbGVPZmZzZXRYICsgY2h1bmsuY2h1bmtPZmZzZXRYLCAneCcsIEBwYXJhbGxheClcbiAgICAgICAgICAgIG11bHRpcGxpZXIgPSAoKHZpZXcuY2FtZXJhUG9zWCAvIEBsYXllck51bVRpbGVzWCAqIEBwYXJhbGxheCkgPj4gMCkgLSAxXG4gICAgICAgICAgICBwb3NYICs9IEBsYXllck51bVRpbGVzWCAqIGJhY2tncm91bmQudGlsZVNpemUgKiBtdWx0aXBsaWVyXG4gICAgICAgICAgICB3aGlsZSBwb3NYIDwgY29yZS5jYW1XXG4gICAgICAgICAgICAgICAgZm9yIGNodW5rIGluIEBjaHVua3NcbiAgICAgICAgICAgICAgICAgICAgcG9zWSA9IHZpZXcucG9zVG9QeChjaHVuay50aWxlT2Zmc2V0WSArIGNodW5rLmNodW5rT2Zmc2V0WSwgJ3knKVxuICAgICAgICAgICAgICAgICAgICBjaHVuay5kcmF3KHBvc1gsIHBvc1kpXG4gICAgICAgICAgICAgICAgICAgIHBvc1ggKz0gY2h1bmsuZHJhd0J1ZmZlci53aWR0aCArIGNodW5rLnRpbGVPZmZzZXRYUHhcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZm9yIGNodW5rIGluIEBjaHVua3NcbiAgICAgICAgICAgICAgICBwb3NYID0gdmlldy5wb3NUb1B4KGNodW5rLnRpbGVPZmZzZXRYICsgY2h1bmsuY2h1bmtPZmZzZXRYLCAneCcsIEBwYXJhbGxheClcbiAgICAgICAgICAgICAgICBwb3NZID0gdmlldy5wb3NUb1B4KGNodW5rLnRpbGVPZmZzZXRZICsgY2h1bmsuY2h1bmtPZmZzZXRZLCAneScpXG4gICAgICAgICAgICAgICAgY2h1bmsuZHJhdyhwb3NYLCBwb3NZKVxuICAgICAgICByZXR1cm5cblxuXG4gICAgZ2V0VGlsZTogKHRpbGVYLCB0aWxlWSwgb2Zmc2V0WCA9IDAsIG9mZnNldFkgPSAwKSAtPiAjIExheWVyOjpnZXRUaWxlXG4gICAgICAgIGNodW5rTm8gPSBNYXRoLmZsb29yKCh0aWxlWCArIG9mZnNldFgpIC8gQGNodW5rc1swXS53aWR0aClcbiAgICAgICAgaWYgY2h1bmtObyA8IDAgb3IgY2h1bmtObyA+IEBjaHVua3MubGVuZ3RoIC0gMVxuICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgIGNodW5rID0gQGNodW5rc1tjaHVua05vXVxuICAgICAgICB4ID0gdGlsZVggLSBjaHVuay50aWxlT2Zmc2V0WCArIG9mZnNldFggLSBjaHVuay53aWR0aCAqIGNodW5rTm9cbiAgICAgICAgeSA9IHRpbGVZIC0gY2h1bmsudGlsZU9mZnNldFkgKyBvZmZzZXRZXG5cbiAgICAgICAgaWYgMCA+IHggPiBjaHVuay53aWR0aCBvclxuICAgICAgICAwID4geSA+IGNodW5rLndpZHRoXG4gICAgICAgICAgICByZXR1cm4gLTFcblxuICAgICAgICByZXR1cm4gY2h1bmsudGlsZXNbeCArIHkgKiBjaHVuay53aWR0aF0gb3IgLTFcblxuXG4gICAgc2V0VGlsZTogKHRpbGVYLCB0aWxlWSwgdGlsZSkgLT4gIyBMYXllcjo6c2V0VGlsZVxuICAgICAgICBjaHVua05vID0gKHRpbGVYIC8gQGNodW5rc1swXS53aWR0aCkgPj4gMFxuICAgICAgICBjaHVuayA9IEBjaHVua3NbY2h1bmtOb11cbiAgICAgICAgY2h1bmsuZHJhd0J1ZmZlckRpcnR5ID0gdHJ1ZVxuICAgICAgICB4ID0gdGlsZVggLSBjaHVuay50aWxlT2Zmc2V0WCAtIGNodW5rLndpZHRoICogY2h1bmtOb1xuICAgICAgICB5ID0gdGlsZVkgLSBjaHVuay50aWxlT2Zmc2V0WVxuICAgICAgICBjaHVuay50aWxlc1t4ICsgeSAqIGNodW5rLndpZHRoXSA9IHRpbGVcblxuXG4gICAgc2VyaWFsaXplOiAtPiAjIExheWVyOjpzZXJpYWxpemVcbiAgICAgICAgIyBEYXRhIGZvcm1hdDpcbiAgICAgICAgIyB7dHlwZX17bGVuZ3RofXtkYXRhfS4uLlxuICAgICAgICBkYXRhID0gJydcbiAgICAgICAgZm9yIGNodW5rIGluIEBjaHVua3NcbiAgICAgICAgICAgIGRhdGEgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjb3JlLkRBVEFfVFlQRVMuQ0hVTkspXG4gICAgICAgICAgICBjaHVua0RhdGEgPSBjaHVuay5zZXJpYWxpemUoKVxuICAgICAgICAgICAgZGF0YSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNodW5rRGF0YS5sZW5ndGgpICsgY2h1bmtEYXRhXG4gICAgICAgIHJldHVybiBkYXRhXG5cblxuICAgIGRlc2VyaWFsaXplOiAoZGF0YSkgLT4gIyBMYXllcjo6ZGVzZXJpYWxpemVcbiAgICAgICAgY2h1bmtPZmZzZXRYID0gMFxuICAgICAgICBAY2h1bmtzLmxlbmd0aCA9IDBcbiAgICAgICAgdCA9IGNvcmUuREFUQV9UWVBFU1xuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgZGF0YS5sZW5ndGhcbiAgICAgICAgICAgIGxlbmd0aCA9IGRhdGEuY2hhckNvZGVBdChpICsgMSlcbiAgICAgICAgICAgIHN3aXRjaCBkYXRhLmNoYXJDb2RlQXQoaSlcbiAgICAgICAgICAgICAgICB3aGVuIHQuQ0hVTktcbiAgICAgICAgICAgICAgICAgICAgI1RPRE86IFN0b3JlIGFuZCByZWFkIGNodW5rIG1ldGFkYXRhXG4gICAgICAgICAgICAgICAgICAgIG51bUNodW5rcyA9IEBjaHVua3MucHVzaCBuZXcgQ2h1bmsgdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAzMFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxN1xuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtPZmZzZXRYOiBjaHVua09mZnNldFhcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rT2Zmc2V0WTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgdGlsZU9mZnNldFg6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbGVPZmZzZXRZOiAxM1xuICAgICAgICAgICAgICAgICAgICBAY2h1bmtzW251bUNodW5rcyAtIDFdLmRlc2VyaWFsaXplKGRhdGEuc3Vic3RyKGkgKyAyLCBsZW5ndGgpKVxuICAgICAgICAgICAgICAgICAgICBjaHVua09mZnNldFggKz0gMzBcbiAgICAgICAgICAgIGkgKz0gMiArIGxlbmd0aFxuXG5cblxuY2xhc3MgQ2h1bmtcblxuICAgIGNvbnN0cnVjdG9yOiAobGF5ZXIsIGRhdGEpIC0+ICMgQ2h1bms6OmNvbnN0cnVjdG9yXG4gICAgICAgIEB0aWxlcyA9IFtdXG4gICAgICAgIGZvciBuYW1lLCBkYXR1bSBvZiBkYXRhXG4gICAgICAgICAgICB0aGlzW25hbWVdID0gZGF0dW1cblxuICAgICAgICBAbGF5ZXIgPSBsYXllclxuXG4gICAgICAgIEBkcmF3QnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnY2FudmFzJ1xuICAgICAgICBAZHJhd0J1ZmZlckN0eCA9IEBkcmF3QnVmZmVyLmdldENvbnRleHQgJzJkJ1xuICAgICAgICBAZHJhd0J1ZmZlckRpcnR5ID0gdHJ1ZVxuICAgICAgICBAZHJhd0J1ZmZlci53aWR0aCA9IEB3aWR0aCAqIGJhY2tncm91bmQudGlsZVNpemVcbiAgICAgICAgQGRyYXdCdWZmZXIuaGVpZ2h0ID0gKChAdGlsZXMubGVuZ3RoIC8gQHdpZHRoKSA+PiAwKSAqIGJhY2tncm91bmQudGlsZVNpemVcbiAgICAgICAgQHRpbGVPZmZzZXRYUHggPSBAdGlsZU9mZnNldFggKiBiYWNrZ3JvdW5kLnRpbGVTaXplXG5cblxuICAgIGRyYXc6IChwb3NYLCBwb3NZKSAtPiAjIENodW5rOjpkcmF3XG4gICAgICAgICMgRG9uJ3QgZHJhdyBjaHVua3Mgb3V0IG9mIHZpZXdcbiAgICAgICAgaWYgcG9zWCA8IC1AZHJhd0J1ZmZlci53aWR0aCBvciBwb3NYID4gY29yZS5jYW1XIG9yXG4gICAgICAgIHBvc1kgPCAtQGRyYXdCdWZmZXIuaGVpZ2h0IG9yIHBvc1kgPiBjb3JlLmNhbUhcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGlmIEBkcmF3QnVmZmVyRGlydHlcbiAgICAgICAgICAgICMgUmVkcmF3IGNodW5rXG4gICAgICAgICAgICBAZHJhd0J1ZmZlckN0eC5jbGVhclJlY3QoMCwgMCwgQGRyYXdCdWZmZXIud2lkdGgsIEBkcmF3QnVmZmVyLmhlaWdodClcbiAgICAgICAgICAgIGZvciBpIGluIFswLi5AdGlsZXMubGVuZ3RoXVxuICAgICAgICAgICAgICAgIHggPSBpICUgQHdpZHRoXG4gICAgICAgICAgICAgICAgeSA9ICgoaSAvIEB3aWR0aCkgPj4gMClcbiAgICAgICAgICAgICAgICBAZHJhd1RpbGUgQGRyYXdCdWZmZXJDdHgsXG4gICAgICAgICAgICAgICAgICAgIEB0aWxlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgeCAqIGJhY2tncm91bmQudGlsZVNpemUsXG4gICAgICAgICAgICAgICAgICAgICh5ICsgQGNodW5rT2Zmc2V0WSkgKiBiYWNrZ3JvdW5kLnRpbGVTaXplLFxuXG4gICAgICAgICAgICBAZHJhd0J1ZmZlckRpcnR5ID0gZmFsc2VcblxuICAgICAgICBjb3JlLmZyYW1lQnVmZmVyQ3R4LmRyYXdJbWFnZSBAZHJhd0J1ZmZlcixcbiAgICAgICAgICAgIDAsICMgU291cmNlIFhcbiAgICAgICAgICAgIDAsICMgU291cmNlIFlcbiAgICAgICAgICAgIEBkcmF3QnVmZmVyLndpZHRoLCAjIFNvdXJjZSB3aWR0aFxuICAgICAgICAgICAgQGRyYXdCdWZmZXIuaGVpZ2h0LCAjIFNvdXJjZSBoZWlnaHRcbiAgICAgICAgICAgIHBvc1gsICMgRGVzdGlvbmF0aW9uIFhcbiAgICAgICAgICAgIHBvc1ksICMgRGVzdGlvbmF0aW9uIFlcbiAgICAgICAgICAgIEBkcmF3QnVmZmVyLndpZHRoLCAjIERlc3RpbmF0aW9uIHdpZHRoXG4gICAgICAgICAgICBAZHJhd0J1ZmZlci5oZWlnaHQsICMgRGVzdGluYXRpb24gaGVpZ2h0XG5cblxuICAgIHJlZHJhdzogLT4gIyBDaHVuazo6cmVkcmF3XG4gICAgICAgIEBkcmF3QnVmZmVyRGlydHkgPSB0cnVlXG5cblxuICAgIGRyYXdUaWxlOiAoY3R4LCBzcHJpdGVOLCBwb3NYLCBwb3NZKSAtPiAjIENodW5rOjpkcmF3VGlsZVxuICAgICAgICBpZiBzcHJpdGVOID09IC0xIHRoZW4gcmV0dXJuXG4gICAgICAgIHRpbGVTaXplID0gYmFja2dyb3VuZC50aWxlU2l6ZVxuICAgICAgICBzcHJpdGVXaWR0aCA9IDE2XG4gICAgICAgIHNwcml0ZVggPSBzcHJpdGVOICUgc3ByaXRlV2lkdGggI1RPRE86IE1ha2UgU3ByaXRlIGNsYXNzIHdpdGggcHJvcGVydGllc1xuICAgICAgICBzcHJpdGVZID0gKHNwcml0ZU4gLyBzcHJpdGVXaWR0aCkgPj4gMCAjVE9ETzogTWFrZSBTcHJpdGUgY2xhc3Mgd2l0aCBwcm9wZXJ0aWVzXG5cbiAgICAgICAgY3R4LmRyYXdJbWFnZSBAbGF5ZXIuc3ByaXRlSW1nLFxuICAgICAgICAgICAgc3ByaXRlWCAqIHRpbGVTaXplLFxuICAgICAgICAgICAgc3ByaXRlWSAqIHRpbGVTaXplLFxuICAgICAgICAgICAgdGlsZVNpemUsICMgU291cmNlIHdpZHRoXG4gICAgICAgICAgICB0aWxlU2l6ZSwgIyBTb3VyY2UgaGVpZ2h0XG4gICAgICAgICAgICBwb3NYID4+IDAsXG4gICAgICAgICAgICBwb3NZID4+IDAsXG4gICAgICAgICAgICB0aWxlU2l6ZSwgIyBEZXN0aW5hdGlvbiB3aWR0aFxuICAgICAgICAgICAgdGlsZVNpemUsICMgRGVzdGluYXRpb24gaGVpZ2h0XG5cblxuICAgIHNlcmlhbGl6ZTogLT4gIyBDaHVuazo6c2VyaWFsaXplXG4gICAgICAgIGRhdGEgPSAnJ1xuICAgICAgICBmb3IgdGlsZSBpbiBAdGlsZXNcbiAgICAgICAgICAgIGRhdGEgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh0aWxlICsgMSkgIyArMSB0byBtYWtlIC0xIC0+IDAuIFdlIGNhbid0IHN0b3JlIG5lZ2F0aXZlIG51bWJlcnMuXG4gICAgICAgIHJldHVybiBkYXRhXG4gICAgICAgICNUT0RPOiBDb21wcmVzcyBjb25zZWN1dGl2ZSBpZGVudGljYWwgdGlsZXNcblxuXG4gICAgZGVzZXJpYWxpemU6IChkYXRhKSAtPiAjIENodW5rOjpkZXNlcmlhbGl6ZVxuICAgICAgICBAZHJhd0J1ZmZlckRpcnR5ID0gdHJ1ZVxuICAgICAgICBAdGlsZXMubGVuZ3RoID0gMFxuICAgICAgICBmb3IgaSBpbiBbMC4uZGF0YS5sZW5ndGhdXG4gICAgICAgICAgICBAdGlsZXMucHVzaCBkYXRhLmNoYXJDb2RlQXQoaSkgLSAxICAjIC0xIHRvIHJldmVyc2UgKzEgZnJvbSBDaHVuazo6c2VyaWFsaXplXG4gICAgICAgIEBkcmF3QnVmZmVyLmhlaWdodCA9ICgoQHRpbGVzLmxlbmd0aCAvIEB3aWR0aCkgPj4gMCkgKiBiYWNrZ3JvdW5kLnRpbGVTaXplXG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG5TaGFwZSA9IHJlcXVpcmUoJy4vU2hhcGUnKVxudXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpXG5jb3JlID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9jb3JlJylcbnZpZXcgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3ZpZXcnKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMaW5lIGV4dGVuZHMgU2hhcGVcblxuICAgIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT4gIyBTaGFwZTo6Y29uc3RydWN0b3JcbiAgICAgICAgZGVmYXVsdERhdGEgPVxuICAgICAgICAgICAgeDI6IDBcbiAgICAgICAgICAgIHkyOiAwXG4gICAgICAgIGRhdGEgPSB1dGlsLm1lcmdlKGRlZmF1bHREYXRhLCBkYXRhKVxuICAgICAgICBzdXBlcihkYXRhKVxuXG5cbiAgICBkcmF3OiAtPiAjIExpbmU6OmRyYXdcbiAgICAgICAgdW5sZXNzIHN1cGVyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgY29yZS5mcmFtZUJ1ZmZlckN0eC5iZWdpblBhdGgoKVxuICAgICAgICBjb3JlLmZyYW1lQnVmZmVyQ3R4Lm1vdmVUbyBAZHJhd1gsIEBkcmF3WVxuICAgICAgICBjb3JlLmZyYW1lQnVmZmVyQ3R4LmxpbmVUbyggdmlldy5wb3NUb1B4KEB4MiwgJ3gnKSwgdmlldy5wb3NUb1B4KEB5MiwgJ3knKSApXG4gICAgICAgIGNvcmUuZnJhbWVCdWZmZXJDdHguY2xvc2VQYXRoKClcbiAgICAgICAgY29yZS5mcmFtZUJ1ZmZlckN0eC5zdHJva2UoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxuQWN0b3IgPSByZXF1aXJlKCcuL0FjdG9yJylcbmNvbGxpc2lvbiA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29sbGlzaW9uJylcbmVudmlyb25tZW50ID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9lbnZpcm9ubWVudCcpXG5ldmVudCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZXZlbnQnKVxuaW8gPSByZXF1aXJlKCcuLi9tb2R1bGVzL2lvJylcbmxheWVycyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbGF5ZXJzJylcbnV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBBY3RvclxuXG4gICAgY29uc3RydWN0b3I6IChkYXRhKSAtPiAjIFBsYXllcjo6Y29uc3RydWN0b3JcbiAgICAgICAgc3VwZXJcblxuICAgICAgICBAYWNjWCA9IDBcbiAgICAgICAgQGRpclBoeXNpY2FsID0gMFxuICAgICAgICBAZGlyVmlzdWFsID0gMVxuICAgICAgICBAc3RhdGUgPSBuZXcgUGxheWVyU3RhdGVTdGFuZGluZyh0aGlzKVxuICAgICAgICBAc3RhdGVCZWZvcmUgPSBudWxsXG5cblxuICAgIHNldFN0YXRlOiAoc3RhdGUpIC0+ICMgUGxheWVyOjpzZXRTdGF0ZVxuICAgICAgICBpZiBAc3RhdGUgaW5zdGFuY2VvZiBzdGF0ZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIEBzdGF0ZUJlZm9yZSA9IEBzdGF0ZVxuICAgICAgICBAc3RhdGUgPSBuZXcgc3RhdGUodGhpcylcblxuXG4gICAgc3RhdGVJczogKHN0YXRlKSAtPiAjIFBsYXllcjo6c3RhdGVJc1xuICAgICAgICByZXR1cm4gQHN0YXRlIGluc3RhbmNlb2Ygc3RhdGVcblxuXG4gICAgaGFuZGxlSW5wdXQ6IChlKSAtPiAjIFBsYXllcjo6aGFuZGxlSW5wdXRcbiAgICAgICAgQHN0YXRlLmhhbmRsZUlucHV0KGUpXG5cblxuICAgIHVwZGF0ZTogKGN5Y2xlTGVuZ3RoKSAtPiAjIFBsYXllcjo6dXBkYXRlXG4gICAgICAgIEBzcGVlZFkgKz0gZW52aXJvbm1lbnQuZ3Jhdml0eSAqIGN5Y2xlTGVuZ3RoXG4gICAgICAgIEBzcGVlZFggKz0gQGFjY1ggKiBjeWNsZUxlbmd0aFxuICAgICAgICBAc3BlZWRYID0gTWF0aC5taW4oQHNwZWVkWCwgQHNwZWVkWE1heClcbiAgICAgICAgQHNwZWVkWCA9IE1hdGgubWF4KEBzcGVlZFgsIC1Ac3BlZWRYTWF4KVxuXG4gICAgICAgIHN1cGVyKGN5Y2xlTGVuZ3RoKVxuICAgICAgICBAc3RhdGUudXBkYXRlKGN5Y2xlTGVuZ3RoKVxuXG4gICAgICAgIGNvbGxpc2lvbnMgPSBjb2xsaXNpb24uYWN0b3JUb0xheWVyIHRoaXMsIGxheWVycy5nZXQoJ2dyb3VuZCcpLFxuICAgICAgICAgICAgcmVwb3NpdGlvbjogdHJ1ZVxuXG4gICAgICAgICMgVXBkYXRlIHBsYXllciBzdGF0ZVxuICAgICAgICBpZiBjb2xsaXNpb25zLmJvdHRvbVxuICAgICAgICAgICAgaWYgQGRpclBoeXNpY2FsID09IDBcbiAgICAgICAgICAgICAgICBAc2V0U3RhdGUgUGxheWVyU3RhdGVTdGFuZGluZ1xuICAgICAgICAgICAgICAgIEBkZWNlbGVyYXRlKCd4JywgY29sbGlzaW9ucy5mcmljdGlvbiAqIEBkZWNlbGVyYXRpb25Hcm91bmQgKiBjeWNsZUxlbmd0aClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2V0U3RhdGUgUGxheWVyU3RhdGVSdW5uaW5nXG4gICAgICAgIGVsc2UgaWYgbm90IEBzdGF0ZUlzIFBsYXllclN0YXRlSnVtcGluZ1xuICAgICAgICAgICAgQHNldFN0YXRlIFBsYXllclN0YXRlRmFsbGluZ1xuICAgICAgICAgICAgaWYgQGRpclBoeXNpY2FsID09IDBcbiAgICAgICAgICAgICAgICBAZGVjZWxlcmF0ZSgneCcsIEBkZWNlbGVyYXRpb25BaXIgKiBjeWNsZUxlbmd0aClcblxuXG5cbiMgUGxheWVyU3RhdGVcbiMgfFxuIyB8X19QbGF5ZXJTdGF0ZUFpclxuIyB8ICAgfF9fUGxheWVyU3RhdGVKdW1waW5nXG4jIHxcbiMgfF9fUGxheWVyU3RhdGVHcm91bmRcbiMgICAgIHxfX1BsYXllclN0YXRlU3RhbmRpbmdcbiMgICAgIHxfX1BsYXllclN0YXRlUnVubmluZ1xuXG5QbGF5ZXJTdGF0ZSA9XG5jbGFzcyBQbGF5ZXJTdGF0ZVxuXG4gICAgY29uc3RydWN0b3I6IChAcGFyZW50KSAtPiAjIFBsYXllclN0YXRlOjpjb25zdHJ1Y3RvclxuXG5cbiAgICBoYW5kbGVJbnB1dDogKGUpIC0+ICMgUGxheWVyU3RhdGU6OmhhbmRsZUlucHV0XG4gICAgICAgIGtleSA9IHV0aWwuS0VZX0NPREVTXG4gICAgICAgIHN3aXRjaCBlLmtleUNvZGVcblxuICAgICAgICAgICAgd2hlbiBrZXkuTEVGVFxuICAgICAgICAgICAgICAgIEBwYXJlbnQuZGlyUGh5c2ljYWwgPSAtMVxuICAgICAgICAgICAgICAgIEBwYXJlbnQuZGlyVmlzdWFsID0gLTFcblxuICAgICAgICAgICAgd2hlbiBrZXkuUklHSFRcbiAgICAgICAgICAgICAgICBAcGFyZW50LmRpclBoeXNpY2FsID0gMVxuICAgICAgICAgICAgICAgIEBwYXJlbnQuZGlyVmlzdWFsID0gMVxuXG5cbiAgICB1cGRhdGU6IChjeWNsZUxlbmd0aCkgLT4gIyBQbGF5ZXJTdGF0ZTo6dXBkYXRlXG5cblxuXG5QbGF5ZXJTdGF0ZUdyb3VuZCA9XG5jbGFzcyBQbGF5ZXJTdGF0ZUdyb3VuZCBleHRlbmRzIFBsYXllclN0YXRlXG5cbiAgICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+ICMgUGxheWVyU3RhdGVHcm91bmQ6OmNvbnN0cnVjdG9yXG4gICAgICAgIHN1cGVyKGRhdGEpXG5cblxuICAgIGhhbmRsZUlucHV0OiAoZSkgLT4gIyBQbGF5ZXJTdGF0ZUdyb3VuZDo6aGFuZGxlSW5wdXRcbiAgICAgICAgc3VwZXIoZSlcbiAgICAgICAga2V5ID0gdXRpbC5LRVlfQ09ERVNcblxuICAgICAgICBpZiBlLnR5cGUgaXMgJ2tleWRvd24nXG4gICAgICAgICAgICBzd2l0Y2ggZS5rZXlDb2RlXG4gICAgICAgICAgICAgICAgd2hlbiBrZXkuVVAsIGtleS5aXG4gICAgICAgICAgICAgICAgICAgIEBwYXJlbnQuc2V0U3RhdGUgUGxheWVyU3RhdGVKdW1waW5nXG5cblxuXG5QbGF5ZXJTdGF0ZVN0YW5kaW5nID1cbmNsYXNzIFBsYXllclN0YXRlU3RhbmRpbmcgZXh0ZW5kcyBQbGF5ZXJTdGF0ZUdyb3VuZFxuXG4gICAgY29uc3RydWN0b3I6IChkYXRhKSAtPiAjIFBsYXllclN0YXRlU3RhbmRpbmc6OmNvbnN0cnVjdG9yXG4gICAgICAgIHN1cGVyKGRhdGEpXG5cbiAgICAgICAgQHBhcmVudC5hY2NYID0gMFxuXG4gICAgICAgIGlmIEBwYXJlbnQuZGlyVmlzdWFsID4gMFxuICAgICAgICAgICAgQHBhcmVudC5zcHJpdGUuc2V0QW5pbWF0aW9uICdzdGFuZGluZ1JpZ2h0J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAcGFyZW50LnNwcml0ZS5zZXRBbmltYXRpb24gJ3N0YW5kaW5nTGVmdCdcblxuXG4gICAgaGFuZGxlSW5wdXQ6IChlKSAtPiAjIFBsYXllclN0YXRlU3RhbmRpbmc6OmhhbmRsZUlucHV0XG4gICAgICAgIHN1cGVyKGUpXG4gICAgICAgIGtleSA9IHV0aWwuS0VZX0NPREVTXG5cbiAgICAgICAgaWYgZS50eXBlIGlzICdrZXlkb3duJ1xuICAgICAgICAgICAgc3dpdGNoIGUua2V5Q29kZVxuICAgICAgICAgICAgICAgIHdoZW4ga2V5LkxFRlQsIGtleS5SSUdIVFxuICAgICAgICAgICAgICAgICAgICBAcGFyZW50LnNldFN0YXRlIFBsYXllclN0YXRlUnVubmluZ1xuXG5cblxuUGxheWVyU3RhdGVSdW5uaW5nID1cbmNsYXNzIFBsYXllclN0YXRlUnVubmluZyBleHRlbmRzIFBsYXllclN0YXRlR3JvdW5kXG5cbiAgICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+ICMgUGxheWVyU3RhdGVSdW5uaW5nOjpjb25zdHJ1Y3RvclxuICAgICAgICBzdXBlcihkYXRhKVxuICAgICAgICBAX3NldFNwZWVkQW5kQW5pbSgpXG5cbiAgICAgICAgaWYgQHBhcmVudC5zdGF0ZUJlZm9yZSBpbnN0YW5jZW9mIFBsYXllclN0YXRlQWlyXG4gICAgICAgICAgICBAcGFyZW50LnNwcml0ZS5nZXRDdXJyZW50QW5pbWF0aW9uKCkuanVtcFRvRnJhbWUoMSlcblxuXG4gICAgaGFuZGxlSW5wdXQ6IChlKSAtPiAjIFBsYXllclN0YXRlUnVubmluZzo6aGFuZGxlSW5wdXRcbiAgICAgICAgc3VwZXIoZSlcbiAgICAgICAga2V5ID0gdXRpbC5LRVlfQ09ERVNcblxuICAgICAgICBpZiBlLnR5cGUgaXMgJ2tleWRvd24nXG4gICAgICAgICAgICBzd2l0Y2ggZS5rZXlDb2RlXG4gICAgICAgICAgICAgICAgd2hlbiBrZXkuTEVGVCwga2V5LlJJR0hUXG4gICAgICAgICAgICAgICAgICAgIEBfc2V0U3BlZWRBbmRBbmltKClcblxuICAgICAgICBlbHNlIGlmIGUudHlwZSBpcyAna2V5dXAnXG4gICAgICAgICAgICBzd2l0Y2ggZS5rZXlDb2RlXG4gICAgICAgICAgICAgICAgd2hlbiBrZXkuTEVGVCwga2V5LlJJR0hUXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0UHJlc3NlZCA9IGlvLmlzS2V5UHJlc3NlZChrZXkuUklHSFQpXG4gICAgICAgICAgICAgICAgICAgIGxlZnRQcmVzc2VkID0gaW8uaXNLZXlQcmVzc2VkKGtleS5MRUZUKVxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgbGVmdFByZXNzZWQgYW5kIG5vdCByaWdodFByZXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwYXJlbnQuc2V0U3RhdGUgUGxheWVyU3RhdGVTdGFuZGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5kaXJQaHlzaWNhbCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwYXJlbnQuYWNjWCA9IDBcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBsZWZ0UHJlc3NlZCBhbmQgbm90IHJpZ2h0UHJlc3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5kaXJQaHlzaWNhbCA9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBAcGFyZW50LmRpclZpc3VhbCA9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBAX3NldFNwZWVkQW5kQW5pbSB7IGZyYW1lTnVtOiAxIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSAjIGlmIG5vdCBsZWZ0UHJlc3NlZCBhbmQgcmlnaHRQcmVzc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICBAcGFyZW50LmRpclBoeXNpY2FsID0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5kaXJWaXN1YWwgPSAxXG4gICAgICAgICAgICAgICAgICAgICAgICBAX3NldFNwZWVkQW5kQW5pbSB7IGZyYW1lTnVtOiAxIH1cblxuXG4gICAgX3NldFNwZWVkQW5kQW5pbTogKG9wdGlvbnMgPSB7fSktPiAjIFBsYXllclN0YXRlUnVubmluZzo6X3NldFNwZWVkQW5kQW5pbVxuICAgICAgICBAcGFyZW50LmFjY1ggPSBAcGFyZW50LmFjY2VsZXJhdGlvbkdyb3VuZCAqIEBwYXJlbnQuZGlyUGh5c2ljYWxcbiAgICAgICAgaWYgQHBhcmVudC5kaXJWaXN1YWwgPiAwXG4gICAgICAgICAgICBAcGFyZW50LnNwcml0ZS5zZXRBbmltYXRpb24gJ3J1bm5pbmdSaWdodCcsIG9wdGlvbnMuZnJhbWVOdW1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHBhcmVudC5zcHJpdGUuc2V0QW5pbWF0aW9uICdydW5uaW5nTGVmdCcsIG9wdGlvbnMuZnJhbWVOdW1cblxuXG5QbGF5ZXJTdGF0ZUFpciA9XG5jbGFzcyBQbGF5ZXJTdGF0ZUFpciBleHRlbmRzIFBsYXllclN0YXRlXG5cbiAgICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+ICMgUGxheWVyU3RhdGVBaXI6OmNvbnN0cnVjdG9yXG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgaWYgQHBhcmVudC5kaXJWaXN1YWwgPiAwXG4gICAgICAgICAgICBAcGFyZW50LnNwcml0ZS5zZXRBbmltYXRpb24gJ2p1bXBpbmdSaWdodCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHBhcmVudC5zcHJpdGUuc2V0QW5pbWF0aW9uICdqdW1waW5nTGVmdCdcblxuXG4gICAgaGFuZGxlSW5wdXQ6IChlKSAtPiAjIFBsYXllclN0YXRlQWlyOjpoYW5kbGVJbnB1dFxuICAgICAgICBzdXBlclxuICAgICAgICBrZXkgPSB1dGlsLktFWV9DT0RFU1xuXG4gICAgICAgIGlmIGUudHlwZSBpcyAna2V5ZG93bidcbiAgICAgICAgICAgIHN3aXRjaCBlLmtleUNvZGVcbiAgICAgICAgICAgICAgICB3aGVuIGtleS5MRUZULCBrZXkuUklHSFRcbiAgICAgICAgICAgICAgICAgICAgQF9zZXRTcGVlZEFuZEFuaW0oKVxuXG4gICAgICAgIGVsc2UgaWYgZS50eXBlIGlzICdrZXl1cCdcbiAgICAgICAgICAgIHN3aXRjaCBlLmtleUNvZGVcbiAgICAgICAgICAgICAgICB3aGVuIGtleS5MRUZULCBrZXkuUklHSFRcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRQcmVzc2VkID0gaW8uaXNLZXlQcmVzc2VkKGtleS5SSUdIVClcbiAgICAgICAgICAgICAgICAgICAgbGVmdFByZXNzZWQgPSBpby5pc0tleVByZXNzZWQoa2V5LkxFRlQpXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBsZWZ0UHJlc3NlZCBhbmQgbm90IHJpZ2h0UHJlc3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5kaXJQaHlzaWNhbCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwYXJlbnQuYWNjWCA9IDBcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBsZWZ0UHJlc3NlZCBhbmQgbm90IHJpZ2h0UHJlc3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5kaXJQaHlzaWNhbCA9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBAcGFyZW50LmRpclZpc3VhbCA9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBAX3NldFNwZWVkQW5kQW5pbSB7IGZyYW1lTnVtOiAxIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSAjIGlmIG5vdCBsZWZ0UHJlc3NlZCBhbmQgcmlnaHRQcmVzc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICBAcGFyZW50LmRpclBoeXNpY2FsID0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5kaXJWaXN1YWwgPSAxXG4gICAgICAgICAgICAgICAgICAgICAgICBAX3NldFNwZWVkQW5kQW5pbSB7IGZyYW1lTnVtOiAxIH1cblxuXG4gICAgX3NldFNwZWVkQW5kQW5pbTogLT4gIyBQbGF5ZXJTdGF0ZUFpcjo6X3NldFNwZWVkQW5kQW5pbVxuICAgICAgICBAcGFyZW50LmFjY1ggPSBAcGFyZW50LmFjY2VsZXJhdGlvbkFpciAqIEBwYXJlbnQuZGlyUGh5c2ljYWxcbiAgICAgICAgaWYgQHBhcmVudC5kaXJWaXN1YWwgPiAwXG4gICAgICAgICAgICBAcGFyZW50LnNwcml0ZS5zZXRBbmltYXRpb24gJ2p1bXBpbmdSaWdodCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHBhcmVudC5zcHJpdGUuc2V0QW5pbWF0aW9uICdqdW1waW5nTGVmdCdcblxuXG4gICAgdXBkYXRlOiAoY3ljbGVMZW5ndGgpIC0+ICMgUGxheWVyU3RhdGVBaXI6OnVwZGF0ZVxuICAgICAgICBzdXBlclxuXG5cblxuUGxheWVyU3RhdGVKdW1waW5nID1cbmNsYXNzIFBsYXllclN0YXRlSnVtcGluZyBleHRlbmRzIFBsYXllclN0YXRlQWlyXG5cbiAgICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+ICMgUGxheWVyU3RhdGVKdW1waW5nOjpjb25zdHJ1Y3RvclxuICAgICAgICBzdXBlclxuICAgICAgICBAcGFyZW50LnNwZWVkWSA9IC0yMVxuXG5cbiAgICBoYW5kbGVJbnB1dDogKGUpIC0+ICMgUGxheWVyU3RhdGVKdW1waW5nOjpoYW5kbGVJbnB1dFxuICAgICAgICBzdXBlclxuICAgICAgICBrZXkgPSB1dGlsLktFWV9DT0RFU1xuXG4gICAgICAgIGlmIGUudHlwZSBpcyAna2V5dXAnXG4gICAgICAgICAgICBzd2l0Y2ggZS5rZXlDb2RlXG4gICAgICAgICAgICAgICAgd2hlbiBrZXkuVVAsIGtleS5aXG4gICAgICAgICAgICAgICAgICAgIEBwYXJlbnQuc3BlZWRZICo9IDAuNVxuICAgICAgICAgICAgICAgICAgICBAcGFyZW50LnNldFN0YXRlIFBsYXllclN0YXRlRmFsbGluZ1xuXG5cbiAgICB1cGRhdGU6IChjeWNsZUxlbmd0aCkgLT4gIyBQbGF5ZXJTdGF0ZUp1bXBpbmc6OnVwZGF0ZVxuICAgICAgICBpZiBAcGFyZW50LnNwZWVkWSA+PSAwXG4gICAgICAgICAgICBAcGFyZW50LnNldFN0YXRlIFBsYXllclN0YXRlRmFsbGluZ1xuXG5cblxuUGxheWVyU3RhdGVGYWxsaW5nID1cbmNsYXNzIFBsYXllclN0YXRlRmFsbGluZyBleHRlbmRzIFBsYXllclN0YXRlQWlyXG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG5TaGFwZSA9IHJlcXVpcmUoJy4vU2hhcGUnKVxuY29yZSA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29yZScpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFJlY3QgZXh0ZW5kcyBTaGFwZVxuXG4gICAgZHJhdzogLT4gIyBSZWN0OjpkcmF3XG4gICAgICAgIHVubGVzcyBzdXBlclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIGNvcmUuZnJhbWVCdWZmZXJDdHguZmlsbFJlY3QgQGRyYXdYLCBAZHJhd1ksIEBkcmF3VywgQGRyYXdIXG4gICAgICAgIHJldHVybiB0cnVlIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxuY29yZSA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29yZScpXG5iYWNrZ3JvdW5kID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9iYWNrZ3JvdW5kJylcbnV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKVxudmlldyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdmlldycpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNoYXBlXG5cbiAgICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+ICMgU2hhcGU6OmNvbnN0cnVjdG9yXG4gICAgICAgIGRlZmF1bHREYXRhID1cbiAgICAgICAgICAgIGZpbGxTdHlsZTogJ3JnYmEoMjU1LDAsMCwwLjQpJ1xuICAgICAgICAgICAgc3Ryb2tlU3R5bGU6ICdyZ2JhKDI1NSwwLDAsMC43KSdcbiAgICAgICAgICAgIGg6IDFcbiAgICAgICAgICAgIHc6IDFcbiAgICAgICAgICAgIHg6IDBcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgZGF0YSA9IHV0aWwubWVyZ2UoZGVmYXVsdERhdGEsIGRhdGEpXG4gICAgICAgIGZvciBuYW1lLCB2YWwgb2YgZGF0YVxuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHZhbFxuXG4gICAgICAgIGNvcmUuc2hhcGVzLnB1c2ggdGhpc1xuXG5cbiAgICBkcmF3OiAtPiAjIFNoYXBlOjpkcmF3XG4gICAgICAgIGlmIG5vdCBAaXNWaXNpYmxlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICBAZHJhd1ggPSB2aWV3LnBvc1RvUHgoQHgsICd4JylcbiAgICAgICAgQGRyYXdZID0gdmlldy5wb3NUb1B4KEB5LCAneScpXG4gICAgICAgIEBkcmF3VyA9IEB3ICogYmFja2dyb3VuZC50aWxlU2l6ZVxuICAgICAgICBAZHJhd0ggPSBAaCAqIGJhY2tncm91bmQudGlsZVNpemVcbiAgICAgICAgY29yZS5mcmFtZUJ1ZmZlckN0eC5maWxsU3R5bGUgPSBAZmlsbFN0eWxlXG4gICAgICAgIGNvcmUuZnJhbWVCdWZmZXJDdHguc3Ryb2tlU3R5bGUgPSBAc3Ryb2tlU3R5bGVcbiAgICAgICAgIyBTaGFwZSBzcGVjaWZpYyBkcmF3aW5nIGluIHN1YmNsYXNzIChlLmcuIFJlY3QpXG4gICAgICAgIHJldHVybiB0cnVlXG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG5BbmltYXRpb24gPSByZXF1aXJlKCcuL0FuaW1hdGlvbicpXG5jb3JlID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9jb3JlJylcbnZpZXcgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3ZpZXcnKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTcHJpdGVcblxuICAgIGNvbnN0cnVjdG9yOiAocGF0aCkgLT4gIyBTcHJpdGU6OmNvbnN0cnVjdG9yXG4gICAgICAgIEBzcHJpdGVzaGVldCA9IHBhdGhcbiAgICAgICAgQHNwcml0ZUltZyA9IEBnZXRJbWcocGF0aClcbiAgICAgICAgQGFuaW1hdGlvbnMgPSB7fVxuICAgICAgICBAY3VycmVudEFuaW1hdGlvbiA9IG51bGxcblxuXG4gICAgYWRkQW5pbWF0aW9uOiAoYW5pbWF0aW9uRGF0YSkgLT4gIyBTcHJpdGU6OmFkZEFuaW1hdGlvblxuICAgICAgICB1bmxlc3MgYW5pbWF0aW9uRGF0YVxuICAgICAgICAgICAgdGhyb3cgJ1Nwcml0ZTo6YWRkQW5pbWF0aW9uIC0gTWlzc2luZyBhbmltYXRpb25EYXRhJ1xuXG4gICAgICAgIHVubGVzcyBhbmltYXRpb25EYXRhLm5hbWVcbiAgICAgICAgICAgIHRocm93ICdTcHJpdGU6OmFkZEFuaW1hdGlvbiAtIE1pc3NpbmcgYW5pbWF0aW9uRGF0YS5uYW1lJ1xuXG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0ICFAYW5pbWF0aW9uc1thbmltYXRpb25EYXRhLm5hbWVdICNEZWJ1Z1xuICAgICAgICBAYW5pbWF0aW9uc1thbmltYXRpb25EYXRhLm5hbWVdID0gbmV3IEFuaW1hdGlvbiB0aGlzLCBhbmltYXRpb25EYXRhXG5cblxuICAgIHNldEFuaW1hdGlvbjogKGFuaW1OYW1lLCBmcmFtZU51bSA9IDApIC0+ICMgU3ByaXRlOjpzZXRBbmltYXRpb25cbiAgICAgICAgQGN1cnJlbnRBbmltYXRpb24gPSBhbmltTmFtZVxuICAgICAgICBAYW5pbWF0aW9uc1tAY3VycmVudEFuaW1hdGlvbl0uanVtcFRvRnJhbWUoZnJhbWVOdW0pXG5cblxuICAgIGFkdmFuY2VBbmltYXRpb246IChjeWNsZUxlbmd0aCkgLT4gIyBTcHJpdGU6OmFkdmFuY2VBbmltYXRpb25cbiAgICAgICAgQGFuaW1hdGlvbnNbQGN1cnJlbnRBbmltYXRpb25dLmFkdmFuY2UoY3ljbGVMZW5ndGgpXG5cblxuICAgIGdldEN1cnJlbnRBbmltYXRpb246IC0+XG4gICAgICAgIHJldHVybiBAYW5pbWF0aW9uc1tAY3VycmVudEFuaW1hdGlvbl1cblxuXG4gICAgZHJhdzogKHgsIHkpIC0+ICMgU3ByaXRlOjpkcmF3XG4gICAgICAgIGZyYW1lID0gQGFuaW1hdGlvbnNbQGN1cnJlbnRBbmltYXRpb25dLmdldEN1cnJlbnRGcmFtZSgpXG4gICAgICAgIGZyYW1lRGF0YSA9IGZyYW1lLmRhdGFcbiAgICAgICAgY29yZS5mcmFtZUJ1ZmZlckN0eC5kcmF3SW1hZ2UgQHNwcml0ZUltZyxcbiAgICAgICAgICAgIGZyYW1lRGF0YVswXSwgIyBTb3VyY2UgeFxuICAgICAgICAgICAgZnJhbWVEYXRhWzFdLCAjIFNvdXJjZSB5XG4gICAgICAgICAgICBmcmFtZURhdGFbMl0sICMgU291cmNlIHdpZHRoXG4gICAgICAgICAgICBmcmFtZURhdGFbM10sICMgU291cmNlIGhlaWdodFxuICAgICAgICAgICAgdmlldy5wb3NUb1B4KHgsICd4JykgKyBmcmFtZURhdGFbNF0sICMgUG9zaXRpb24gKyBmcmFtZSBvZmZzZXQgWFxuICAgICAgICAgICAgdmlldy5wb3NUb1B4KHksICd5JykgKyBmcmFtZURhdGFbNV0sICMgUG9zaXRpb24gKyBmcmFtZSBvZmZzZXQgWVxuICAgICAgICAgICAgZnJhbWVEYXRhWzJdLCAjIERlc3RpbmF0aW9uIHdpZHRoXG4gICAgICAgICAgICBmcmFtZURhdGFbM10sICMgRGVzdGluYXRpb24gaGVpZ2h0XG5cblxuICAgIGdldEltZzogLT4gIyBTcHJpdGU6OmdldEltZ1xuICAgICAgICBwYXRoID0gQHNwcml0ZXNoZWV0XG4gICAgICAgIGlmIF9pbWcgPSBAX2ltZ1twYXRoXVxuICAgICAgICAgICAgcmV0dXJuIF9pbWdbcGF0aF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgX2ltZ09iaiA9IEBfaW1nW3BhdGhdID0gbmV3IEltYWdlKClcbiAgICAgICAgICAgIF9pbWdPYmouc3JjID0gY29yZS5pbWdQYXRoICsgcGF0aFxuICAgICAgICAgICAgcmV0dXJuIF9pbWdPYmpcblxuICAgIF9pbWc6IHt9ICMgU2hhcmVkIGhhc2htYXAgb2YgaW1hZ2Ugb2JqZWN0cyB3aXRoIHRoZSBzcHJpdGUgcGF0aCBhcyBrZXlcbiIsIiMjIyBDb3B5cmlnaHQgKGMpIDIwMTQgTWFnbnVzIExlby4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gIyMjXG5cbmNvcmUgPSByZXF1aXJlKCcuL21vZHVsZXMvY29yZScpXG5ldmVudCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9ldmVudCcpXG5MYXllciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9MYXllcicpXG5sYXllcnMgPSByZXF1aXJlKCcuL21vZHVsZXMvbGF5ZXJzJylcblBsYXllciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9QbGF5ZXInKVxuU3ByaXRlID0gcmVxdWlyZSgnLi9jbGFzc2VzL1Nwcml0ZScpXG51dGlsID0gcmVxdWlyZSgnLi9tb2R1bGVzL3V0aWwnKVxudmlldyA9IHJlcXVpcmUoJy4vbW9kdWxlcy92aWV3JylcblxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbG9hZCcsIC0+XG4gICAgY29yZS5pbml0KClcblxuXG4gICAgIyBFdmVudHNcblxuICAgIGV2ZW50LmtleWRvd24gPSAoZSkgLT5cbiAgICAgICAga2V5ID0gdXRpbC5LRVlfQ09ERVNcbiAgICAgICAgc3dpdGNoIGUua2V5Q29kZVxuICAgICAgICAgICAgd2hlbiBrZXkuUlxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHBsYXllci5oYW5kbGVJbnB1dChlKVxuXG4gICAgZXZlbnQua2V5dXAgPSAoZSkgLT5cbiAgICAgICAgcGxheWVyLmhhbmRsZUlucHV0KGUpXG5cblxuICAgICMgUGxheWVyXG5cbiAgICBwbGF5ZXJTcHJpdGUgPSBuZXcgU3ByaXRlKCdzcHJpdGUtb2xsZS5wbmcnKVxuXG4gICAgcGxheWVyU3ByaXRlLmFkZEFuaW1hdGlvblxuICAgICAgICBuYW1lOiAnanVtcGluZ0xlZnQnXG4gICAgICAgIGZyYW1lczogW1xuICAgICAgICAgICAge3g6MTksIHk6MzMsIHc6MzAsIGg6MzIsIG9mZnNldFg6LTQsIG9mZnNldFk6MCwgZHVyYXRpb246MC4xOTJ9XG4gICAgICAgIF1cbiAgICAgICAgaXNMb29waW5nOiBmYWxzZVxuXG4gICAgcGxheWVyU3ByaXRlLmFkZEFuaW1hdGlvblxuICAgICAgICBuYW1lOiAnanVtcGluZ1JpZ2h0J1xuICAgICAgICBmcmFtZXM6IFtcbiAgICAgICAgICAgIHt4OjE5LCB5OjAsIHc6MzAsIGg6MzIsIG9mZnNldFg6LTgsIG9mZnNldFk6MCwgZHVyYXRpb246MC4xOTJ9XG4gICAgICAgIF1cbiAgICAgICAgaXNMb29waW5nOiBmYWxzZVxuXG4gICAgcGxheWVyU3ByaXRlLmFkZEFuaW1hdGlvblxuICAgICAgICBuYW1lOiAncnVubmluZ0xlZnQnXG4gICAgICAgIGZyYW1lczogW1xuICAgICAgICAgICAge3g6MTksIHk6MzMsIHc6MzAsIGg6MzIsIG9mZnNldFg6LTYsIG9mZnNldFk6LTEsIGR1cmF0aW9uOjAuMTh9XG4gICAgICAgICAgICB7eDo0OSwgeTozMywgdzoxMywgaDozMiwgb2Zmc2V0WDoxLCBvZmZzZXRZOjAsIGR1cmF0aW9uOjAuMTN9XG4gICAgICAgICAgICB7eDo2MiwgeTozMywgdzoyMywgaDozMiwgb2Zmc2V0WDotNCwgb2Zmc2V0WTotMSwgZHVyYXRpb246MC4xOH1cbiAgICAgICAgICAgIHt4OjQ5LCB5OjMzLCB3OjEzLCBoOjMyLCBvZmZzZXRYOjEsIG9mZnNldFk6MCwgZHVyYXRpb246MC4xM31cbiAgICAgICAgXVxuICAgICAgICBpc0xvb3Bpbmc6IHRydWVcblxuICAgIHBsYXllclNwcml0ZS5hZGRBbmltYXRpb25cbiAgICAgICAgbmFtZTogJ3J1bm5pbmdSaWdodCdcbiAgICAgICAgZnJhbWVzOiBbXG4gICAgICAgICAgICB7eDoxOSwgeTowLCB3OjMwLCBoOjMyLCBvZmZzZXRYOi05LCBvZmZzZXRZOi0xLCBkdXJhdGlvbjowLjE4fVxuICAgICAgICAgICAge3g6NDksIHk6MCwgdzoxMywgaDozMiwgb2Zmc2V0WDoxLCBvZmZzZXRZOjAsIGR1cmF0aW9uOjAuMTN9XG4gICAgICAgICAgICB7eDo2MiwgeTowLCB3OjIzLCBoOjMyLCBvZmZzZXRYOi00LCBvZmZzZXRZOi0xLCBkdXJhdGlvbjowLjE4fVxuICAgICAgICAgICAge3g6NDksIHk6MCwgdzoxMywgaDozMiwgb2Zmc2V0WDoxLCBvZmZzZXRZOjAsIGR1cmF0aW9uOjAuMTN9XG4gICAgICAgIF1cbiAgICAgICAgaXNMb29waW5nOiB0cnVlXG5cbiAgICBwbGF5ZXJTcHJpdGUuYWRkQW5pbWF0aW9uXG4gICAgICAgIG5hbWU6ICdzdGFuZGluZ0xlZnQnXG4gICAgICAgIGZyYW1lczogW1xuICAgICAgICAgICAge3g6MCwgeTozMywgdzoxOSwgaDozMiwgb2Zmc2V0WDoxLCBvZmZzZXRZOjAsIGR1cmF0aW9uOjF9XG4gICAgICAgIF1cbiAgICAgICAgaXNMb29waW5nOiBmYWxzZVxuXG4gICAgcGxheWVyU3ByaXRlLmFkZEFuaW1hdGlvblxuICAgICAgICBuYW1lOiAnc3RhbmRpbmdSaWdodCdcbiAgICAgICAgZnJhbWVzOiBbXG4gICAgICAgICAgICB7eDowLCB5OjAsIHc6MTksIGg6MzIsIG9mZnNldFg6LTEsIG9mZnNldFk6MCwgZHVyYXRpb246MX1cbiAgICAgICAgXVxuICAgICAgICBpc0xvb3Bpbmc6IGZhbHNlXG5cbiAgICBwbGF5ZXIgPSBuZXcgUGxheWVyXG4gICAgICAgIHNwcml0ZTogcGxheWVyU3ByaXRlXG4gICAgICAgIHBvc1g6IDZcbiAgICAgICAgcG9zWTogNlxuICAgICAgICBjb2xXOiAxXG4gICAgICAgIGNvbEg6IDJcbiAgICAgICAgc3BlZWRYTWF4OiA5XG4gICAgICAgIGFjY2VsZXJhdGlvbkFpcjogOTAwXG4gICAgICAgIGRlY2VsZXJhdGlvbkFpcjogOTAwXG4gICAgICAgIGFjY2VsZXJhdGlvbkdyb3VuZDogOTAwXG4gICAgICAgIGRlY2VsZXJhdGlvbkdyb3VuZDogOTAwXG5cblxuICAgICMgQ2FtZXJhXG5cbiAgICBjb3JlLmN5Y2xlQ2FsbGJhY2sgPSAtPlxuICAgICAgICB2aWV3LmNhbWVyYVBvc1ggPSBwbGF5ZXIucG9zWCAtIDE1XG5cblxuICAgICMgQmFja2dyb3VuZFxuXG4gICAgbGF5ZXJzLmFkZCBuZXcgTGF5ZXJcbiAgICAgICAgaWQ6ICdtb3VudGFpbnMnXG4gICAgICAgIHNwcml0ZXNoZWV0OiAnc3ByaXRlLWJhY2tncm91bmQucG5nJ1xuICAgICAgICBpc0xvb3Bpbmc6IHRydWVcbiAgICAgICAgcGFyYWxsYXg6IDAuNVxuICAgICAgICBjaHVua3M6IFtcbiAgICAgICAgICAgIGNodW5rT2Zmc2V0WDogMFxuICAgICAgICAgICAgY2h1bmtPZmZzZXRZOiAwXG4gICAgICAgICAgICBjb2xCb3hlczogW11cbiAgICAgICAgICAgIHRpbGVPZmZzZXRYOiAwXG4gICAgICAgICAgICB0aWxlT2Zmc2V0WTogMTBcbiAgICAgICAgICAgIHRpbGVzOiBbLTEsNSw2LC0xLC0xLC0xLC0xLC0xLC0xLC0xLDIwLDIxLDIyLDIzLC0xLC0xLC0xLDI3LDI4LC0xLDM2LDM3LDM4LDM5LDQwLC0xLDQyLDQzLDQ0LDQ1LDUyLDUzLDU0LDU1LDU2LDU3LDU4LDU5LDYwLDYxLDY4LDY5LDcwLDcxLDcyLDczLDc0LDc1LDc2LDc3LDY4LDY4LDY4LDY4LDY4LDY4LDY4LDY4LDY4LDY4LDcsOCw5LDEwLDExLDcsOCw5LDEwLDExXVxuICAgICAgICAgICAgd2lkdGg6IDEwXG4gICAgICAgIF1cblxuICAgIGxheWVycy5hZGQgbmV3IExheWVyXG4gICAgICAgIGlkOiAnY2xvdWQgMSdcbiAgICAgICAgc3ByaXRlc2hlZXQ6ICdzcHJpdGUtYmFja2dyb3VuZC5wbmcnXG4gICAgICAgIGlzTG9vcGluZzogdHJ1ZVxuICAgICAgICBwYXJhbGxheDogMC4yMVxuICAgICAgICBjaHVua3M6IFtcbiAgICAgICAgICAgIGNodW5rT2Zmc2V0WDogNTBcbiAgICAgICAgICAgIGNodW5rT2Zmc2V0WTogMFxuICAgICAgICAgICAgY29sQm94ZXM6IFtdXG4gICAgICAgICAgICB0aWxlT2Zmc2V0WDogMzBcbiAgICAgICAgICAgIHRpbGVPZmZzZXRZOiAzXG4gICAgICAgICAgICB0aWxlczogWzAsMSwyLDMsMTYsMTcsMTgsMTldXG4gICAgICAgICAgICB3aWR0aDogNFxuICAgICAgICBdXG5cbiAgICBsYXllcnMuYWRkIG5ldyBMYXllclxuICAgICAgICBpZDogJ2Nsb3VkIDInXG4gICAgICAgIHNwcml0ZXNoZWV0OiAnc3ByaXRlLWJhY2tncm91bmQucG5nJ1xuICAgICAgICBpc0xvb3Bpbmc6IHRydWVcbiAgICAgICAgcGFyYWxsYXg6IDAuMlxuICAgICAgICBjaHVua3M6IFtcbiAgICAgICAgICAgIGNodW5rT2Zmc2V0WDogMFxuICAgICAgICAgICAgY2h1bmtPZmZzZXRZOiAwXG4gICAgICAgICAgICBjb2xCb3hlczogW11cbiAgICAgICAgICAgIHRpbGVPZmZzZXRYOiAyOVxuICAgICAgICAgICAgdGlsZU9mZnNldFk6IDVcbiAgICAgICAgICAgIHRpbGVzOiBbMCwxLDIsMywxNiwxNywxOCwxOV1cbiAgICAgICAgICAgIHdpZHRoOiA0XG4gICAgICAgIF1cblxuXG4gICAgIyBHcm91bmRcblxuICAgIGxheWVycy5hZGQgbmV3IExheWVyXG4gICAgICAgIGlkOiAnZ3JvdW5kJ1xuICAgICAgICBzcHJpdGVzaGVldDogJ3Nwcml0ZS1iYWNrZ3JvdW5kLnBuZydcbiAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICBjaHVua09mZnNldFg6IDBcbiAgICAgICAgICAgIGNodW5rT2Zmc2V0WTogMFxuICAgICAgICAgICAgY29sQm94ZXM6IFtdXG4gICAgICAgICAgICB0aWxlT2Zmc2V0WDogMFxuICAgICAgICAgICAgdGlsZU9mZnNldFk6IDEzXG4gICAgICAgICAgICB0aWxlczogWy0xLC0xLC0xLDQsLTEsLTEsLTEsLTEsLTEsLTEsLTEsMzIsMzQsMzMsMzUsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsMzIsMzMsMzQsMzMsMzUsLTEsLTEsLTEsLTEsLTEsLTEsLTEsNDgsNTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsMzIsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzUsNDgsNDksNTAsNDksNTAsMzMsMzQsMzUsLTEsLTEsLTEsLTEsNDgsNTEsLTEsLTEsLTEsLTEsMzIsMzMsMzQsNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTEsNDgsNDksNTAsNDksNTAsNDksNTAsNDksMzQsMzMsMzQsMzMsNTAsNDksMzQsMzMsMzQsMzMsNTAsNDksNTAsNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTFdXG4gICAgICAgICAgICB3aWR0aDogMzBcbiAgICAgICAgLFxuICAgICAgICAgICAgY2h1bmtPZmZzZXRYOiAzMFxuICAgICAgICAgICAgY2h1bmtPZmZzZXRZOiAwXG4gICAgICAgICAgICBjb2xCb3hlczogW11cbiAgICAgICAgICAgIHRpbGVPZmZzZXRYOiAwXG4gICAgICAgICAgICB0aWxlT2Zmc2V0WTogMTNcbiAgICAgICAgICAgIHRpbGVzOiBbLTEsLTEsLTEsNCwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwtMSwzMiwzNCwzMywzNCwzMywzNCwzMywzNCwzMywzNCwzMywzNCwzMywzNCwzMywzNCwzMywzNCwzMywzNCwzMywzNCwzMywzNCwzMywzNCwzMywzNCwzMywzNSw0OCw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MSw0OCw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MCw0OSw1MV1cbiAgICAgICAgICAgIHdpZHRoOiAzMFxuICAgICAgICBdXG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhY2tncm91bmQgPVxuICAgIHRpbGVTaXplOiAxNlxuICAgIGNvbG9yOiAnIzZlYzBmZidcbiIsIiMjIyBDb3B5cmlnaHQgKGMpIDIwMTUgTWFnbnVzIExlby4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gIyMjXG5cbmNvbGxpc2lvbiA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IGNvbGxpc2lvblxuXG5MaW5lID0gcmVxdWlyZSgnLi4vY2xhc3Nlcy9MaW5lJylcblJlY3QgPSByZXF1aXJlKCcuLi9jbGFzc2VzL1JlY3QnKVxudXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG52aWV3ID0gcmVxdWlyZSgnLi92aWV3JylcblxuY29sbGlzaW9uLmFjdG9yVG9MYXllciA9IChhY3RvciwgbGF5ZXIsIG9wdGlvbnMpIC0+XG4gICAgbyA9XG4gICAgICAgIHJlcG9zaXRpb246IGZhbHNlXG4gICAgbyA9IHV0aWwubWVyZ2Uobywgb3B0aW9ucylcblxuICAgIGNvbGxpc2lvbnMgPVxuICAgICAgICBhbnk6IGZhbHNlXG4gICAgICAgIGJvdHRvbTogZmFsc2VcbiAgICAgICAgdG9wOiBmYWxzZVxuICAgICAgICBsZWZ0OiBmYWxzZVxuICAgICAgICByaWdodDogZmFsc2VcbiAgICAgICAgZnJpY3Rpb246IDEuMCAjVE9ETzogR2V0IGRhdGEgZnJvbSBjb2xsaWRpbmcgdGlsZXNcblxuICAgIG5ld1Bvc1ggPSBhY3Rvci5wb3NYXG4gICAgbmV3UG9zWSA9IGFjdG9yLnBvc1lcbiAgICBuZXdTcGVlZFggPSBhY3Rvci5zcGVlZFhcbiAgICBuZXdTcGVlZFkgPSBhY3Rvci5zcGVlZFlcblxuICAgIHN0YXJ0WCA9IGFjdG9yLnBvc1ggPj4gMFxuICAgIGVuZFggICA9IChhY3Rvci5wb3NYICsgYWN0b3IuY29sVykgPj4gMFxuICAgIHN0YXJ0WSA9IGFjdG9yLnBvc1kgPj4gMFxuICAgIGVuZFkgICA9IChhY3Rvci5wb3NZICsgYWN0b3IuY29sSCkgPj4gMFxuXG4gICAgIyBDaGVjayBpZiBvdmVybGFwcGluZyB0aWxlcyBhcmUgY29sbGlkYWJsZVxuICAgIGZvciB5IGluIFtzdGFydFkuLmVuZFldXG4gICAgICAgIGZvciB4IGluIFtzdGFydFguLmVuZFhdXG4gICAgICAgICAgICB0aWxlID0gbGF5ZXIuZ2V0VGlsZSh4LCB5KVxuICAgICAgICAgICAgaWYgdGlsZSA+IC0xXG4gICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgKy0tLS0rICBBY3RvciBtb3ZlcyBmcm9tIEExIHRvIEEyXG4gICAgICAgICAgICAgICAgfCBBMSB8ICBhbmQgY29sbGlkZXMgd2l0aCBiYWNrZ3JvdW5kIHRpbGUgQmcuXG4gICAgICAgICAgICAgICAgfCAgICB8ICBBY3RvciBtb3ZlcyB3aXRoIHZlY3RvciAoc3BlZWRYLCBzcGVlZFkpXG4gICAgICAgICAgICAgICAgKy0tLS0rXG4gICAgICAgICAgICAgICAgICAgICArLS0tLSsgIFRoZSBhbmdsZSBiZXR3ZWVuIEFjQmMgYW5kIHRoZSBtb3ZlbWVudCB2ZWN0b3IgZGV0ZXJtaW5lc1xuICAgICAgICAgICAgICAgICAgICAgfCBBMiB8ICBpZiBpdCBpcyBhIGhvcml6b250YWwgb3IgdmVydGljYWwgY29sbGlzaW9uLlxuICAgICAgICAgICAgICAgICAgICAgfCAgQmMtLS0tLStcbiAgICAgICAgICAgICAgICAgICAgICstLXwtQWMgICB8XG4gICAgICAgICAgICAgICAgICAgICAgICB8ICBCZyAgfFxuICAgICAgICAgICAgICAgICAgICAgICAgKy0tLS0tLStcbiAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICBpZiBhY3Rvci5zcGVlZFggPT0gMFxuICAgICAgICAgICAgICAgICAgICBpc0hvcml6b250YWxDb2xsaXNpb24gPSBmYWxzZVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgYWN0b3Iuc3BlZWRZID09IDBcbiAgICAgICAgICAgICAgICAgICAgaXNIb3Jpem9udGFsQ29sbGlzaW9uID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgIyBHZXQgYWN0b3IncyBmb3JlbW9zdCBjb3JuZXIgaW4gdGhlIG1vdmVtZW50IHZlY3RvclxuICAgICAgICAgICAgICAgICAgICAjIGFuZCB0aGUgYmFja2dyb3VuZHMgb3Bwb3NpbmcgY29ybmVyXG4gICAgICAgICAgICAgICAgICAgIGEyQ29ybmVyID0ge31cbiAgICAgICAgICAgICAgICAgICAgYmdDb3JuZXIgPSB7fVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIGFjdG9yLnNwZWVkWCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGEyQ29ybmVyLnggPSBhY3Rvci5wb3NYICsgYWN0b3IuY29sV1xuICAgICAgICAgICAgICAgICAgICAgICAgYmdDb3JuZXIueCA9IHhcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYTJDb3JuZXIueCA9IGFjdG9yLnBvc1hcbiAgICAgICAgICAgICAgICAgICAgICAgIGJnQ29ybmVyLnggPSB4ICsgMVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIGFjdG9yLnNwZWVkWSA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGEyQ29ybmVyLnkgPSBhY3Rvci5wb3NZICsgYWN0b3IuY29sSFxuICAgICAgICAgICAgICAgICAgICAgICAgYmdDb3JuZXIueSA9IHlcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYTJDb3JuZXIueSA9IGFjdG9yLnBvc1lcbiAgICAgICAgICAgICAgICAgICAgICAgIGJnQ29ybmVyLnkgPSB5ICsgMVxuXG4gICAgICAgICAgICAgICAgICAgICMgRGV0ZXJtaW5lIGJ5IHRoZSBhbmdsZSBpZiBpdCBpcyBhIGhvcml6b250YWwgb3IgdmVydGljYWwgY29sbGlzaW9uXG4gICAgICAgICAgICAgICAgICAgIG1vdkFuZyA9IE1hdGguYWJzKGFjdG9yLnNwZWVkWSAvIGFjdG9yLnNwZWVkWClcbiAgICAgICAgICAgICAgICAgICAgY29sQW5nID0gTWF0aC5hYnMoKGEyQ29ybmVyLnkgLSBiZ0Nvcm5lci55KSAvIChhMkNvcm5lci54IC0gYmdDb3JuZXIueCkpXG4gICAgICAgICAgICAgICAgICAgIGlmIG1vdkFuZyAtIGNvbEFuZyA8IDAuMDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzSG9yaXpvbnRhbENvbGxpc2lvbiA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNIb3Jpem9udGFsQ29sbGlzaW9uID0gZmFsc2VcblxuICAgICAgICAgICAgICAgIGlmIGlzSG9yaXpvbnRhbENvbGxpc2lvblxuICAgICAgICAgICAgICAgICAgICAjIEhvcml6b250YWwgY29sbGlzaW9uc1xuICAgICAgICAgICAgICAgICAgICBpZiBhY3Rvci5zcGVlZFggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdvaW5nIHJpZ2h0LiBJcyBub3QgYW4gZWRnZSBpZiB0aGUgdGlsZSB0byB0aGUgbGVmdCBpcyBzb2xpZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoYm9yVGlsZSA9IGxheWVyLmdldFRpbGUoeCwgeSwgLTEsIDApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuZWlnaGJvclRpbGUgPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdQb3NYID0geCAtIGFjdG9yLmNvbFcgLSAwLjAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3BlZWRYID0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbnMuYW55ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbnMucmlnaHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4LCB5OnksIHgyOngsIHkyOnkrMSwgc3Ryb2tlU3R5bGU6J3JnYmEoMCwxMjgsMCwwLjkpJ30gI0RlYnVnXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4LCB5OnksIHgyOngsIHkyOnkrMSwgc3Ryb2tlU3R5bGU6J3JnYmEoMjU1LDY0LDAsMC42KSd9ICNEZWJ1Z1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdvaW5nIGxlZnQuIElzIG5vdCBhbiBlZGdlIGlmIHRoZSB0aWxlIHRvIHRoZSByaWdodCBpcyBzb2xpZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoYm9yVGlsZSA9IGxheWVyLmdldFRpbGUoeCwgeSwgMSwgMClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5laWdoYm9yVGlsZSA9PSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Bvc1ggPSB4ICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1NwZWVkWCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLmFueSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLmxlZnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4KzEsIHk6eSwgeDI6eCsxLCB5Mjp5KzEsIHN0cm9rZVN0eWxlOidyZ2JhKDAsMTI4LDAsMC45KSd9ICNEZWJ1Z1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuZHJhd09uY2Uge2NsYXNzOkxpbmUsIHg6eCsxLCB5OnksIHgyOngrMSwgeTI6eSsxLCBzdHJva2VTdHlsZToncmdiYSgyNTUsNjQsMCwwLjYpJ30gI0RlYnVnXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAjIFZlcnRpY2FsIGNvbGxpc2lvbnNcbiAgICAgICAgICAgICAgICAgICAgaWYgYWN0b3Iuc3BlZWRZIDwgMFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBHb2luZyB1cC4gSXMgbm90IGFuIGVkZ2UgaWYgdGhlIHRpbGUgdXB3YXJkcyBpcyBzb2xpZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoYm9yVGlsZSA9IGxheWVyLmdldFRpbGUoeCwgeSwgMCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5laWdoYm9yVGlsZSA9PSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Bvc1kgPSB5ICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1NwZWVkWSA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLmFueSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLnRvcCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3LmRyYXdPbmNlIHtjbGFzczpMaW5lLCB4OngsIHk6eSsxLCB4Mjp4KzEsIHkyOnkrMSwgc3Ryb2tlU3R5bGU6J3JnYmEoMCwxMjgsMCwwLjkpJ30gI0RlYnVnXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4LCB5OnkrMSwgeDI6eCsxLCB5Mjp5KzEsIHN0cm9rZVN0eWxlOidyZ2JhKDI1NSw2NCwwLDAuNiknfSAjRGVidWdcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBhY3Rvci5zcGVlZFkgPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdvaW5nIGRvd24uIElzIG5vdCBhbiBlZGdlIGlmIHRoZSB0aWxlIGRvd253YXJkcyBpcyBzb2xpZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoYm9yVGlsZSA9IGxheWVyLmdldFRpbGUoeCwgeSwgMCwgLTEpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuZWlnaGJvclRpbGUgPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdQb3NZID0geSAtIGFjdG9yLmNvbEhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTcGVlZFkgPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9ucy5hbnkgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9ucy5ib3R0b20gPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4LCB5OnksIHgyOngrMSwgeTI6eSwgc3Ryb2tlU3R5bGU6J3JnYmEoMCwxMjgsMCwwLjkpJ30gI0RlYnVnXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4LCB5OnksIHgyOngrMSwgeTI6eSwgc3Ryb2tlU3R5bGU6J3JnYmEoMjU1LDY0LDAsMC42KSd9ICNEZWJ1Z1xuXG4gICAgICAgICAgICAgICAgIyBEZWJ1ZyBoaWdobGlnaHQgYmxvY2tcbiAgICAgICAgICAgICAgICBpZiBuZWlnaGJvclRpbGUgPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgIyBDb2xsaXNpb25cbiAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6UmVjdCwgeDp4LCB5OnksIHc6MSwgaDoxLCBmaWxsU3R5bGU6J3JnYmEoMCwyNTUsMCwwLjYpJ30gI0RlYnVnXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAjIEludGVybmFsIGVkZ2U7IG5vIGNvbGxpc2lvblxuICAgICAgICAgICAgICAgICAgICB2aWV3LmRyYXdPbmNlIHtjbGFzczpSZWN0LCB4OngsIHk6eSwgdzoxLCBoOjEsIGZpbGxTdHlsZToncmdiYSgyNTUsMjU1LDAsMC41KSd9ICNEZWJ1Z1xuXG4gICAgIyBBcHBseSBuZXcgcG9zaXRpb24gYW5kIHNwZWVkXG4gICAgaWYgby5yZXBvc2l0aW9uXG4gICAgICAgIGFjdG9yLnBvc1ggPSBuZXdQb3NYXG4gICAgICAgIGFjdG9yLnBvc1kgPSBuZXdQb3NZXG4gICAgICAgIGFjdG9yLnNwZWVkWCA9IG5ld1NwZWVkWFxuICAgICAgICBhY3Rvci5zcGVlZFkgPSBuZXdTcGVlZFlcblxuICAgIHJldHVybiBjb2xsaXNpb25zXG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG4jSURFQTogRHluYW1pYyB6b29tIGFuZCBhdXRvbWF0aWMgc2NyZWVuIHNpemUgKGFkYXB0IHRvIHdpbmRvdykuXG5cbmJhY2tncm91bmQgPSByZXF1aXJlKCcuL2JhY2tncm91bmQnKVxuZXZlbnQgPSByZXF1aXJlKCcuL2V2ZW50JylcbmxheWVycyA9IHJlcXVpcmUoJy4vbGF5ZXJzJylcbnV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKVxudmlldyA9IHJlcXVpcmUoJy4vdmlldycpXG5cbmNvcmUgPSB7fVxubW9kdWxlLmV4cG9ydHMgPSBjb3JlXG5cbiMgUHJpdmF0ZSB2YXJpYWJsZXNcbl92aWV3ID0gbnVsbFxuX3ZpZXdDdHggPSBudWxsXG5fZnJhbWVCdWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXG5fbGF0ZXN0RnJhbWVUaW1lID0gRGF0ZS5ub3coKVxuX2VkaXRUaWxlID0gLTFcblxuIyBQdWJsaWMgdmFyaWFibGVzXG5jb3JlLmZyYW1lQnVmZmVyQ3R4ID0gX2ZyYW1lQnVmZmVyLmdldENvbnRleHQgJzJkJ1xuY29yZS5jYW1YID0gMFxuY29yZS5jYW1ZID0gMFxuY29yZS5jYW1XID0gMFxuY29yZS5jYW1IID0gMFxuY29yZS5hY3RvcnMgPSBbXVxuY29yZS5zaGFwZXMgPSBbXVxuXG5cbiMgQ29yZSBmdW5jdGlvbnNcbmNvcmUuaW1nUGF0aCA9ICdfaW1nLydcblxuY29yZS5pbml0ID0gLT5cbiAgICBfdmlldyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZW8tdmlldycpXG5cbiAgICBfZnJhbWVCdWZmZXIud2lkdGggID0gX3ZpZXcud2lkdGhcbiAgICBfZnJhbWVCdWZmZXIuaGVpZ2h0ID0gX3ZpZXcuaGVpZ2h0XG5cbiAgICBfdmlldy53aWR0aCAgICAgICAgICA9IF92aWV3LndpZHRoICAqIHZpZXcuc2NhbGVcbiAgICBfdmlldy5oZWlnaHQgICAgICAgICA9IF92aWV3LmhlaWdodCAqIHZpZXcuc2NhbGVcblxuICAgIF92aWV3Q3R4ID0gX3ZpZXcuZ2V0Q29udGV4dCgnMmQnKVxuICAgIF92aWV3Q3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IF92aWV3Q3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IF92aWV3Q3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlXG5cbiAgICBfdmlldy5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAoZSkgLT5cbiAgICAgICAgdW5sZXNzIGUuYnV0dG9uIGlzIDBcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICAgIG1vdXNlWCAgID0gZS5vZmZzZXRYXG4gICAgICAgIG1vdXNlWSAgID0gZS5vZmZzZXRZXG4gICAgICAgIGNhbVggICAgID0gdmlldy5jYW1lcmFQb3NYXG4gICAgICAgIGNhbVkgICAgID0gdmlldy5jYW1lcmFQb3NZXG4gICAgICAgIHNjYWxlICAgID0gdmlldy5zY2FsZVxuICAgICAgICB0aWxlU2l6ZSA9IGJhY2tncm91bmQudGlsZVNpemVcblxuICAgICAgICB0aWxlWCAgICA9IChtb3VzZVggLyBzY2FsZSAvIHRpbGVTaXplICsgY2FtWCkgPj4gMFxuICAgICAgICB0aWxlWSAgICA9IChtb3VzZVkgLyBzY2FsZSAvIHRpbGVTaXplICsgY2FtWSkgPj4gMFxuXG4gICAgICAgIGxheWVyICAgID0gbGF5ZXJzLmdldCgnZ3JvdW5kJylcbiAgICAgICAgdGlsZSAgICAgPSBsYXllci5nZXRUaWxlKHRpbGVYLCB0aWxlWSlcbiAgICAgICAgY29uc29sZS5sb2cgdGlsZVgsIHRpbGVZICNEZWJ1Z1xuXG4gICAgICAgIGlmIGUuYWx0S2V5XG4gICAgICAgICAgICBfZWRpdFRpbGUgPSB0aWxlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgbGF5ZXIuc2V0VGlsZSh0aWxlWCwgdGlsZVksIF9lZGl0VGlsZSlcblxuICAgIF92aWV3LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAoZSkgLT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIGV2ZW50Ll9rZXlkb3duXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2tleXVwJywgICBldmVudC5fa2V5dXBcblxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29yZS5jeWNsZSlcblxuY29yZS5kcmF3ID0gLT5cbiAgICBpZiB1dGlsLmRvY3VtZW50SGlkZGVuKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICAjIENhbGN1bGF0ZSBjYW1lcmEgcGl4ZWwgdmFsdWVzXG4gICAgY29yZS5jYW1YID0gdmlldy5jYW1lcmFQb3NYICogYmFja2dyb3VuZC50aWxlU2l6ZVxuICAgIGNvcmUuY2FtWSA9IHZpZXcuY2FtZXJhUG9zWSAqIGJhY2tncm91bmQudGlsZVNpemVcbiAgICBjb3JlLmNhbVcgPSB2aWV3LmNhbWVyYVdpZHRoICogYmFja2dyb3VuZC50aWxlU2l6ZVxuICAgIGNvcmUuY2FtSCA9IHZpZXcuY2FtZXJhSGVpZ2h0ICogYmFja2dyb3VuZC50aWxlU2l6ZVxuXG4gICAgIyBCYWNrZ3JvdW5kIGNvbG9yXG4gICAgY29yZS5mcmFtZUJ1ZmZlckN0eC5maWxsU3R5bGUgPSBiYWNrZ3JvdW5kLmNvbG9yXG4gICAgY29yZS5mcmFtZUJ1ZmZlckN0eC5maWxsUmVjdCAwLCAwLCBfdmlldy53aWR0aCwgX3ZpZXcuaGVpZ2h0XG5cbiAgICAjIFJlbmRlciBsYXllcnNcbiAgICBmb3IgbGF5ZXIgaW4gbGF5ZXJzLm9iamVjdHNcbiAgICAgICAgbGF5ZXIuZHJhdygpXG5cbiAgICAjIFJlbmRlciBBY3RvcnNcbiAgICBmb3IgYWN0b3IgaW4gY29yZS5hY3RvcnNcbiAgICAgICAgYWN0b3IuZHJhdygpXG5cbiAgICAjIFJlbmRlciBzaGFwZXNcbiAgICBmb3Igc2hhcGUgaW4gY29yZS5zaGFwZXNcbiAgICAgICAgc2hhcGUuZHJhdygpXG5cbiAgICB3aGlsZSBzbyA9IHZpZXcuZHJhd09uY2VRdWUucG9wKClcbiAgICAgICAgc2hhcGUgPSBuZXcgc28uY2xhc3MoKVxuICAgICAgICBmb3IgbmFtZSwgdmFsIG9mIHNvXG4gICAgICAgICAgICBzaGFwZVtuYW1lXSA9IHZhbFxuICAgICAgICBzaGFwZS5pc1Zpc2libGUgPSB0cnVlXG4gICAgICAgIHNoYXBlLmRyYXcoKVxuICAgICAgICBzaGFwZS5pc1Zpc2libGUgPSBmYWxzZVxuXG4gICAgX3ZpZXdDdHguZHJhd0ltYWdlIF9mcmFtZUJ1ZmZlcixcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgX2ZyYW1lQnVmZmVyLndpZHRoICogdmlldy5zY2FsZSxcbiAgICAgICAgX2ZyYW1lQnVmZmVyLmhlaWdodCAqIHZpZXcuc2NhbGVcblxuY29yZS5jeWNsZSA9IC0+XG4gICAgIyBGcmFtZSB0aW1pbmdcbiAgICB0aGlzRnJhbWVUaW1lID0gRGF0ZS5ub3coKVxuICAgIGN5Y2xlTGVuZ3RoID0gTWF0aC5taW4odGhpc0ZyYW1lVGltZSAtIF9sYXRlc3RGcmFtZVRpbWUsIDEwMCkgKiAwLjAwMSAjIFVuaXQgc2Vjb25kc1xuICAgIHVubGVzcyBjeWNsZUxlbmd0aFxuICAgICAgICByZXR1cm5cblxuICAgICMgQ2FtZXJhXG4gICAgdmlldy5jYW1lcmFQb3NYICs9IHZpZXcuY2FtZXJhU3BlZWRYICogY3ljbGVMZW5ndGhcblxuICAgICMgQWN0b3JzXG4gICAgZm9yIGFjdG9yIGluIGNvcmUuYWN0b3JzXG4gICAgICAgIGFjdG9yLnVwZGF0ZShjeWNsZUxlbmd0aClcblxuICAgICMgRmluaXNoIHRoZSBmcmFtZVxuICAgIGNvcmUuZHJhdygpXG4gICAgX2xhdGVzdEZyYW1lVGltZSA9IHRoaXNGcmFtZVRpbWVcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNvcmUuY3ljbGUpXG5cbiAgICBjb3JlLmN5Y2xlQ2FsbGJhY2soY3ljbGVMZW5ndGgpXG5cbmNvcmUuREFUQV9UWVBFUyA9XG4gICAgQ0hVTks6IDBcblxuXG5jb3JlLmN5Y2xlQ2FsbGJhY2sgPSAtPiAjIE92ZXJyaWRlIGNvcmUuY3ljbGVDYWxsYmFjayB3aXRoIHlvdXIgb3duIGZ1bmN0aW9uXG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVudmlyb25tZW50ID1cbiAgICBncmF2aXR5OiA2MCAjIFRpbGVzIHBlciBzZWNvbmReMlxuIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxubGF5ZXJzID0gcmVxdWlyZSgnLi9sYXllcnMnKVxudXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG5cbmV2ZW50ID0ge31cbm1vZHVsZS5leHBvcnRzID0gZXZlbnRcblxuZXZlbnQucHJlc3NlZEtleXMgPSBbXVxuXG5ldmVudC5fa2V5ZG93biA9IChlKSAtPlxuICAgIHVubGVzcyBlLmN0cmxLZXkgb3IgZS5tZXRhS2V5XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgIyBQcmV2ZW50IGtleWRvd24gcmVwZWF0XG4gICAga2V5SW5kZXggPSBldmVudC5wcmVzc2VkS2V5cy5pbmRleE9mIGUua2V5Q29kZVxuICAgIGlmIGtleUluZGV4IGlzIC0xXG4gICAgICAgIGV2ZW50LnByZXNzZWRLZXlzLnB1c2ggZS5rZXlDb2RlXG5cbiAgICAgICAga2V5ID0gdXRpbC5LRVlfQ09ERVNcbiAgICAgICAgc3dpdGNoIGUua2V5Q29kZVxuICAgICAgICAgICAgd2hlbiBrZXkuU1xuICAgICAgICAgICAgICAgIGRhdGEgPSBsYXllcnMuZ2V0KCdncm91bmQnKS5zZXJpYWxpemUoKVxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdncm91bmQnLCBkYXRhKVxuXG4gICAgICAgICAgICB3aGVuIGtleS5MXG4gICAgICAgICAgICAgICAgZGF0YSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdncm91bmQnKVxuICAgICAgICAgICAgICAgIGxheWVycy5nZXQoJ2dyb3VuZCcpLmRlc2VyaWFsaXplKGRhdGEpXG5cbiAgICAgICAgZXZlbnQua2V5ZG93biBlXG5cbmV2ZW50LmtleWRvd24gPSAoZSkgLT5cbiAgICAjIE92ZXJyaWRlIGV2ZW50LmtleWRvd24gd2l0aCB5b3VyIGtleWRvd24gZnVuY3Rpb25cblxuZXZlbnQuX2tleXVwID0gKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAga2V5SW5kZXggPSBldmVudC5wcmVzc2VkS2V5cy5pbmRleE9mIGUua2V5Q29kZVxuICAgIGlmIGtleUluZGV4IGlzbnQgLTFcbiAgICAgICAgZXZlbnQucHJlc3NlZEtleXMuc3BsaWNlIGtleUluZGV4LCAxXG4gICAgZXZlbnQua2V5dXAgZVxuXG5ldmVudC5rZXl1cCA9IChlKSAtPlxuICAgICMgT3ZlcnJpZGUgZXZlbnQua2V5dXAgd2l0aCB5b3VyIGtleXVwIGZ1bmN0aW9uIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxudXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG5ldmVudCA9IHJlcXVpcmUoJy4vZXZlbnQnKVxuXG5pbyA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IGlvXG5cbmlvLmdldFByZXNzZWRLZXlzID0gLT5cbiAgICByZXR1cm4gZXZlbnQucHJlc3NlZEtleXNcblxuaW8uaXNLZXlQcmVzc2VkID0gKGtleSkgLT5cbiAgICBpZiB0eXBlb2Yga2V5IGlzICdzdHJpbmcnXG4gICAgICAgIGtleSA9IHV0aWwuS0VZX0NPREVTW2tleS50b1VwcGVyQ2FzZSgpXVxuICAgIHVubGVzcyB0eXBlb2Yga2V5IGlzICdudW1iZXInXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIGV2ZW50LnByZXNzZWRLZXlzLmluZGV4T2Yoa2V5KSA+IC0xXG5cbmlvLmFueUtleVByZXNzZWQgPSAoa2V5cykgLT5cbiAgICBrZXlDb2RlcyA9IHV0aWwuS0VZX0NPREVTXG4gICAgaWYgdHlwZW9mIGtleSBpcyAnc3RyaW5nJ1xuICAgICAgICBrZXkgPSBba2V5XVxuICAgIGZvciBrZXkgaW4ga2V5c1xuICAgICAgICBpZiB0eXBlb2Yga2V5IGlzICdzdHJpbmcnXG4gICAgICAgICAgICBrZXkgPSBrZXlDb2Rlc1trZXkudG9VcHBlckNhc2UoKV1cbiAgICAgICAgaWYgZXZlbnQucHJlc3NlZEtleXMuaW5kZXhPZihrZXkpID4gLTFcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbmlvLmFsbEtleXNQcmVzc2VkID0gKGtleXMpIC0+XG4gICAga2V5Q29kZXMgPSB1dGlsLktFWV9DT0RFU1xuICAgIGlmIHR5cGVvZiBrZXkgaXMgJ3N0cmluZydcbiAgICAgICAga2V5ID0gW2tleV1cbiAgICBmb3Iga2V5IGluIGtleXNcbiAgICAgICAgaWYgdHlwZW9mIGtleSBpcyAnc3RyaW5nJ1xuICAgICAgICAgICAga2V5ID0ga2V5Q29kZXNba2V5LnRvVXBwZXJDYXNlKCldXG4gICAgICAgIGlmIGV2ZW50LnByZXNzZWRLZXlzLmluZGV4T2Yoa2V5KSA9PSAtMVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcbiIsIiMjIyBDb3B5cmlnaHQgKGMpIDIwMTUgTWFnbnVzIExlby4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gIyMjXG5cbmxheWVycyA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IGxheWVyc1xuXG5sYXllcnMub2JqZWN0cyA9IFtdXG5cbmxheWVycy5hZGQgPSAobGF5ZXJPYmopIC0+XG4gICAgaWYgbm90IGxheWVyT2JqPy5pZCBvclxuICAgIGxheWVycy5nZXQobGF5ZXJPYmouaWQpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICBsYXllcnMub2JqZWN0cy5wdXNoKGxheWVyT2JqKVxuXG5sYXllcnMuZ2V0ID0gKGlkKSAtPlxuICAgIGZvciBsYXllck9iaiBpbiBsYXllcnMub2JqZWN0c1xuICAgICAgICBpZiBsYXllck9iai5pZCBpcyBpZFxuICAgICAgICAgICAgcmV0dXJuIGxheWVyT2JqXG4gICAgcmV0dXJuIG51bGxcblxuXG4jIFRPRE86IERvIGxpa2UgQWN0b3Igc3ByaXRlcyBhbmQgYXNzaWduIFNwcml0ZSBvYmplY3RzIHRvIExheWVycy5cbmxheWVycy5nZXRJbWcgPSAocGF0aCkgLT5cbiAgICBfaW1nID0gbGF5ZXJzLl9pbWdcbiAgICBpZiBfaW1nW3BhdGhdXG4gICAgICAgIHJldHVybiBfaW1nW3BhdGhdXG4gICAgZWxzZVxuICAgICAgICBfaW1nT2JqID0gX2ltZ1twYXRoXSA9IG5ldyBJbWFnZSgpXG4gICAgICAgIF9pbWdPYmouc3JjID0gJ19pbWcvJyArIHBhdGhcbiAgICAgICAgcmV0dXJuIF9pbWdPYmpcblxubGF5ZXJzLnJlbW92ZUltZyA9IChwYXRoKSAtPlxuICAgIF9pbWcgPSBsYXllcnMuX2ltZ1xuICAgIGlmIF9pbWdbcGF0aF0gdGhlbiBfaW1nW3BhdGhdID0gbnVsbFxuXG5sYXllcnMuX2ltZyA9IHt9ICMgSGFzaG1hcCBvZiBpbWFnZSBvYmplY3RzIHdpdGggdGhlIHNwcml0ZSBwYXRoIGFzIGtleVxuIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxudXRpbCA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxcblxudXRpbC5LRVlfQ09ERVMgPSB7J0JBQ0tTUEFDRSc6OCwnVEFCJzo5LCdFTlRFUic6MTMsJ1NISUZUJzoxNiwnQ1RSTCc6MTcsJ0FMVCc6MTgsJ1BBVVNFX0JSRUFLJzoxOSwnQ0FQU19MT0NLJzoyMCwnRVNDQVBFJzoyNywnUEFHRV9VUCc6MzMsJ1BBR0VfRE9XTic6MzQsJ0VORCc6MzUsJ0hPTUUnOjM2LCdMRUZUJzozNywnVVAnOjM4LCdSSUdIVCc6MzksJ0RPV04nOjQwLCdJTlNFUlQnOjQ1LCdERUxFVEUnOjQ2LCcwJzo0OCwnMSc6NDksJzInOjUwLCczJzo1MSwnNCc6NTIsJzUnOjUzLCc2Jzo1NCwnNyc6NTUsJzgnOjU2LCc5Jzo1NywnQSc6NjUsJ0InOjY2LCdDJzo2NywnRCc6NjgsJ0UnOjY5LCdGJzo3MCwnRyc6NzEsJ0gnOjcyLCdJJzo3MywnSic6NzQsJ0snOjc1LCdMJzo3NiwnTSc6NzcsJ04nOjc4LCdPJzo3OSwnUCc6ODAsJ1EnOjgxLCdSJzo4MiwnUyc6ODMsJ1QnOjg0LCdVJzo4NSwnVic6ODYsJ1cnOjg3LCdYJzo4OCwnWSc6ODksJ1onOjkwLCdMRUZUX1dJTkRPV19LRVknOjkxLCdSSUdIVF9XSU5ET1dfS0VZJzo5MiwnU0VMRUNUX0tFWSc6OTMsJ05VTVBBRF8wJzo5NiwnTlVNUEFEXzEnOjk3LCdOVU1QQURfMic6OTgsJ05VTVBBRF8zJzo5OSwnTlVNUEFEXzQnOjEwMCwnTlVNUEFEXzUnOjEwMSwnTlVNUEFEXzYnOjEwMiwnTlVNUEFEXzcnOjEwMywnTlVNUEFEXzgnOjEwNCwnTlVNUEFEXzknOjEwNSwnTVVMVElQTFknOjEwNiwnKic6MTA2LCdBREQnOjEwNywnKyc6MTA3LCdTVUJUUkFDVCc6MTA5LCdERUNJTUFMX1BPSU5UJzoxMTAsJ0RJVklERSc6MTExLCdGMSc6MTEyLCdGMic6MTEzLCdGMyc6MTE0LCdGNCc6MTE1LCdGNSc6MTE2LCdGNic6MTE3LCdGNyc6MTE4LCdGOCc6MTE5LCdGOSc6MTIwLCdGMTAnOjEyMSwnRjExJzoxMjIsJ0YxMic6MTIzLCdOVU1fTE9DSyc6MTQ0LCdTQ1JPTExfTE9DSyc6MTQ1LCdTRU1JLUNPTE9OJzoxODYsJzsnOjE4NiwnRVFVQUxfU0lHTic6MTg3LCc9JzoxODcsJ0NPTU1BJzoxODgsJywnOjE4OCwnREFTSCc6MTg5LCctJzoxODksJ1BFUklPRCc6MTkwLCcuJzoxOTAsJ0ZPUldBUkRfU0xBU0gnOjE5MSwnLyc6MTkxLCdHUkFWRV9BQ0NFTlQnOjE5MiwnT1BFTl9CUkFDS0VUJzoyMTksJ1snOjIxOSwnQkFDS19TTEFTSCc6MjIwLCdcXFxcJzoyMjAsJ0NMT1NFX0JSQUtFVCc6MjIxLCddJzoyMjEsJ1NJTkdMRV9RVU9URSc6MjIyLCdcXCcnOjIyMn1cblxudXRpbC5kb2N1bWVudEhpZGRlbiA9IC0+XG4gICAgdmVuZG9ycyA9IFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ11cbiAgICBpID0gMFxuICAgIGlmIGRvY3VtZW50LmhpZGRlbj9cbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmhpZGRlblxuXG4gICAgZm9yIHZlbmRvciBpbiB2ZW5kb3JzXG4gICAgICAgIGlmIHR5cGVvZiBkb2N1bWVudFt2ZW5kb3IgKyAnSGlkZGVuJ10gaXNudCAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50W3ZlbmRvciArICdIaWRkZW4nXVxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbnV0aWwubWVyZ2UgPSAtPlxuICAgIHJldCA9IHt9XG4gICAgZm9yIG9iaiBpbiBhcmd1bWVudHNcbiAgICAgICAgaWYgdHlwZW9mIG9iaiBpc250ICdvYmplY3QnIG9yXG4gICAgICAgIChvYmogaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGZvciBuYW1lLCB2YWwgb2Ygb2JqXG4gICAgICAgICAgICByZXRbbmFtZV0gPSB2YWxcbiAgICByZXR1cm4gcmV0XG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG5iYWNrZ3JvdW5kID0gcmVxdWlyZSgnLi9iYWNrZ3JvdW5kJylcblxudmlldyA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IHZpZXdcblxudmlldy5zY2FsZSA9IDJcbnZpZXcuY2FtZXJhUG9zWCA9IDIuMCAjIFVuaXQgdGlsZVxudmlldy5jYW1lcmFQb3NZID0gMC4wXG52aWV3LmNhbWVyYVNwZWVkWCA9IDAuMCAjIE9uZSB0aWxlcyBwZXIgc2Vjb25kLCBwb3NpdGl2ZSBpcyByaWdodFxudmlldy5jYW1lcmFTcGVlZFkgPSAwLjBcbnZpZXcuY2FtZXJhV2lkdGggPSAzMFxudmlldy5jYW1lcmFIZWlnaHQgPSAxN1xuXG52aWV3LnBvc1RvUHggPSAocG9zWCwgYXhpcywgcGFyYWxsYXggPSAxLjApIC0+XG4gICAgcmV0dXJuICgocG9zWCAtIHZpZXdbJ2NhbWVyYVBvcycgKyBheGlzLnRvVXBwZXJDYXNlKCldKSAqIGJhY2tncm91bmQudGlsZVNpemUgKiBwYXJhbGxheCkgPj4gMFxuXG52aWV3LmRyYXdPbmNlUXVlID0gW11cbnZpZXcuZHJhd09uY2UgPSAoZGF0YSkgLT5cbiAgICB2aWV3LmRyYXdPbmNlUXVlLnB1c2ggZGF0YVxuIl19
