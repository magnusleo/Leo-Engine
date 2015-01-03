(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Actor, Sprite, core;

core = require('./core');

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



},{"./Sprite":9,"./core":12}],2:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Animation, Frame, util;

Frame = require('./Frame');

util = require('./util');

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



},{"./Frame":3,"./util":18}],3:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Frame, util;

util = require('./util');

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



},{"./util":18}],4:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Chunk, Layer, background, core, layers, view;

core = require('./core');

background = require('./background');

layers = require('./layers');

view = require('./view');

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



},{"./background":10,"./core":12,"./layers":16,"./view":19}],5:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Line, Shape, core, util, view,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Shape = require('./Shape');

util = require('./util');

core = require('./core');

view = require('./view');

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



},{"./Shape":8,"./core":12,"./util":18,"./view":19}],6:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Actor, Player, PlayerState, PlayerStateAir, PlayerStateFalling, PlayerStateGround, PlayerStateJumping, PlayerStateRunning, PlayerStateStanding, collision, environment, event, io, layers, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Actor = require('./Actor');

collision = require('./collision');

environment = require('./environment');

event = require('./event');

io = require('./io');

layers = require('./layers');

util = require('./util');

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



},{"./Actor":1,"./collision":11,"./environment":13,"./event":14,"./io":15,"./layers":16,"./util":18}],7:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Rect, Shape, core,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Shape = require('./Shape');

core = require('./core');

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



},{"./Shape":8,"./core":12}],8:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Shape, background, core, util, view;

core = require('./core');

background = require('./background');

util = require('./util');

view = require('./view');

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



},{"./background":10,"./core":12,"./util":18,"./view":19}],9:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Animation, Sprite, core, view;

Animation = require('./Animation');

core = require('./core');

view = require('./view');

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



},{"./Animation":2,"./core":12,"./view":19}],10:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var background;

module.exports = background = {
  tileSize: 16,
  color: '#6ec0ff'
};



},{}],11:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var Line, Rect, collision, util, view;

collision = {};

module.exports = collision;

Line = require('./Line');

Rect = require('./Rect');

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



},{"./Line":5,"./Rect":7,"./util":18,"./view":19}],12:[function(require,module,exports){

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



},{"./background":10,"./event":14,"./layers":16,"./util":18,"./view":19}],13:[function(require,module,exports){

/* Copyright (c) 2015 Magnus Leo. All rights reserved. */
var environment;

module.exports = environment = {
  gravity: 60
};



},{}],14:[function(require,module,exports){

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



},{"./layers":16,"./util":18}],15:[function(require,module,exports){

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



},{"./event":14,"./util":18}],16:[function(require,module,exports){

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



},{}],17:[function(require,module,exports){

/* Copyright (c) 2014 Magnus Leo. All rights reserved. */
var Layer, Player, Sprite, core, event, layers, util, view;

core = require('./core');

event = require('./event');

Layer = require('./Layer');

layers = require('./layers');

Player = require('./Player');

Sprite = require('./Sprite');

util = require('./util');

view = require('./view');

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



},{"./Layer":4,"./Player":6,"./Sprite":9,"./core":12,"./event":14,"./layers":16,"./util":18,"./view":19}],18:[function(require,module,exports){

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



},{"./background":10}]},{},[17])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9BY3Rvci5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9BbmltYXRpb24uY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvRnJhbWUuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvTGF5ZXIuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvTGluZS5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvUmVjdC5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9TaGFwZS5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9TcHJpdGUuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvYmFja2dyb3VuZC5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9jb2xsaXNpb24uY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvY29yZS5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9lbnZpcm9ubWVudC5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9ldmVudC5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9pby5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy9sYXllcnMuY29mZmVlIiwiL1VzZXJzL21hZ251cy9NYWdudXMvV2ViYnV0dmVja2xpbmcvTGVvIEVuZ2luZS9zcmMvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvbWFnbnVzL01hZ251cy9XZWJidXR2ZWNrbGluZy9MZW8gRW5naW5lL3NyYy91dGlsLmNvZmZlZSIsIi9Vc2Vycy9tYWdudXMvTWFnbnVzL1dlYmJ1dHZlY2tsaW5nL0xlbyBFbmdpbmUvc3JjL3ZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFBQSx5REFBQTtBQUFBLElBQUEsbUJBQUE7O0FBQUEsSUFFQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBRlAsQ0FBQTs7QUFBQSxNQUdBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FIVCxDQUFBOztBQUFBLE1BS00sQ0FBQyxPQUFQLEdBQ007QUFFVyxFQUFBLGVBQUMsVUFBRCxHQUFBO0FBRVQsUUFBQSxRQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLENBQVIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxDQURSLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FGVixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBSFYsQ0FBQTtBQU1BLFNBQUEsaUJBQUE7NEJBQUE7QUFDSSxNQUFBLElBQUUsQ0FBQSxHQUFB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VUFBTCxHQUFrQixHQVRsQixDQUFBOztBQUFBLElBVUksQ0FBQyxZQUFMLEdBQW9CLEdBVnBCLENBQUE7O0FBQUEsSUFXSSxDQUFDLFlBQUwsR0FBb0IsR0FYcEIsQ0FBQTs7QUFBQSxJQVlJLENBQUMsV0FBTCxHQUFtQixFQVpuQixDQUFBOztBQUFBLElBYUksQ0FBQyxZQUFMLEdBQW9CLEVBYnBCLENBQUE7O0FBQUEsSUFlSSxDQUFDLE9BQUwsR0FBZSxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsUUFBYixHQUFBOztJQUFhLFdBQVc7R0FDbkM7QUFBQSxTQUFPLENBQUMsQ0FBQyxJQUFBLEdBQU8sSUFBSyxDQUFBLFdBQUEsR0FBYyxJQUFJLENBQUMsV0FBTCxDQUFBLENBQWQsQ0FBYixDQUFBLEdBQWtELFVBQVUsQ0FBQyxRQUE3RCxHQUF3RSxRQUF6RSxDQUFBLElBQXNGLENBQTdGLENBRFc7QUFBQSxDQWZmLENBQUE7O0FBQUEsSUFrQkksQ0FBQyxXQUFMLEdBQW1CLEVBbEJuQixDQUFBOztBQUFBLElBbUJJLENBQUMsUUFBTCxHQUFnQixTQUFDLElBQUQsR0FBQTtTQUNaLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBakIsQ0FBc0IsSUFBdEIsRUFEWTtBQUFBLENBbkJoQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjIyBDb3B5cmlnaHQgKGMpIDIwMTUgTWFnbnVzIExlby4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gIyMjXG5cbmNvcmUgPSByZXF1aXJlKCcuL2NvcmUnKVxuU3ByaXRlID0gcmVxdWlyZSgnLi9TcHJpdGUnKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBBY3RvclxuXG4gICAgY29uc3RydWN0b3I6IChwcm9wZXJ0aWVzKSAtPiAjIEFjdG9yOjpjb25zdHJ1Y3RvclxuICAgICAgICAjIERlZmF1bHRzXG4gICAgICAgIEBwb3NYID0gMFxuICAgICAgICBAcG9zWSA9IDBcbiAgICAgICAgQHNwZWVkWCA9IDBcbiAgICAgICAgQHNwZWVkWSA9IDBcblxuICAgICAgICAjIFVzZXIgZGVmaW5lZCBwcm9wZXJ0aWVzXG4gICAgICAgIGZvciBrZXksIHZhbCBvZiBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBAW2tleV0gPSB2YWxcblxuICAgICAgICBjb3JlLmFjdG9ycy5wdXNoIHRoaXNcblxuXG4gICAgZHJhdzogLT4gIyBBY3Rvcjo6ZHJhd1xuICAgICAgICBAc3ByaXRlLmRyYXcoQHBvc1gsIEBwb3NZKVxuXG5cbiAgICBzZXRTcHJpdGU6IChzcHJpdGUpIC0+ICMgQWN0b3I6OnNldFNwcml0ZVxuICAgICAgICB1bmxlc3Mgc3ByaXRlIGluc3RhbmNlb2YgU3ByaXRlXG4gICAgICAgICAgICB0aHJvdyAnQWN0b3I6OnNldFNwcml0ZSAtIE1pc3NpbmcgU3ByaXRlJ1xuICAgICAgICBAc3ByaXRlID0gc3ByaXRlXG5cblxuICAgIHVwZGF0ZTogKGN5Y2xlTGVuZ3RoKSAtPiAjIEFjdG9yOjp1cGRhdGVcbiAgICAgICAgIyBBbmltYXRpb25cbiAgICAgICAgQHNwcml0ZS5hZHZhbmNlQW5pbWF0aW9uKGN5Y2xlTGVuZ3RoKVxuXG4gICAgICAgICMgUG9zaXRpb25cbiAgICAgICAgQHBvc1ggKz0gQHNwZWVkWCAqIGN5Y2xlTGVuZ3RoXG4gICAgICAgIEBwb3NZICs9IEBzcGVlZFkgKiBjeWNsZUxlbmd0aFxuXG5cbiAgICBkZWNlbGVyYXRlOiAoYXhpcywgYW1vdW50KSAtPiAjIEFjdG9yOjpkZWNlbGVyYXRlXG4gICAgICAgIGlmIG5vdCBhbW91bnRcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBheGlzID0gYXhpcy50b1VwcGVyQ2FzZSgpXG4gICAgICAgIHVuaXROYW1lID0gJ3NwZWVkJyArIGF4aXNcbiAgICAgICAgY3VyU3BlZWQgPSBAW3VuaXROYW1lXVxuICAgICAgICBpZiBjdXJTcGVlZCA+IDBcbiAgICAgICAgICAgIEBbdW5pdE5hbWVdID0gTWF0aC5tYXgoY3VyU3BlZWQgLSBhbW91bnQsIDApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBbdW5pdE5hbWVdID0gTWF0aC5taW4oY3VyU3BlZWQgKyBhbW91bnQsIDApXG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG5GcmFtZSA9IHJlcXVpcmUoJy4vRnJhbWUnKVxudXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEFuaW1hdGlvblxuXG4gICAgY29uc3RydWN0b3I6IChzcHJpdGUsIG9wdGlvbnMpIC0+ICMgQW5pbWF0aW9uOjpjb25zdHJ1Y3RvclxuICAgICAgICBkZWZhdWx0T3B0aW9ucyA9XG4gICAgICAgICAgICBpc0xvb3Bpbmc6IGZhbHNlXG4gICAgICAgIEBvcHRpb25zID0gdXRpbC5tZXJnZShkZWZhdWx0T3B0aW9ucywgb3B0aW9ucylcblxuICAgICAgICB1bmxlc3Mgc3ByaXRlXG4gICAgICAgICAgICAgdGhyb3cgJ01pc3NpbmcgYW5pbWF0aW9uIHNwcml0ZSdcbiAgICAgICAgQHNwcml0ZSA9IHNwcml0ZVxuXG4gICAgICAgIEBmcmFtZVRpbWVMZWZ0ID0gMCAjIFRpbWUgbGVmdCBvbiBjdXJyZW50IGFuaW1hdGlvbiBmcmFtZVxuICAgICAgICBAZnJhbWVOdW0gPSAwICMgQ3VycmVudCBhbmltYXRpb24gZnJhbWVcbiAgICAgICAgQG5hbWUgPSBvcHRpb25zLm5hbWVcblxuICAgICAgICBAZnJhbWVzID0gW11cbiAgICAgICAgZm9yIGZyYW1lRGF0YSBpbiBAb3B0aW9ucy5mcmFtZXNcbiAgICAgICAgICAgIEBhZGRGcmFtZShmcmFtZURhdGEpXG5cblxuICAgIGFkZEZyYW1lOiAoZnJhbWUpIC0+ICMgQW5pbWF0aW9uOjphZGRGcmFtZVxuICAgICAgICB1bmxlc3MgZnJhbWUgaW5zdGFuY2VvZiBGcmFtZVxuICAgICAgICAgICAgZnJhbWUgPSBuZXcgRnJhbWUoZnJhbWUpXG5cbiAgICAgICAgdW5sZXNzIGZyYW1lIGluc3RhbmNlb2YgRnJhbWVcbiAgICAgICAgICAgIHRocm93ICdBbmltYXRpb246OmFkZEZyYW1lIC0gTWlzc2luZyBGcmFtZSdcblxuICAgICAgICBAZnJhbWVzLnB1c2ggZnJhbWVcblxuXG4gICAgYWR2YW5jZTogKGN5Y2xlTGVuZ3RoKSAtPiAjIEFuaW1hdGlvbjo6YWR2YW5jZVxuICAgICAgICBtYXhGcmFtZSA9IEBmcmFtZXMubGVuZ3RoIC0gMVxuICAgICAgICBAZnJhbWVOdW0gPSBNYXRoLm1pbihAZnJhbWVOdW0sIG1heEZyYW1lKVxuICAgICAgICBAZnJhbWVUaW1lTGVmdCAtPSBjeWNsZUxlbmd0aFxuICAgICAgICB3aGlsZSBAZnJhbWVUaW1lTGVmdCA8IDBcbiAgICAgICAgICAgIEBmcmFtZU51bSsrXG4gICAgICAgICAgICBpZiBAZnJhbWVOdW0gPiBtYXhGcmFtZVxuICAgICAgICAgICAgICAgIGlmIEBvcHRpb25zLmlzTG9vcGluZyAgdGhlbiBAZnJhbWVOdW0gPSAwIGVsc2UgQGZyYW1lTnVtLS1cbiAgICAgICAgICAgIEBmcmFtZVRpbWVMZWZ0ID0gQGZyYW1lc1tAZnJhbWVOdW1dLmRhdGFbNl0gKyBAZnJhbWVUaW1lTGVmdFxuXG5cbiAgICBqdW1wVG9GcmFtZTogKGZyYW1lTnVtKSAtPiAjIEFuaW1hdGlvbjo6anVtcFRvRnJhbWVcbiAgICAgICAgZnJhbWVOdW0gPj4gMFxuICAgICAgICBmcmFtZU51bSA9IE1hdGgubWluKGZyYW1lTnVtLCBAZnJhbWVzLmxlbmd0aCAtIDEpXG4gICAgICAgIGZyYW1lTnVtID0gTWF0aC5tYXgoZnJhbWVOdW0sIDApXG4gICAgICAgIEBmcmFtZU51bSA9IGZyYW1lTnVtXG4gICAgICAgIEBmcmFtZVRpbWVMZWZ0ID0gQGZyYW1lc1tmcmFtZU51bV0uZGF0YVs2XVxuXG5cbiAgICBnZXRDdXJyZW50RnJhbWU6IC0+ICMgQW5pbWF0aW9uOjpnZXRDdXJyZW50RnJhbWVcbiAgICAgICAgcmV0dXJuIEBmcmFtZXNbQGZyYW1lTnVtXVxuIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxudXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEZyYW1lXG5cbiAgICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+ICMgRnJhbWU6OmNvbnN0cnVjdG9yXG4gICAgICAgIGRlZmF1bHREYXRhID1cbiAgICAgICAgICAgIHg6IDBcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgIHc6IDE2XG4gICAgICAgICAgICBoOiAxNlxuICAgICAgICAgICAgb2Zmc2V0WDogMFxuICAgICAgICAgICAgb2Zmc2V0WTogMFxuICAgICAgICAgICAgZHVyYXRpb246IDIwMFxuICAgICAgICBkYXRhID0gdXRpbC5tZXJnZShkZWZhdWx0RGF0YSwgZGF0YSlcbiAgICAgICAgQGRhdGEgPSBbZGF0YS54LCBkYXRhLnksIGRhdGEudywgZGF0YS5oLCBkYXRhLm9mZnNldFgsIGRhdGEub2Zmc2V0WSwgZGF0YS5kdXJhdGlvbl1cbiIsIiMjIyBDb3B5cmlnaHQgKGMpIDIwMTUgTWFnbnVzIExlby4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gIyMjXG5cbmNvcmUgPSByZXF1aXJlKCcuL2NvcmUnKVxuYmFja2dyb3VuZCA9IHJlcXVpcmUoJy4vYmFja2dyb3VuZCcpXG5sYXllcnMgPSByZXF1aXJlKCcuL2xheWVycycpXG52aWV3ID0gcmVxdWlyZSgnLi92aWV3JylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTGF5ZXJcblxuICAgIGNvbnN0cnVjdG9yOiAocHJvcGVydGllcykgLT4gIyBMYXllcjo6Y29uc3RydWN0b3JcbiAgICAgICAgIyBEZWZhdWx0c1xuICAgICAgICBAc3ByaXRlc2hlZXQgPSAnJyAjIE5hbWUgb2YgdGhlIHNwcml0ZXNoZWV0IGZpbGVcbiAgICAgICAgQGNodW5rcyA9IFtcbiAgICAgICAgICAgIGNodW5rT2Zmc2V0WDogMFxuICAgICAgICAgICAgY2h1bmtPZmZzZXRZOiAwXG4gICAgICAgICAgICBjb2xCb3hlczogW10gIyBbdGwxLHRyMSxibDEsYnIxLCAuLi4gdGxuLHRybixibG4sYnJuXVxuICAgICAgICAgICAgdGlsZU9mZnNldFg6IDAgIyBOdW1iZXIgb2YgdGlsZXMgb2Zmc2V0IGluIFhcbiAgICAgICAgICAgIHRpbGVPZmZzZXRZOiAwICMgTnVtYmVyIG9mIHRpbGVzIG9mZnNldCBpbiBZXG4gICAgICAgICAgICB0aWxlczpbXSAjIFRpbGUgc3ByaXRlIHBvc2l0aW9ucyBbeDEseTEsIC4uLiB4biwgeW5dIC0xIGlzIG5vdGhpbmcvdHJhbnNwYXJlbnRcbiAgICAgICAgXVxuICAgICAgICBAaXNMb29waW5nID0gZmFsc2VcbiAgICAgICAgQHBhcmFsbGF4ID0gMS4wXG5cbiAgICAgICAgIyBVc2VyIGRlZmluZWQgcHJvcGVydGllc1xuICAgICAgICBmb3Iga2V5LCB2YWwgb2YgcHJvcGVydGllc1xuICAgICAgICAgICAgQFtrZXldID0gdmFsXG4gICAgICAgIEBzcHJpdGVJbWcgPSBsYXllcnMuZ2V0SW1nIEBzcHJpdGVzaGVldFxuICAgICAgICBsYXllciA9IHRoaXNcbiAgICAgICAgQHNwcml0ZUltZy5hZGRFdmVudExpc3RlbmVyICdsb2FkJywgLT5cbiAgICAgICAgICAgIGlmIG5vdCBsYXllci5jaHVua3NcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGZvciBjaHVuayBpbiBsYXllci5jaHVua3NcbiAgICAgICAgICAgICAgICBjaHVuay5yZWRyYXcoKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgQGxheWVyTnVtVGlsZXNYID0gMFxuICAgICAgICBmb3IgY2h1bmssIGkgaW4gQGNodW5rc1xuICAgICAgICAgICAgQGNodW5rc1tpXSA9IG5ldyBDaHVuayh0aGlzLCBjaHVuaylcbiAgICAgICAgICAgIEBsYXllck51bVRpbGVzWCArPSBjaHVuay50aWxlcy5sZW5ndGggKyBjaHVuay50aWxlT2Zmc2V0WFxuXG5cbiAgICBkcmF3OiAtPiAjIExheWVyOjpkcmF3XG4gICAgICAgIGlmIEBpc0xvb3BpbmdcbiAgICAgICAgICAgIGNodW5rID0gQGNodW5rc1swXVxuICAgICAgICAgICAgcG9zWCA9IHZpZXcucG9zVG9QeChjaHVuay50aWxlT2Zmc2V0WCArIGNodW5rLmNodW5rT2Zmc2V0WCwgJ3gnLCBAcGFyYWxsYXgpXG4gICAgICAgICAgICBtdWx0aXBsaWVyID0gKCh2aWV3LmNhbWVyYVBvc1ggLyBAbGF5ZXJOdW1UaWxlc1ggKiBAcGFyYWxsYXgpID4+IDApIC0gMVxuICAgICAgICAgICAgcG9zWCArPSBAbGF5ZXJOdW1UaWxlc1ggKiBiYWNrZ3JvdW5kLnRpbGVTaXplICogbXVsdGlwbGllclxuICAgICAgICAgICAgd2hpbGUgcG9zWCA8IGNvcmUuY2FtV1xuICAgICAgICAgICAgICAgIGZvciBjaHVuayBpbiBAY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgIHBvc1kgPSB2aWV3LnBvc1RvUHgoY2h1bmsudGlsZU9mZnNldFkgKyBjaHVuay5jaHVua09mZnNldFksICd5JylcbiAgICAgICAgICAgICAgICAgICAgY2h1bmsuZHJhdyhwb3NYLCBwb3NZKVxuICAgICAgICAgICAgICAgICAgICBwb3NYICs9IGNodW5rLmRyYXdCdWZmZXIud2lkdGggKyBjaHVuay50aWxlT2Zmc2V0WFB4XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZvciBjaHVuayBpbiBAY2h1bmtzXG4gICAgICAgICAgICAgICAgcG9zWCA9IHZpZXcucG9zVG9QeChjaHVuay50aWxlT2Zmc2V0WCArIGNodW5rLmNodW5rT2Zmc2V0WCwgJ3gnLCBAcGFyYWxsYXgpXG4gICAgICAgICAgICAgICAgcG9zWSA9IHZpZXcucG9zVG9QeChjaHVuay50aWxlT2Zmc2V0WSArIGNodW5rLmNodW5rT2Zmc2V0WSwgJ3knKVxuICAgICAgICAgICAgICAgIGNodW5rLmRyYXcocG9zWCwgcG9zWSlcbiAgICAgICAgcmV0dXJuXG5cblxuICAgIGdldFRpbGU6ICh0aWxlWCwgdGlsZVksIG9mZnNldFggPSAwLCBvZmZzZXRZID0gMCkgLT4gIyBMYXllcjo6Z2V0VGlsZVxuICAgICAgICBjaHVua05vID0gTWF0aC5mbG9vcigodGlsZVggKyBvZmZzZXRYKSAvIEBjaHVua3NbMF0ud2lkdGgpXG4gICAgICAgIGlmIGNodW5rTm8gPCAwIG9yIGNodW5rTm8gPiBAY2h1bmtzLmxlbmd0aCAtIDFcbiAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICBjaHVuayA9IEBjaHVua3NbY2h1bmtOb11cbiAgICAgICAgeCA9IHRpbGVYIC0gY2h1bmsudGlsZU9mZnNldFggKyBvZmZzZXRYIC0gY2h1bmsud2lkdGggKiBjaHVua05vXG4gICAgICAgIHkgPSB0aWxlWSAtIGNodW5rLnRpbGVPZmZzZXRZICsgb2Zmc2V0WVxuXG4gICAgICAgIGlmIDAgPiB4ID4gY2h1bmsud2lkdGggb3JcbiAgICAgICAgMCA+IHkgPiBjaHVuay53aWR0aFxuICAgICAgICAgICAgcmV0dXJuIC0xXG5cbiAgICAgICAgcmV0dXJuIGNodW5rLnRpbGVzW3ggKyB5ICogY2h1bmsud2lkdGhdIG9yIC0xXG5cblxuICAgIHNldFRpbGU6ICh0aWxlWCwgdGlsZVksIHRpbGUpIC0+ICMgTGF5ZXI6OnNldFRpbGVcbiAgICAgICAgY2h1bmtObyA9ICh0aWxlWCAvIEBjaHVua3NbMF0ud2lkdGgpID4+IDBcbiAgICAgICAgY2h1bmsgPSBAY2h1bmtzW2NodW5rTm9dXG4gICAgICAgIGNodW5rLmRyYXdCdWZmZXJEaXJ0eSA9IHRydWVcbiAgICAgICAgeCA9IHRpbGVYIC0gY2h1bmsudGlsZU9mZnNldFggLSBjaHVuay53aWR0aCAqIGNodW5rTm9cbiAgICAgICAgeSA9IHRpbGVZIC0gY2h1bmsudGlsZU9mZnNldFlcbiAgICAgICAgY2h1bmsudGlsZXNbeCArIHkgKiBjaHVuay53aWR0aF0gPSB0aWxlXG5cblxuICAgIHNlcmlhbGl6ZTogLT4gIyBMYXllcjo6c2VyaWFsaXplXG4gICAgICAgICMgRGF0YSBmb3JtYXQ6XG4gICAgICAgICMge3R5cGV9e2xlbmd0aH17ZGF0YX0uLi5cbiAgICAgICAgZGF0YSA9ICcnXG4gICAgICAgIGZvciBjaHVuayBpbiBAY2h1bmtzXG4gICAgICAgICAgICBkYXRhICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY29yZS5EQVRBX1RZUEVTLkNIVU5LKVxuICAgICAgICAgICAgY2h1bmtEYXRhID0gY2h1bmsuc2VyaWFsaXplKClcbiAgICAgICAgICAgIGRhdGEgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjaHVua0RhdGEubGVuZ3RoKSArIGNodW5rRGF0YVxuICAgICAgICByZXR1cm4gZGF0YVxuXG5cbiAgICBkZXNlcmlhbGl6ZTogKGRhdGEpIC0+ICMgTGF5ZXI6OmRlc2VyaWFsaXplXG4gICAgICAgIGNodW5rT2Zmc2V0WCA9IDBcbiAgICAgICAgQGNodW5rcy5sZW5ndGggPSAwXG4gICAgICAgIHQgPSBjb3JlLkRBVEFfVFlQRVNcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IGRhdGEubGVuZ3RoXG4gICAgICAgICAgICBsZW5ndGggPSBkYXRhLmNoYXJDb2RlQXQoaSArIDEpXG4gICAgICAgICAgICBzd2l0Y2ggZGF0YS5jaGFyQ29kZUF0KGkpXG4gICAgICAgICAgICAgICAgd2hlbiB0LkNIVU5LXG4gICAgICAgICAgICAgICAgICAgICNUT0RPOiBTdG9yZSBhbmQgcmVhZCBjaHVuayBtZXRhZGF0YVxuICAgICAgICAgICAgICAgICAgICBudW1DaHVua3MgPSBAY2h1bmtzLnB1c2ggbmV3IENodW5rIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMzBcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogMTdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rT2Zmc2V0WDogY2h1bmtPZmZzZXRYXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua09mZnNldFk6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbGVPZmZzZXRYOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWxlT2Zmc2V0WTogMTNcbiAgICAgICAgICAgICAgICAgICAgQGNodW5rc1tudW1DaHVua3MgLSAxXS5kZXNlcmlhbGl6ZShkYXRhLnN1YnN0cihpICsgMiwgbGVuZ3RoKSlcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtPZmZzZXRYICs9IDMwXG4gICAgICAgICAgICBpICs9IDIgKyBsZW5ndGhcblxuXG5cbmNsYXNzIENodW5rXG5cbiAgICBjb25zdHJ1Y3RvcjogKGxheWVyLCBkYXRhKSAtPiAjIENodW5rOjpjb25zdHJ1Y3RvclxuICAgICAgICBAdGlsZXMgPSBbXVxuICAgICAgICBmb3IgbmFtZSwgZGF0dW0gb2YgZGF0YVxuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IGRhdHVtXG5cbiAgICAgICAgQGxheWVyID0gbGF5ZXJcblxuICAgICAgICBAZHJhd0J1ZmZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2NhbnZhcydcbiAgICAgICAgQGRyYXdCdWZmZXJDdHggPSBAZHJhd0J1ZmZlci5nZXRDb250ZXh0ICcyZCdcbiAgICAgICAgQGRyYXdCdWZmZXJEaXJ0eSA9IHRydWVcbiAgICAgICAgQGRyYXdCdWZmZXIud2lkdGggPSBAd2lkdGggKiBiYWNrZ3JvdW5kLnRpbGVTaXplXG4gICAgICAgIEBkcmF3QnVmZmVyLmhlaWdodCA9ICgoQHRpbGVzLmxlbmd0aCAvIEB3aWR0aCkgPj4gMCkgKiBiYWNrZ3JvdW5kLnRpbGVTaXplXG4gICAgICAgIEB0aWxlT2Zmc2V0WFB4ID0gQHRpbGVPZmZzZXRYICogYmFja2dyb3VuZC50aWxlU2l6ZVxuXG5cbiAgICBkcmF3OiAocG9zWCwgcG9zWSkgLT4gIyBDaHVuazo6ZHJhd1xuICAgICAgICAjIERvbid0IGRyYXcgY2h1bmtzIG91dCBvZiB2aWV3XG4gICAgICAgIGlmIHBvc1ggPCAtQGRyYXdCdWZmZXIud2lkdGggb3IgcG9zWCA+IGNvcmUuY2FtVyBvclxuICAgICAgICBwb3NZIDwgLUBkcmF3QnVmZmVyLmhlaWdodCBvciBwb3NZID4gY29yZS5jYW1IXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBpZiBAZHJhd0J1ZmZlckRpcnR5XG4gICAgICAgICAgICAjIFJlZHJhdyBjaHVua1xuICAgICAgICAgICAgQGRyYXdCdWZmZXJDdHguY2xlYXJSZWN0KDAsIDAsIEBkcmF3QnVmZmVyLndpZHRoLCBAZHJhd0J1ZmZlci5oZWlnaHQpXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uQHRpbGVzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICB4ID0gaSAlIEB3aWR0aFxuICAgICAgICAgICAgICAgIHkgPSAoKGkgLyBAd2lkdGgpID4+IDApXG4gICAgICAgICAgICAgICAgQGRyYXdUaWxlIEBkcmF3QnVmZmVyQ3R4LFxuICAgICAgICAgICAgICAgICAgICBAdGlsZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgIHggKiBiYWNrZ3JvdW5kLnRpbGVTaXplLFxuICAgICAgICAgICAgICAgICAgICAoeSArIEBjaHVua09mZnNldFkpICogYmFja2dyb3VuZC50aWxlU2l6ZSxcblxuICAgICAgICAgICAgQGRyYXdCdWZmZXJEaXJ0eSA9IGZhbHNlXG5cbiAgICAgICAgY29yZS5mcmFtZUJ1ZmZlckN0eC5kcmF3SW1hZ2UgQGRyYXdCdWZmZXIsXG4gICAgICAgICAgICAwLCAjIFNvdXJjZSBYXG4gICAgICAgICAgICAwLCAjIFNvdXJjZSBZXG4gICAgICAgICAgICBAZHJhd0J1ZmZlci53aWR0aCwgIyBTb3VyY2Ugd2lkdGhcbiAgICAgICAgICAgIEBkcmF3QnVmZmVyLmhlaWdodCwgIyBTb3VyY2UgaGVpZ2h0XG4gICAgICAgICAgICBwb3NYLCAjIERlc3Rpb25hdGlvbiBYXG4gICAgICAgICAgICBwb3NZLCAjIERlc3Rpb25hdGlvbiBZXG4gICAgICAgICAgICBAZHJhd0J1ZmZlci53aWR0aCwgIyBEZXN0aW5hdGlvbiB3aWR0aFxuICAgICAgICAgICAgQGRyYXdCdWZmZXIuaGVpZ2h0LCAjIERlc3RpbmF0aW9uIGhlaWdodFxuXG5cbiAgICByZWRyYXc6IC0+ICMgQ2h1bms6OnJlZHJhd1xuICAgICAgICBAZHJhd0J1ZmZlckRpcnR5ID0gdHJ1ZVxuXG5cbiAgICBkcmF3VGlsZTogKGN0eCwgc3ByaXRlTiwgcG9zWCwgcG9zWSkgLT4gIyBDaHVuazo6ZHJhd1RpbGVcbiAgICAgICAgaWYgc3ByaXRlTiA9PSAtMSB0aGVuIHJldHVyblxuICAgICAgICB0aWxlU2l6ZSA9IGJhY2tncm91bmQudGlsZVNpemVcbiAgICAgICAgc3ByaXRlV2lkdGggPSAxNlxuICAgICAgICBzcHJpdGVYID0gc3ByaXRlTiAlIHNwcml0ZVdpZHRoICNUT0RPOiBNYWtlIFNwcml0ZSBjbGFzcyB3aXRoIHByb3BlcnRpZXNcbiAgICAgICAgc3ByaXRlWSA9IChzcHJpdGVOIC8gc3ByaXRlV2lkdGgpID4+IDAgI1RPRE86IE1ha2UgU3ByaXRlIGNsYXNzIHdpdGggcHJvcGVydGllc1xuXG4gICAgICAgIGN0eC5kcmF3SW1hZ2UgQGxheWVyLnNwcml0ZUltZyxcbiAgICAgICAgICAgIHNwcml0ZVggKiB0aWxlU2l6ZSxcbiAgICAgICAgICAgIHNwcml0ZVkgKiB0aWxlU2l6ZSxcbiAgICAgICAgICAgIHRpbGVTaXplLCAjIFNvdXJjZSB3aWR0aFxuICAgICAgICAgICAgdGlsZVNpemUsICMgU291cmNlIGhlaWdodFxuICAgICAgICAgICAgcG9zWCA+PiAwLFxuICAgICAgICAgICAgcG9zWSA+PiAwLFxuICAgICAgICAgICAgdGlsZVNpemUsICMgRGVzdGluYXRpb24gd2lkdGhcbiAgICAgICAgICAgIHRpbGVTaXplLCAjIERlc3RpbmF0aW9uIGhlaWdodFxuXG5cbiAgICBzZXJpYWxpemU6IC0+ICMgQ2h1bms6OnNlcmlhbGl6ZVxuICAgICAgICBkYXRhID0gJydcbiAgICAgICAgZm9yIHRpbGUgaW4gQHRpbGVzXG4gICAgICAgICAgICBkYXRhICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodGlsZSArIDEpICMgKzEgdG8gbWFrZSAtMSAtPiAwLiBXZSBjYW4ndCBzdG9yZSBuZWdhdGl2ZSBudW1iZXJzLlxuICAgICAgICByZXR1cm4gZGF0YVxuICAgICAgICAjVE9ETzogQ29tcHJlc3MgY29uc2VjdXRpdmUgaWRlbnRpY2FsIHRpbGVzXG5cblxuICAgIGRlc2VyaWFsaXplOiAoZGF0YSkgLT4gIyBDaHVuazo6ZGVzZXJpYWxpemVcbiAgICAgICAgQGRyYXdCdWZmZXJEaXJ0eSA9IHRydWVcbiAgICAgICAgQHRpbGVzLmxlbmd0aCA9IDBcbiAgICAgICAgZm9yIGkgaW4gWzAuLmRhdGEubGVuZ3RoXVxuICAgICAgICAgICAgQHRpbGVzLnB1c2ggZGF0YS5jaGFyQ29kZUF0KGkpIC0gMSAgIyAtMSB0byByZXZlcnNlICsxIGZyb20gQ2h1bms6OnNlcmlhbGl6ZVxuICAgICAgICBAZHJhd0J1ZmZlci5oZWlnaHQgPSAoKEB0aWxlcy5sZW5ndGggLyBAd2lkdGgpID4+IDApICogYmFja2dyb3VuZC50aWxlU2l6ZVxuIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxuU2hhcGUgPSByZXF1aXJlKCcuL1NoYXBlJylcbnV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKVxuY29yZSA9IHJlcXVpcmUoJy4vY29yZScpXG52aWV3ID0gcmVxdWlyZSgnLi92aWV3JylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTGluZSBleHRlbmRzIFNoYXBlXG5cbiAgICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+ICMgU2hhcGU6OmNvbnN0cnVjdG9yXG4gICAgICAgIGRlZmF1bHREYXRhID1cbiAgICAgICAgICAgIHgyOiAwXG4gICAgICAgICAgICB5MjogMFxuICAgICAgICBkYXRhID0gdXRpbC5tZXJnZShkZWZhdWx0RGF0YSwgZGF0YSlcbiAgICAgICAgc3VwZXIoZGF0YSlcblxuXG4gICAgZHJhdzogLT4gIyBMaW5lOjpkcmF3XG4gICAgICAgIHVubGVzcyBzdXBlclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIGNvcmUuZnJhbWVCdWZmZXJDdHguYmVnaW5QYXRoKClcbiAgICAgICAgY29yZS5mcmFtZUJ1ZmZlckN0eC5tb3ZlVG8gQGRyYXdYLCBAZHJhd1lcbiAgICAgICAgY29yZS5mcmFtZUJ1ZmZlckN0eC5saW5lVG8oIHZpZXcucG9zVG9QeChAeDIsICd4JyksIHZpZXcucG9zVG9QeChAeTIsICd5JykgKVxuICAgICAgICBjb3JlLmZyYW1lQnVmZmVyQ3R4LmNsb3NlUGF0aCgpXG4gICAgICAgIGNvcmUuZnJhbWVCdWZmZXJDdHguc3Ryb2tlKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiIsIiMjIyBDb3B5cmlnaHQgKGMpIDIwMTUgTWFnbnVzIExlby4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gIyMjXG5cbkFjdG9yID0gcmVxdWlyZSgnLi9BY3RvcicpXG5jb2xsaXNpb24gPSByZXF1aXJlKCcuL2NvbGxpc2lvbicpXG5lbnZpcm9ubWVudCA9IHJlcXVpcmUoJy4vZW52aXJvbm1lbnQnKVxuZXZlbnQgPSByZXF1aXJlKCcuL2V2ZW50JylcbmlvID0gcmVxdWlyZSgnLi9pbycpXG5sYXllcnMgPSByZXF1aXJlKCcuL2xheWVycycpXG51dGlsID0gcmVxdWlyZSgnLi91dGlsJylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQWN0b3JcblxuICAgIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT4gIyBQbGF5ZXI6OmNvbnN0cnVjdG9yXG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgQGFjY1ggPSAwXG4gICAgICAgIEBkaXJQaHlzaWNhbCA9IDBcbiAgICAgICAgQGRpclZpc3VhbCA9IDFcbiAgICAgICAgQHN0YXRlID0gbmV3IFBsYXllclN0YXRlU3RhbmRpbmcodGhpcylcbiAgICAgICAgQHN0YXRlQmVmb3JlID0gbnVsbFxuXG5cbiAgICBzZXRTdGF0ZTogKHN0YXRlKSAtPiAjIFBsYXllcjo6c2V0U3RhdGVcbiAgICAgICAgaWYgQHN0YXRlIGluc3RhbmNlb2Ygc3RhdGVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBAc3RhdGVCZWZvcmUgPSBAc3RhdGVcbiAgICAgICAgQHN0YXRlID0gbmV3IHN0YXRlKHRoaXMpXG5cblxuICAgIHN0YXRlSXM6IChzdGF0ZSkgLT4gIyBQbGF5ZXI6OnN0YXRlSXNcbiAgICAgICAgcmV0dXJuIEBzdGF0ZSBpbnN0YW5jZW9mIHN0YXRlXG5cblxuICAgIGhhbmRsZUlucHV0OiAoZSkgLT4gIyBQbGF5ZXI6OmhhbmRsZUlucHV0XG4gICAgICAgIEBzdGF0ZS5oYW5kbGVJbnB1dChlKVxuXG5cbiAgICB1cGRhdGU6IChjeWNsZUxlbmd0aCkgLT4gIyBQbGF5ZXI6OnVwZGF0ZVxuICAgICAgICBAc3BlZWRZICs9IGVudmlyb25tZW50LmdyYXZpdHkgKiBjeWNsZUxlbmd0aFxuICAgICAgICBAc3BlZWRYICs9IEBhY2NYICogY3ljbGVMZW5ndGhcbiAgICAgICAgQHNwZWVkWCA9IE1hdGgubWluKEBzcGVlZFgsIEBzcGVlZFhNYXgpXG4gICAgICAgIEBzcGVlZFggPSBNYXRoLm1heChAc3BlZWRYLCAtQHNwZWVkWE1heClcblxuICAgICAgICBzdXBlcihjeWNsZUxlbmd0aClcbiAgICAgICAgQHN0YXRlLnVwZGF0ZShjeWNsZUxlbmd0aClcblxuICAgICAgICBjb2xsaXNpb25zID0gY29sbGlzaW9uLmFjdG9yVG9MYXllciB0aGlzLCBsYXllcnMuZ2V0KCdncm91bmQnKSxcbiAgICAgICAgICAgIHJlcG9zaXRpb246IHRydWVcblxuICAgICAgICAjIFVwZGF0ZSBwbGF5ZXIgc3RhdGVcbiAgICAgICAgaWYgY29sbGlzaW9ucy5ib3R0b21cbiAgICAgICAgICAgIGlmIEBkaXJQaHlzaWNhbCA9PSAwXG4gICAgICAgICAgICAgICAgQHNldFN0YXRlIFBsYXllclN0YXRlU3RhbmRpbmdcbiAgICAgICAgICAgICAgICBAZGVjZWxlcmF0ZSgneCcsIGNvbGxpc2lvbnMuZnJpY3Rpb24gKiBAZGVjZWxlcmF0aW9uR3JvdW5kICogY3ljbGVMZW5ndGgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHNldFN0YXRlIFBsYXllclN0YXRlUnVubmluZ1xuICAgICAgICBlbHNlIGlmIG5vdCBAc3RhdGVJcyBQbGF5ZXJTdGF0ZUp1bXBpbmdcbiAgICAgICAgICAgIEBzZXRTdGF0ZSBQbGF5ZXJTdGF0ZUZhbGxpbmdcbiAgICAgICAgICAgIGlmIEBkaXJQaHlzaWNhbCA9PSAwXG4gICAgICAgICAgICAgICAgQGRlY2VsZXJhdGUoJ3gnLCBAZGVjZWxlcmF0aW9uQWlyICogY3ljbGVMZW5ndGgpXG5cblxuXG4jIFBsYXllclN0YXRlXG4jIHxcbiMgfF9fUGxheWVyU3RhdGVBaXJcbiMgfCAgIHxfX1BsYXllclN0YXRlSnVtcGluZ1xuIyB8XG4jIHxfX1BsYXllclN0YXRlR3JvdW5kXG4jICAgICB8X19QbGF5ZXJTdGF0ZVN0YW5kaW5nXG4jICAgICB8X19QbGF5ZXJTdGF0ZVJ1bm5pbmdcblxuUGxheWVyU3RhdGUgPVxuY2xhc3MgUGxheWVyU3RhdGVcblxuICAgIGNvbnN0cnVjdG9yOiAoQHBhcmVudCkgLT4gIyBQbGF5ZXJTdGF0ZTo6Y29uc3RydWN0b3JcblxuXG4gICAgaGFuZGxlSW5wdXQ6IChlKSAtPiAjIFBsYXllclN0YXRlOjpoYW5kbGVJbnB1dFxuICAgICAgICBrZXkgPSB1dGlsLktFWV9DT0RFU1xuICAgICAgICBzd2l0Y2ggZS5rZXlDb2RlXG5cbiAgICAgICAgICAgIHdoZW4ga2V5LkxFRlRcbiAgICAgICAgICAgICAgICBAcGFyZW50LmRpclBoeXNpY2FsID0gLTFcbiAgICAgICAgICAgICAgICBAcGFyZW50LmRpclZpc3VhbCA9IC0xXG5cbiAgICAgICAgICAgIHdoZW4ga2V5LlJJR0hUXG4gICAgICAgICAgICAgICAgQHBhcmVudC5kaXJQaHlzaWNhbCA9IDFcbiAgICAgICAgICAgICAgICBAcGFyZW50LmRpclZpc3VhbCA9IDFcblxuXG4gICAgdXBkYXRlOiAoY3ljbGVMZW5ndGgpIC0+ICMgUGxheWVyU3RhdGU6OnVwZGF0ZVxuXG5cblxuUGxheWVyU3RhdGVHcm91bmQgPVxuY2xhc3MgUGxheWVyU3RhdGVHcm91bmQgZXh0ZW5kcyBQbGF5ZXJTdGF0ZVxuXG4gICAgY29uc3RydWN0b3I6IChkYXRhKSAtPiAjIFBsYXllclN0YXRlR3JvdW5kOjpjb25zdHJ1Y3RvclxuICAgICAgICBzdXBlcihkYXRhKVxuXG5cbiAgICBoYW5kbGVJbnB1dDogKGUpIC0+ICMgUGxheWVyU3RhdGVHcm91bmQ6OmhhbmRsZUlucHV0XG4gICAgICAgIHN1cGVyKGUpXG4gICAgICAgIGtleSA9IHV0aWwuS0VZX0NPREVTXG5cbiAgICAgICAgaWYgZS50eXBlIGlzICdrZXlkb3duJ1xuICAgICAgICAgICAgc3dpdGNoIGUua2V5Q29kZVxuICAgICAgICAgICAgICAgIHdoZW4ga2V5LlVQLCBrZXkuWlxuICAgICAgICAgICAgICAgICAgICBAcGFyZW50LnNldFN0YXRlIFBsYXllclN0YXRlSnVtcGluZ1xuXG5cblxuUGxheWVyU3RhdGVTdGFuZGluZyA9XG5jbGFzcyBQbGF5ZXJTdGF0ZVN0YW5kaW5nIGV4dGVuZHMgUGxheWVyU3RhdGVHcm91bmRcblxuICAgIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT4gIyBQbGF5ZXJTdGF0ZVN0YW5kaW5nOjpjb25zdHJ1Y3RvclxuICAgICAgICBzdXBlcihkYXRhKVxuXG4gICAgICAgIEBwYXJlbnQuYWNjWCA9IDBcblxuICAgICAgICBpZiBAcGFyZW50LmRpclZpc3VhbCA+IDBcbiAgICAgICAgICAgIEBwYXJlbnQuc3ByaXRlLnNldEFuaW1hdGlvbiAnc3RhbmRpbmdSaWdodCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHBhcmVudC5zcHJpdGUuc2V0QW5pbWF0aW9uICdzdGFuZGluZ0xlZnQnXG5cblxuICAgIGhhbmRsZUlucHV0OiAoZSkgLT4gIyBQbGF5ZXJTdGF0ZVN0YW5kaW5nOjpoYW5kbGVJbnB1dFxuICAgICAgICBzdXBlcihlKVxuICAgICAgICBrZXkgPSB1dGlsLktFWV9DT0RFU1xuXG4gICAgICAgIGlmIGUudHlwZSBpcyAna2V5ZG93bidcbiAgICAgICAgICAgIHN3aXRjaCBlLmtleUNvZGVcbiAgICAgICAgICAgICAgICB3aGVuIGtleS5MRUZULCBrZXkuUklHSFRcbiAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5zZXRTdGF0ZSBQbGF5ZXJTdGF0ZVJ1bm5pbmdcblxuXG5cblBsYXllclN0YXRlUnVubmluZyA9XG5jbGFzcyBQbGF5ZXJTdGF0ZVJ1bm5pbmcgZXh0ZW5kcyBQbGF5ZXJTdGF0ZUdyb3VuZFxuXG4gICAgY29uc3RydWN0b3I6IChkYXRhKSAtPiAjIFBsYXllclN0YXRlUnVubmluZzo6Y29uc3RydWN0b3JcbiAgICAgICAgc3VwZXIoZGF0YSlcbiAgICAgICAgQF9zZXRTcGVlZEFuZEFuaW0oKVxuXG4gICAgICAgIGlmIEBwYXJlbnQuc3RhdGVCZWZvcmUgaW5zdGFuY2VvZiBQbGF5ZXJTdGF0ZUFpclxuICAgICAgICAgICAgQHBhcmVudC5zcHJpdGUuZ2V0Q3VycmVudEFuaW1hdGlvbigpLmp1bXBUb0ZyYW1lKDEpXG5cblxuICAgIGhhbmRsZUlucHV0OiAoZSkgLT4gIyBQbGF5ZXJTdGF0ZVJ1bm5pbmc6OmhhbmRsZUlucHV0XG4gICAgICAgIHN1cGVyKGUpXG4gICAgICAgIGtleSA9IHV0aWwuS0VZX0NPREVTXG5cbiAgICAgICAgaWYgZS50eXBlIGlzICdrZXlkb3duJ1xuICAgICAgICAgICAgc3dpdGNoIGUua2V5Q29kZVxuICAgICAgICAgICAgICAgIHdoZW4ga2V5LkxFRlQsIGtleS5SSUdIVFxuICAgICAgICAgICAgICAgICAgICBAX3NldFNwZWVkQW5kQW5pbSgpXG5cbiAgICAgICAgZWxzZSBpZiBlLnR5cGUgaXMgJ2tleXVwJ1xuICAgICAgICAgICAgc3dpdGNoIGUua2V5Q29kZVxuICAgICAgICAgICAgICAgIHdoZW4ga2V5LkxFRlQsIGtleS5SSUdIVFxuICAgICAgICAgICAgICAgICAgICByaWdodFByZXNzZWQgPSBpby5pc0tleVByZXNzZWQoa2V5LlJJR0hUKVxuICAgICAgICAgICAgICAgICAgICBsZWZ0UHJlc3NlZCA9IGlvLmlzS2V5UHJlc3NlZChrZXkuTEVGVClcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGxlZnRQcmVzc2VkIGFuZCBub3QgcmlnaHRQcmVzc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICBAcGFyZW50LnNldFN0YXRlIFBsYXllclN0YXRlU3RhbmRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwYXJlbnQuZGlyUGh5c2ljYWwgPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICBAcGFyZW50LmFjY1ggPSAwXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbGVmdFByZXNzZWQgYW5kIG5vdCByaWdodFByZXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwYXJlbnQuZGlyUGh5c2ljYWwgPSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5kaXJWaXN1YWwgPSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgQF9zZXRTcGVlZEFuZEFuaW0geyBmcmFtZU51bTogMSB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgIyBpZiBub3QgbGVmdFByZXNzZWQgYW5kIHJpZ2h0UHJlc3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5kaXJQaHlzaWNhbCA9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwYXJlbnQuZGlyVmlzdWFsID0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgQF9zZXRTcGVlZEFuZEFuaW0geyBmcmFtZU51bTogMSB9XG5cblxuICAgIF9zZXRTcGVlZEFuZEFuaW06IChvcHRpb25zID0ge30pLT4gIyBQbGF5ZXJTdGF0ZVJ1bm5pbmc6Ol9zZXRTcGVlZEFuZEFuaW1cbiAgICAgICAgQHBhcmVudC5hY2NYID0gQHBhcmVudC5hY2NlbGVyYXRpb25Hcm91bmQgKiBAcGFyZW50LmRpclBoeXNpY2FsXG4gICAgICAgIGlmIEBwYXJlbnQuZGlyVmlzdWFsID4gMFxuICAgICAgICAgICAgQHBhcmVudC5zcHJpdGUuc2V0QW5pbWF0aW9uICdydW5uaW5nUmlnaHQnLCBvcHRpb25zLmZyYW1lTnVtXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBwYXJlbnQuc3ByaXRlLnNldEFuaW1hdGlvbiAncnVubmluZ0xlZnQnLCBvcHRpb25zLmZyYW1lTnVtXG5cblxuUGxheWVyU3RhdGVBaXIgPVxuY2xhc3MgUGxheWVyU3RhdGVBaXIgZXh0ZW5kcyBQbGF5ZXJTdGF0ZVxuXG4gICAgY29uc3RydWN0b3I6IChkYXRhKSAtPiAjIFBsYXllclN0YXRlQWlyOjpjb25zdHJ1Y3RvclxuICAgICAgICBzdXBlclxuXG4gICAgICAgIGlmIEBwYXJlbnQuZGlyVmlzdWFsID4gMFxuICAgICAgICAgICAgQHBhcmVudC5zcHJpdGUuc2V0QW5pbWF0aW9uICdqdW1waW5nUmlnaHQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBwYXJlbnQuc3ByaXRlLnNldEFuaW1hdGlvbiAnanVtcGluZ0xlZnQnXG5cblxuICAgIGhhbmRsZUlucHV0OiAoZSkgLT4gIyBQbGF5ZXJTdGF0ZUFpcjo6aGFuZGxlSW5wdXRcbiAgICAgICAgc3VwZXJcbiAgICAgICAga2V5ID0gdXRpbC5LRVlfQ09ERVNcblxuICAgICAgICBpZiBlLnR5cGUgaXMgJ2tleWRvd24nXG4gICAgICAgICAgICBzd2l0Y2ggZS5rZXlDb2RlXG4gICAgICAgICAgICAgICAgd2hlbiBrZXkuTEVGVCwga2V5LlJJR0hUXG4gICAgICAgICAgICAgICAgICAgIEBfc2V0U3BlZWRBbmRBbmltKClcblxuICAgICAgICBlbHNlIGlmIGUudHlwZSBpcyAna2V5dXAnXG4gICAgICAgICAgICBzd2l0Y2ggZS5rZXlDb2RlXG4gICAgICAgICAgICAgICAgd2hlbiBrZXkuTEVGVCwga2V5LlJJR0hUXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0UHJlc3NlZCA9IGlvLmlzS2V5UHJlc3NlZChrZXkuUklHSFQpXG4gICAgICAgICAgICAgICAgICAgIGxlZnRQcmVzc2VkID0gaW8uaXNLZXlQcmVzc2VkKGtleS5MRUZUKVxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgbGVmdFByZXNzZWQgYW5kIG5vdCByaWdodFByZXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwYXJlbnQuZGlyUGh5c2ljYWwgPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICBAcGFyZW50LmFjY1ggPSAwXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbGVmdFByZXNzZWQgYW5kIG5vdCByaWdodFByZXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwYXJlbnQuZGlyUGh5c2ljYWwgPSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5kaXJWaXN1YWwgPSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgQF9zZXRTcGVlZEFuZEFuaW0geyBmcmFtZU51bTogMSB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgIyBpZiBub3QgbGVmdFByZXNzZWQgYW5kIHJpZ2h0UHJlc3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5kaXJQaHlzaWNhbCA9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwYXJlbnQuZGlyVmlzdWFsID0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgQF9zZXRTcGVlZEFuZEFuaW0geyBmcmFtZU51bTogMSB9XG5cblxuICAgIF9zZXRTcGVlZEFuZEFuaW06IC0+ICMgUGxheWVyU3RhdGVBaXI6Ol9zZXRTcGVlZEFuZEFuaW1cbiAgICAgICAgQHBhcmVudC5hY2NYID0gQHBhcmVudC5hY2NlbGVyYXRpb25BaXIgKiBAcGFyZW50LmRpclBoeXNpY2FsXG4gICAgICAgIGlmIEBwYXJlbnQuZGlyVmlzdWFsID4gMFxuICAgICAgICAgICAgQHBhcmVudC5zcHJpdGUuc2V0QW5pbWF0aW9uICdqdW1waW5nUmlnaHQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBwYXJlbnQuc3ByaXRlLnNldEFuaW1hdGlvbiAnanVtcGluZ0xlZnQnXG5cblxuICAgIHVwZGF0ZTogKGN5Y2xlTGVuZ3RoKSAtPiAjIFBsYXllclN0YXRlQWlyOjp1cGRhdGVcbiAgICAgICAgc3VwZXJcblxuXG5cblBsYXllclN0YXRlSnVtcGluZyA9XG5jbGFzcyBQbGF5ZXJTdGF0ZUp1bXBpbmcgZXh0ZW5kcyBQbGF5ZXJTdGF0ZUFpclxuXG4gICAgY29uc3RydWN0b3I6IChkYXRhKSAtPiAjIFBsYXllclN0YXRlSnVtcGluZzo6Y29uc3RydWN0b3JcbiAgICAgICAgc3VwZXJcbiAgICAgICAgQHBhcmVudC5zcGVlZFkgPSAtMjFcblxuXG4gICAgaGFuZGxlSW5wdXQ6IChlKSAtPiAjIFBsYXllclN0YXRlSnVtcGluZzo6aGFuZGxlSW5wdXRcbiAgICAgICAgc3VwZXJcbiAgICAgICAga2V5ID0gdXRpbC5LRVlfQ09ERVNcblxuICAgICAgICBpZiBlLnR5cGUgaXMgJ2tleXVwJ1xuICAgICAgICAgICAgc3dpdGNoIGUua2V5Q29kZVxuICAgICAgICAgICAgICAgIHdoZW4ga2V5LlVQLCBrZXkuWlxuICAgICAgICAgICAgICAgICAgICBAcGFyZW50LnNwZWVkWSAqPSAwLjVcbiAgICAgICAgICAgICAgICAgICAgQHBhcmVudC5zZXRTdGF0ZSBQbGF5ZXJTdGF0ZUZhbGxpbmdcblxuXG4gICAgdXBkYXRlOiAoY3ljbGVMZW5ndGgpIC0+ICMgUGxheWVyU3RhdGVKdW1waW5nOjp1cGRhdGVcbiAgICAgICAgaWYgQHBhcmVudC5zcGVlZFkgPj0gMFxuICAgICAgICAgICAgQHBhcmVudC5zZXRTdGF0ZSBQbGF5ZXJTdGF0ZUZhbGxpbmdcblxuXG5cblBsYXllclN0YXRlRmFsbGluZyA9XG5jbGFzcyBQbGF5ZXJTdGF0ZUZhbGxpbmcgZXh0ZW5kcyBQbGF5ZXJTdGF0ZUFpclxuIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxuU2hhcGUgPSByZXF1aXJlKCcuL1NoYXBlJylcbmNvcmUgPSByZXF1aXJlKCcuL2NvcmUnKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSZWN0IGV4dGVuZHMgU2hhcGVcblxuICAgIGRyYXc6IC0+ICMgUmVjdDo6ZHJhd1xuICAgICAgICB1bmxlc3Mgc3VwZXJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBjb3JlLmZyYW1lQnVmZmVyQ3R4LmZpbGxSZWN0IEBkcmF3WCwgQGRyYXdZLCBAZHJhd1csIEBkcmF3SFxuICAgICAgICByZXR1cm4gdHJ1ZSIsIiMjIyBDb3B5cmlnaHQgKGMpIDIwMTUgTWFnbnVzIExlby4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gIyMjXG5cbmNvcmUgPSByZXF1aXJlKCcuL2NvcmUnKVxuYmFja2dyb3VuZCA9IHJlcXVpcmUoJy4vYmFja2dyb3VuZCcpXG51dGlsID0gcmVxdWlyZSgnLi91dGlsJylcbnZpZXcgPSByZXF1aXJlKCcuL3ZpZXcnKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTaGFwZVxuXG4gICAgY29uc3RydWN0b3I6IChkYXRhKSAtPiAjIFNoYXBlOjpjb25zdHJ1Y3RvclxuICAgICAgICBkZWZhdWx0RGF0YSA9XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICdyZ2JhKDI1NSwwLDAsMC40KSdcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlOiAncmdiYSgyNTUsMCwwLDAuNyknXG4gICAgICAgICAgICBoOiAxXG4gICAgICAgICAgICB3OiAxXG4gICAgICAgICAgICB4OiAwXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIGRhdGEgPSB1dGlsLm1lcmdlKGRlZmF1bHREYXRhLCBkYXRhKVxuICAgICAgICBmb3IgbmFtZSwgdmFsIG9mIGRhdGFcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB2YWxcblxuICAgICAgICBjb3JlLnNoYXBlcy5wdXNoIHRoaXNcblxuXG4gICAgZHJhdzogLT4gIyBTaGFwZTo6ZHJhd1xuICAgICAgICBpZiBub3QgQGlzVmlzaWJsZVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgQGRyYXdYID0gdmlldy5wb3NUb1B4KEB4LCAneCcpXG4gICAgICAgIEBkcmF3WSA9IHZpZXcucG9zVG9QeChAeSwgJ3knKVxuICAgICAgICBAZHJhd1cgPSBAdyAqIGJhY2tncm91bmQudGlsZVNpemVcbiAgICAgICAgQGRyYXdIID0gQGggKiBiYWNrZ3JvdW5kLnRpbGVTaXplXG4gICAgICAgIGNvcmUuZnJhbWVCdWZmZXJDdHguZmlsbFN0eWxlID0gQGZpbGxTdHlsZVxuICAgICAgICBjb3JlLmZyYW1lQnVmZmVyQ3R4LnN0cm9rZVN0eWxlID0gQHN0cm9rZVN0eWxlXG4gICAgICAgICMgU2hhcGUgc3BlY2lmaWMgZHJhd2luZyBpbiBzdWJjbGFzcyAoZS5nLiBSZWN0KVxuICAgICAgICByZXR1cm4gdHJ1ZVxuIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxuQW5pbWF0aW9uID0gcmVxdWlyZSgnLi9BbmltYXRpb24nKVxuY29yZSA9IHJlcXVpcmUoJy4vY29yZScpXG52aWV3ID0gcmVxdWlyZSgnLi92aWV3JylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3ByaXRlXG5cbiAgICBjb25zdHJ1Y3RvcjogKHBhdGgpIC0+ICMgU3ByaXRlOjpjb25zdHJ1Y3RvclxuICAgICAgICBAc3ByaXRlc2hlZXQgPSBwYXRoXG4gICAgICAgIEBzcHJpdGVJbWcgPSBAZ2V0SW1nKHBhdGgpXG4gICAgICAgIEBhbmltYXRpb25zID0ge31cbiAgICAgICAgQGN1cnJlbnRBbmltYXRpb24gPSBudWxsXG5cblxuICAgIGFkZEFuaW1hdGlvbjogKGFuaW1hdGlvbkRhdGEpIC0+ICMgU3ByaXRlOjphZGRBbmltYXRpb25cbiAgICAgICAgdW5sZXNzIGFuaW1hdGlvbkRhdGFcbiAgICAgICAgICAgIHRocm93ICdTcHJpdGU6OmFkZEFuaW1hdGlvbiAtIE1pc3NpbmcgYW5pbWF0aW9uRGF0YSdcblxuICAgICAgICB1bmxlc3MgYW5pbWF0aW9uRGF0YS5uYW1lXG4gICAgICAgICAgICB0aHJvdyAnU3ByaXRlOjphZGRBbmltYXRpb24gLSBNaXNzaW5nIGFuaW1hdGlvbkRhdGEubmFtZSdcblxuICAgICAgICBjb25zb2xlLmFzc2VydCAhQGFuaW1hdGlvbnNbYW5pbWF0aW9uRGF0YS5uYW1lXSAjRGVidWdcbiAgICAgICAgQGFuaW1hdGlvbnNbYW5pbWF0aW9uRGF0YS5uYW1lXSA9IG5ldyBBbmltYXRpb24gdGhpcywgYW5pbWF0aW9uRGF0YVxuXG5cbiAgICBzZXRBbmltYXRpb246IChhbmltTmFtZSwgZnJhbWVOdW0gPSAwKSAtPiAjIFNwcml0ZTo6c2V0QW5pbWF0aW9uXG4gICAgICAgIEBjdXJyZW50QW5pbWF0aW9uID0gYW5pbU5hbWVcbiAgICAgICAgQGFuaW1hdGlvbnNbQGN1cnJlbnRBbmltYXRpb25dLmp1bXBUb0ZyYW1lKGZyYW1lTnVtKVxuXG5cbiAgICBhZHZhbmNlQW5pbWF0aW9uOiAoY3ljbGVMZW5ndGgpIC0+ICMgU3ByaXRlOjphZHZhbmNlQW5pbWF0aW9uXG4gICAgICAgIEBhbmltYXRpb25zW0BjdXJyZW50QW5pbWF0aW9uXS5hZHZhbmNlKGN5Y2xlTGVuZ3RoKVxuXG5cbiAgICBnZXRDdXJyZW50QW5pbWF0aW9uOiAtPlxuICAgICAgICByZXR1cm4gQGFuaW1hdGlvbnNbQGN1cnJlbnRBbmltYXRpb25dXG5cblxuICAgIGRyYXc6ICh4LCB5KSAtPiAjIFNwcml0ZTo6ZHJhd1xuICAgICAgICBmcmFtZSA9IEBhbmltYXRpb25zW0BjdXJyZW50QW5pbWF0aW9uXS5nZXRDdXJyZW50RnJhbWUoKVxuICAgICAgICBmcmFtZURhdGEgPSBmcmFtZS5kYXRhXG4gICAgICAgIGNvcmUuZnJhbWVCdWZmZXJDdHguZHJhd0ltYWdlIEBzcHJpdGVJbWcsXG4gICAgICAgICAgICBmcmFtZURhdGFbMF0sICMgU291cmNlIHhcbiAgICAgICAgICAgIGZyYW1lRGF0YVsxXSwgIyBTb3VyY2UgeVxuICAgICAgICAgICAgZnJhbWVEYXRhWzJdLCAjIFNvdXJjZSB3aWR0aFxuICAgICAgICAgICAgZnJhbWVEYXRhWzNdLCAjIFNvdXJjZSBoZWlnaHRcbiAgICAgICAgICAgIHZpZXcucG9zVG9QeCh4LCAneCcpICsgZnJhbWVEYXRhWzRdLCAjIFBvc2l0aW9uICsgZnJhbWUgb2Zmc2V0IFhcbiAgICAgICAgICAgIHZpZXcucG9zVG9QeCh5LCAneScpICsgZnJhbWVEYXRhWzVdLCAjIFBvc2l0aW9uICsgZnJhbWUgb2Zmc2V0IFlcbiAgICAgICAgICAgIGZyYW1lRGF0YVsyXSwgIyBEZXN0aW5hdGlvbiB3aWR0aFxuICAgICAgICAgICAgZnJhbWVEYXRhWzNdLCAjIERlc3RpbmF0aW9uIGhlaWdodFxuXG5cbiAgICBnZXRJbWc6IC0+ICMgU3ByaXRlOjpnZXRJbWdcbiAgICAgICAgcGF0aCA9IEBzcHJpdGVzaGVldFxuICAgICAgICBpZiBfaW1nID0gQF9pbWdbcGF0aF1cbiAgICAgICAgICAgIHJldHVybiBfaW1nW3BhdGhdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIF9pbWdPYmogPSBAX2ltZ1twYXRoXSA9IG5ldyBJbWFnZSgpXG4gICAgICAgICAgICBfaW1nT2JqLnNyYyA9IGNvcmUuaW1nUGF0aCArIHBhdGhcbiAgICAgICAgICAgIHJldHVybiBfaW1nT2JqXG5cbiAgICBfaW1nOiB7fSAjIFNoYXJlZCBoYXNobWFwIG9mIGltYWdlIG9iamVjdHMgd2l0aCB0aGUgc3ByaXRlIHBhdGggYXMga2V5XG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhY2tncm91bmQgPVxuICAgIHRpbGVTaXplOiAxNlxuICAgIGNvbG9yOiAnIzZlYzBmZidcbiIsIiMjIyBDb3B5cmlnaHQgKGMpIDIwMTUgTWFnbnVzIExlby4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gIyMjXG5cbmNvbGxpc2lvbiA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IGNvbGxpc2lvblxuXG5MaW5lID0gcmVxdWlyZSgnLi9MaW5lJylcblJlY3QgPSByZXF1aXJlKCcuL1JlY3QnKVxudXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG52aWV3ID0gcmVxdWlyZSgnLi92aWV3JylcblxuY29sbGlzaW9uLmFjdG9yVG9MYXllciA9IChhY3RvciwgbGF5ZXIsIG9wdGlvbnMpIC0+XG4gICAgbyA9XG4gICAgICAgIHJlcG9zaXRpb246IGZhbHNlXG4gICAgbyA9IHV0aWwubWVyZ2Uobywgb3B0aW9ucylcblxuICAgIGNvbGxpc2lvbnMgPVxuICAgICAgICBhbnk6IGZhbHNlXG4gICAgICAgIGJvdHRvbTogZmFsc2VcbiAgICAgICAgdG9wOiBmYWxzZVxuICAgICAgICBsZWZ0OiBmYWxzZVxuICAgICAgICByaWdodDogZmFsc2VcbiAgICAgICAgZnJpY3Rpb246IDEuMCAjVE9ETzogR2V0IGRhdGEgZnJvbSBjb2xsaWRpbmcgdGlsZXNcblxuICAgIG5ld1Bvc1ggPSBhY3Rvci5wb3NYXG4gICAgbmV3UG9zWSA9IGFjdG9yLnBvc1lcbiAgICBuZXdTcGVlZFggPSBhY3Rvci5zcGVlZFhcbiAgICBuZXdTcGVlZFkgPSBhY3Rvci5zcGVlZFlcblxuICAgIHN0YXJ0WCA9IGFjdG9yLnBvc1ggPj4gMFxuICAgIGVuZFggICA9IChhY3Rvci5wb3NYICsgYWN0b3IuY29sVykgPj4gMFxuICAgIHN0YXJ0WSA9IGFjdG9yLnBvc1kgPj4gMFxuICAgIGVuZFkgICA9IChhY3Rvci5wb3NZICsgYWN0b3IuY29sSCkgPj4gMFxuXG4gICAgIyBDaGVjayBpZiBvdmVybGFwcGluZyB0aWxlcyBhcmUgY29sbGlkYWJsZVxuICAgIGZvciB5IGluIFtzdGFydFkuLmVuZFldXG4gICAgICAgIGZvciB4IGluIFtzdGFydFguLmVuZFhdXG4gICAgICAgICAgICB0aWxlID0gbGF5ZXIuZ2V0VGlsZSh4LCB5KVxuICAgICAgICAgICAgaWYgdGlsZSA+IC0xXG4gICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgKy0tLS0rICBBY3RvciBtb3ZlcyBmcm9tIEExIHRvIEEyXG4gICAgICAgICAgICAgICAgfCBBMSB8ICBhbmQgY29sbGlkZXMgd2l0aCBiYWNrZ3JvdW5kIHRpbGUgQmcuXG4gICAgICAgICAgICAgICAgfCAgICB8ICBBY3RvciBtb3ZlcyB3aXRoIHZlY3RvciAoc3BlZWRYLCBzcGVlZFkpXG4gICAgICAgICAgICAgICAgKy0tLS0rXG4gICAgICAgICAgICAgICAgICAgICArLS0tLSsgIFRoZSBhbmdsZSBiZXR3ZWVuIEFjQmMgYW5kIHRoZSBtb3ZlbWVudCB2ZWN0b3IgZGV0ZXJtaW5lc1xuICAgICAgICAgICAgICAgICAgICAgfCBBMiB8ICBpZiBpdCBpcyBhIGhvcml6b250YWwgb3IgdmVydGljYWwgY29sbGlzaW9uLlxuICAgICAgICAgICAgICAgICAgICAgfCAgQmMtLS0tLStcbiAgICAgICAgICAgICAgICAgICAgICstLXwtQWMgICB8XG4gICAgICAgICAgICAgICAgICAgICAgICB8ICBCZyAgfFxuICAgICAgICAgICAgICAgICAgICAgICAgKy0tLS0tLStcbiAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICBpZiBhY3Rvci5zcGVlZFggPT0gMFxuICAgICAgICAgICAgICAgICAgICBpc0hvcml6b250YWxDb2xsaXNpb24gPSBmYWxzZVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgYWN0b3Iuc3BlZWRZID09IDBcbiAgICAgICAgICAgICAgICAgICAgaXNIb3Jpem9udGFsQ29sbGlzaW9uID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgIyBHZXQgYWN0b3IncyBmb3JlbW9zdCBjb3JuZXIgaW4gdGhlIG1vdmVtZW50IHZlY3RvclxuICAgICAgICAgICAgICAgICAgICAjIGFuZCB0aGUgYmFja2dyb3VuZHMgb3Bwb3NpbmcgY29ybmVyXG4gICAgICAgICAgICAgICAgICAgIGEyQ29ybmVyID0ge31cbiAgICAgICAgICAgICAgICAgICAgYmdDb3JuZXIgPSB7fVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIGFjdG9yLnNwZWVkWCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGEyQ29ybmVyLnggPSBhY3Rvci5wb3NYICsgYWN0b3IuY29sV1xuICAgICAgICAgICAgICAgICAgICAgICAgYmdDb3JuZXIueCA9IHhcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYTJDb3JuZXIueCA9IGFjdG9yLnBvc1hcbiAgICAgICAgICAgICAgICAgICAgICAgIGJnQ29ybmVyLnggPSB4ICsgMVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIGFjdG9yLnNwZWVkWSA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGEyQ29ybmVyLnkgPSBhY3Rvci5wb3NZICsgYWN0b3IuY29sSFxuICAgICAgICAgICAgICAgICAgICAgICAgYmdDb3JuZXIueSA9IHlcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYTJDb3JuZXIueSA9IGFjdG9yLnBvc1lcbiAgICAgICAgICAgICAgICAgICAgICAgIGJnQ29ybmVyLnkgPSB5ICsgMVxuXG4gICAgICAgICAgICAgICAgICAgICMgRGV0ZXJtaW5lIGJ5IHRoZSBhbmdsZSBpZiBpdCBpcyBhIGhvcml6b250YWwgb3IgdmVydGljYWwgY29sbGlzaW9uXG4gICAgICAgICAgICAgICAgICAgIG1vdkFuZyA9IE1hdGguYWJzKGFjdG9yLnNwZWVkWSAvIGFjdG9yLnNwZWVkWClcbiAgICAgICAgICAgICAgICAgICAgY29sQW5nID0gTWF0aC5hYnMoKGEyQ29ybmVyLnkgLSBiZ0Nvcm5lci55KSAvIChhMkNvcm5lci54IC0gYmdDb3JuZXIueCkpXG4gICAgICAgICAgICAgICAgICAgIGlmIG1vdkFuZyAtIGNvbEFuZyA8IDAuMDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzSG9yaXpvbnRhbENvbGxpc2lvbiA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNIb3Jpem9udGFsQ29sbGlzaW9uID0gZmFsc2VcblxuICAgICAgICAgICAgICAgIGlmIGlzSG9yaXpvbnRhbENvbGxpc2lvblxuICAgICAgICAgICAgICAgICAgICAjIEhvcml6b250YWwgY29sbGlzaW9uc1xuICAgICAgICAgICAgICAgICAgICBpZiBhY3Rvci5zcGVlZFggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdvaW5nIHJpZ2h0LiBJcyBub3QgYW4gZWRnZSBpZiB0aGUgdGlsZSB0byB0aGUgbGVmdCBpcyBzb2xpZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoYm9yVGlsZSA9IGxheWVyLmdldFRpbGUoeCwgeSwgLTEsIDApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuZWlnaGJvclRpbGUgPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdQb3NYID0geCAtIGFjdG9yLmNvbFcgLSAwLjAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3BlZWRYID0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbnMuYW55ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbnMucmlnaHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4LCB5OnksIHgyOngsIHkyOnkrMSwgc3Ryb2tlU3R5bGU6J3JnYmEoMCwxMjgsMCwwLjkpJ30gI0RlYnVnXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4LCB5OnksIHgyOngsIHkyOnkrMSwgc3Ryb2tlU3R5bGU6J3JnYmEoMjU1LDY0LDAsMC42KSd9ICNEZWJ1Z1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdvaW5nIGxlZnQuIElzIG5vdCBhbiBlZGdlIGlmIHRoZSB0aWxlIHRvIHRoZSByaWdodCBpcyBzb2xpZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoYm9yVGlsZSA9IGxheWVyLmdldFRpbGUoeCwgeSwgMSwgMClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5laWdoYm9yVGlsZSA9PSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Bvc1ggPSB4ICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1NwZWVkWCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLmFueSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLmxlZnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4KzEsIHk6eSwgeDI6eCsxLCB5Mjp5KzEsIHN0cm9rZVN0eWxlOidyZ2JhKDAsMTI4LDAsMC45KSd9ICNEZWJ1Z1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuZHJhd09uY2Uge2NsYXNzOkxpbmUsIHg6eCsxLCB5OnksIHgyOngrMSwgeTI6eSsxLCBzdHJva2VTdHlsZToncmdiYSgyNTUsNjQsMCwwLjYpJ30gI0RlYnVnXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAjIFZlcnRpY2FsIGNvbGxpc2lvbnNcbiAgICAgICAgICAgICAgICAgICAgaWYgYWN0b3Iuc3BlZWRZIDwgMFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBHb2luZyB1cC4gSXMgbm90IGFuIGVkZ2UgaWYgdGhlIHRpbGUgdXB3YXJkcyBpcyBzb2xpZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoYm9yVGlsZSA9IGxheWVyLmdldFRpbGUoeCwgeSwgMCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5laWdoYm9yVGlsZSA9PSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Bvc1kgPSB5ICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1NwZWVkWSA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLmFueSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLnRvcCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3LmRyYXdPbmNlIHtjbGFzczpMaW5lLCB4OngsIHk6eSsxLCB4Mjp4KzEsIHkyOnkrMSwgc3Ryb2tlU3R5bGU6J3JnYmEoMCwxMjgsMCwwLjkpJ30gI0RlYnVnXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4LCB5OnkrMSwgeDI6eCsxLCB5Mjp5KzEsIHN0cm9rZVN0eWxlOidyZ2JhKDI1NSw2NCwwLDAuNiknfSAjRGVidWdcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBhY3Rvci5zcGVlZFkgPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdvaW5nIGRvd24uIElzIG5vdCBhbiBlZGdlIGlmIHRoZSB0aWxlIGRvd253YXJkcyBpcyBzb2xpZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoYm9yVGlsZSA9IGxheWVyLmdldFRpbGUoeCwgeSwgMCwgLTEpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuZWlnaGJvclRpbGUgPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdQb3NZID0geSAtIGFjdG9yLmNvbEhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTcGVlZFkgPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9ucy5hbnkgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9ucy5ib3R0b20gPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4LCB5OnksIHgyOngrMSwgeTI6eSwgc3Ryb2tlU3R5bGU6J3JnYmEoMCwxMjgsMCwwLjkpJ30gI0RlYnVnXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6TGluZSwgeDp4LCB5OnksIHgyOngrMSwgeTI6eSwgc3Ryb2tlU3R5bGU6J3JnYmEoMjU1LDY0LDAsMC42KSd9ICNEZWJ1Z1xuXG4gICAgICAgICAgICAgICAgIyBEZWJ1ZyBoaWdobGlnaHQgYmxvY2tcbiAgICAgICAgICAgICAgICBpZiBuZWlnaGJvclRpbGUgPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgIyBDb2xsaXNpb25cbiAgICAgICAgICAgICAgICAgICAgdmlldy5kcmF3T25jZSB7Y2xhc3M6UmVjdCwgeDp4LCB5OnksIHc6MSwgaDoxLCBmaWxsU3R5bGU6J3JnYmEoMCwyNTUsMCwwLjYpJ30gI0RlYnVnXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAjIEludGVybmFsIGVkZ2U7IG5vIGNvbGxpc2lvblxuICAgICAgICAgICAgICAgICAgICB2aWV3LmRyYXdPbmNlIHtjbGFzczpSZWN0LCB4OngsIHk6eSwgdzoxLCBoOjEsIGZpbGxTdHlsZToncmdiYSgyNTUsMjU1LDAsMC41KSd9ICNEZWJ1Z1xuXG4gICAgIyBBcHBseSBuZXcgcG9zaXRpb24gYW5kIHNwZWVkXG4gICAgaWYgby5yZXBvc2l0aW9uXG4gICAgICAgIGFjdG9yLnBvc1ggPSBuZXdQb3NYXG4gICAgICAgIGFjdG9yLnBvc1kgPSBuZXdQb3NZXG4gICAgICAgIGFjdG9yLnNwZWVkWCA9IG5ld1NwZWVkWFxuICAgICAgICBhY3Rvci5zcGVlZFkgPSBuZXdTcGVlZFlcblxuICAgIHJldHVybiBjb2xsaXNpb25zXG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG4jSURFQTogRHluYW1pYyB6b29tIGFuZCBhdXRvbWF0aWMgc2NyZWVuIHNpemUgKGFkYXB0IHRvIHdpbmRvdykuXG5cbmJhY2tncm91bmQgPSByZXF1aXJlKCcuL2JhY2tncm91bmQnKVxuZXZlbnQgPSByZXF1aXJlKCcuL2V2ZW50JylcbmxheWVycyA9IHJlcXVpcmUoJy4vbGF5ZXJzJylcbnV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKVxudmlldyA9IHJlcXVpcmUoJy4vdmlldycpXG5cbmNvcmUgPSB7fVxubW9kdWxlLmV4cG9ydHMgPSBjb3JlXG5cbiMgUHJpdmF0ZSB2YXJpYWJsZXNcbl92aWV3ID0gbnVsbFxuX3ZpZXdDdHggPSBudWxsXG5fZnJhbWVCdWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXG5fbGF0ZXN0RnJhbWVUaW1lID0gRGF0ZS5ub3coKVxuX2VkaXRUaWxlID0gLTFcblxuIyBQdWJsaWMgdmFyaWFibGVzXG5jb3JlLmZyYW1lQnVmZmVyQ3R4ID0gX2ZyYW1lQnVmZmVyLmdldENvbnRleHQgJzJkJ1xuY29yZS5jYW1YID0gMFxuY29yZS5jYW1ZID0gMFxuY29yZS5jYW1XID0gMFxuY29yZS5jYW1IID0gMFxuY29yZS5hY3RvcnMgPSBbXVxuY29yZS5zaGFwZXMgPSBbXVxuXG5cbiMgQ29yZSBmdW5jdGlvbnNcbmNvcmUuaW1nUGF0aCA9ICdfaW1nLydcblxuY29yZS5pbml0ID0gLT5cbiAgICBfdmlldyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZW8tdmlldycpXG5cbiAgICBfZnJhbWVCdWZmZXIud2lkdGggID0gX3ZpZXcud2lkdGhcbiAgICBfZnJhbWVCdWZmZXIuaGVpZ2h0ID0gX3ZpZXcuaGVpZ2h0XG5cbiAgICBfdmlldy53aWR0aCAgICAgICAgICA9IF92aWV3LndpZHRoICAqIHZpZXcuc2NhbGVcbiAgICBfdmlldy5oZWlnaHQgICAgICAgICA9IF92aWV3LmhlaWdodCAqIHZpZXcuc2NhbGVcblxuICAgIF92aWV3Q3R4ID0gX3ZpZXcuZ2V0Q29udGV4dCgnMmQnKVxuICAgIF92aWV3Q3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IF92aWV3Q3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IF92aWV3Q3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlXG5cbiAgICBfdmlldy5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAoZSkgLT5cbiAgICAgICAgdW5sZXNzIGUuYnV0dG9uIGlzIDBcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICAgIG1vdXNlWCAgID0gZS5vZmZzZXRYXG4gICAgICAgIG1vdXNlWSAgID0gZS5vZmZzZXRZXG4gICAgICAgIGNhbVggICAgID0gdmlldy5jYW1lcmFQb3NYXG4gICAgICAgIGNhbVkgICAgID0gdmlldy5jYW1lcmFQb3NZXG4gICAgICAgIHNjYWxlICAgID0gdmlldy5zY2FsZVxuICAgICAgICB0aWxlU2l6ZSA9IGJhY2tncm91bmQudGlsZVNpemVcblxuICAgICAgICB0aWxlWCAgICA9IChtb3VzZVggLyBzY2FsZSAvIHRpbGVTaXplICsgY2FtWCkgPj4gMFxuICAgICAgICB0aWxlWSAgICA9IChtb3VzZVkgLyBzY2FsZSAvIHRpbGVTaXplICsgY2FtWSkgPj4gMFxuXG4gICAgICAgIGxheWVyICAgID0gbGF5ZXJzLmdldCgnZ3JvdW5kJylcbiAgICAgICAgdGlsZSAgICAgPSBsYXllci5nZXRUaWxlKHRpbGVYLCB0aWxlWSlcbiAgICAgICAgY29uc29sZS5sb2cgdGlsZVgsIHRpbGVZICNEZWJ1Z1xuXG4gICAgICAgIGlmIGUuYWx0S2V5XG4gICAgICAgICAgICBfZWRpdFRpbGUgPSB0aWxlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgbGF5ZXIuc2V0VGlsZSh0aWxlWCwgdGlsZVksIF9lZGl0VGlsZSlcblxuICAgIF92aWV3LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAoZSkgLT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIGV2ZW50Ll9rZXlkb3duXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2tleXVwJywgICBldmVudC5fa2V5dXBcblxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29yZS5jeWNsZSlcblxuY29yZS5kcmF3ID0gLT5cbiAgICBpZiB1dGlsLmRvY3VtZW50SGlkZGVuKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICAjIENhbGN1bGF0ZSBjYW1lcmEgcGl4ZWwgdmFsdWVzXG4gICAgY29yZS5jYW1YID0gdmlldy5jYW1lcmFQb3NYICogYmFja2dyb3VuZC50aWxlU2l6ZVxuICAgIGNvcmUuY2FtWSA9IHZpZXcuY2FtZXJhUG9zWSAqIGJhY2tncm91bmQudGlsZVNpemVcbiAgICBjb3JlLmNhbVcgPSB2aWV3LmNhbWVyYVdpZHRoICogYmFja2dyb3VuZC50aWxlU2l6ZVxuICAgIGNvcmUuY2FtSCA9IHZpZXcuY2FtZXJhSGVpZ2h0ICogYmFja2dyb3VuZC50aWxlU2l6ZVxuXG4gICAgIyBCYWNrZ3JvdW5kIGNvbG9yXG4gICAgY29yZS5mcmFtZUJ1ZmZlckN0eC5maWxsU3R5bGUgPSBiYWNrZ3JvdW5kLmNvbG9yXG4gICAgY29yZS5mcmFtZUJ1ZmZlckN0eC5maWxsUmVjdCAwLCAwLCBfdmlldy53aWR0aCwgX3ZpZXcuaGVpZ2h0XG5cbiAgICAjIFJlbmRlciBsYXllcnNcbiAgICBmb3IgbGF5ZXIgaW4gbGF5ZXJzLm9iamVjdHNcbiAgICAgICAgbGF5ZXIuZHJhdygpXG5cbiAgICAjIFJlbmRlciBBY3RvcnNcbiAgICBmb3IgYWN0b3IgaW4gY29yZS5hY3RvcnNcbiAgICAgICAgYWN0b3IuZHJhdygpXG5cbiAgICAjIFJlbmRlciBzaGFwZXNcbiAgICBmb3Igc2hhcGUgaW4gY29yZS5zaGFwZXNcbiAgICAgICAgc2hhcGUuZHJhdygpXG5cbiAgICB3aGlsZSBzbyA9IHZpZXcuZHJhd09uY2VRdWUucG9wKClcbiAgICAgICAgc2hhcGUgPSBuZXcgc28uY2xhc3MoKVxuICAgICAgICBmb3IgbmFtZSwgdmFsIG9mIHNvXG4gICAgICAgICAgICBzaGFwZVtuYW1lXSA9IHZhbFxuICAgICAgICBzaGFwZS5pc1Zpc2libGUgPSB0cnVlXG4gICAgICAgIHNoYXBlLmRyYXcoKVxuICAgICAgICBzaGFwZS5pc1Zpc2libGUgPSBmYWxzZVxuXG4gICAgX3ZpZXdDdHguZHJhd0ltYWdlIF9mcmFtZUJ1ZmZlcixcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgX2ZyYW1lQnVmZmVyLndpZHRoICogdmlldy5zY2FsZSxcbiAgICAgICAgX2ZyYW1lQnVmZmVyLmhlaWdodCAqIHZpZXcuc2NhbGVcblxuY29yZS5jeWNsZSA9IC0+XG4gICAgIyBGcmFtZSB0aW1pbmdcbiAgICB0aGlzRnJhbWVUaW1lID0gRGF0ZS5ub3coKVxuICAgIGN5Y2xlTGVuZ3RoID0gTWF0aC5taW4odGhpc0ZyYW1lVGltZSAtIF9sYXRlc3RGcmFtZVRpbWUsIDEwMCkgKiAwLjAwMSAjIFVuaXQgc2Vjb25kc1xuICAgIHVubGVzcyBjeWNsZUxlbmd0aFxuICAgICAgICByZXR1cm5cblxuICAgICMgQ2FtZXJhXG4gICAgdmlldy5jYW1lcmFQb3NYICs9IHZpZXcuY2FtZXJhU3BlZWRYICogY3ljbGVMZW5ndGhcblxuICAgICMgQWN0b3JzXG4gICAgZm9yIGFjdG9yIGluIGNvcmUuYWN0b3JzXG4gICAgICAgIGFjdG9yLnVwZGF0ZShjeWNsZUxlbmd0aClcblxuICAgICMgRmluaXNoIHRoZSBmcmFtZVxuICAgIGNvcmUuZHJhdygpXG4gICAgX2xhdGVzdEZyYW1lVGltZSA9IHRoaXNGcmFtZVRpbWVcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNvcmUuY3ljbGUpXG5cbiAgICBjb3JlLmN5Y2xlQ2FsbGJhY2soY3ljbGVMZW5ndGgpXG5cbmNvcmUuREFUQV9UWVBFUyA9XG4gICAgQ0hVTks6IDBcblxuXG5jb3JlLmN5Y2xlQ2FsbGJhY2sgPSAtPiAjIE92ZXJyaWRlIGNvcmUuY3ljbGVDYWxsYmFjayB3aXRoIHlvdXIgb3duIGZ1bmN0aW9uXG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVudmlyb25tZW50ID1cbiAgICBncmF2aXR5OiA2MCAjIFRpbGVzIHBlciBzZWNvbmReMlxuIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxubGF5ZXJzID0gcmVxdWlyZSgnLi9sYXllcnMnKVxudXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG5cbmV2ZW50ID0ge31cbm1vZHVsZS5leHBvcnRzID0gZXZlbnRcblxuZXZlbnQucHJlc3NlZEtleXMgPSBbXVxuXG5ldmVudC5fa2V5ZG93biA9IChlKSAtPlxuICAgIHVubGVzcyBlLmN0cmxLZXkgb3IgZS5tZXRhS2V5XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgIyBQcmV2ZW50IGtleWRvd24gcmVwZWF0XG4gICAga2V5SW5kZXggPSBldmVudC5wcmVzc2VkS2V5cy5pbmRleE9mIGUua2V5Q29kZVxuICAgIGlmIGtleUluZGV4IGlzIC0xXG4gICAgICAgIGV2ZW50LnByZXNzZWRLZXlzLnB1c2ggZS5rZXlDb2RlXG5cbiAgICAgICAga2V5ID0gdXRpbC5LRVlfQ09ERVNcbiAgICAgICAgc3dpdGNoIGUua2V5Q29kZVxuICAgICAgICAgICAgd2hlbiBrZXkuU1xuICAgICAgICAgICAgICAgIGRhdGEgPSBsYXllcnMuZ2V0KCdncm91bmQnKS5zZXJpYWxpemUoKVxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdncm91bmQnLCBkYXRhKVxuXG4gICAgICAgICAgICB3aGVuIGtleS5MXG4gICAgICAgICAgICAgICAgZGF0YSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdncm91bmQnKVxuICAgICAgICAgICAgICAgIGxheWVycy5nZXQoJ2dyb3VuZCcpLmRlc2VyaWFsaXplKGRhdGEpXG5cbiAgICAgICAgZXZlbnQua2V5ZG93biBlXG5cbmV2ZW50LmtleWRvd24gPSAoZSkgLT5cbiAgICAjIE92ZXJyaWRlIGV2ZW50LmtleWRvd24gd2l0aCB5b3VyIGtleWRvd24gZnVuY3Rpb25cblxuZXZlbnQuX2tleXVwID0gKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAga2V5SW5kZXggPSBldmVudC5wcmVzc2VkS2V5cy5pbmRleE9mIGUua2V5Q29kZVxuICAgIGlmIGtleUluZGV4IGlzbnQgLTFcbiAgICAgICAgZXZlbnQucHJlc3NlZEtleXMuc3BsaWNlIGtleUluZGV4LCAxXG4gICAgZXZlbnQua2V5dXAgZVxuXG5ldmVudC5rZXl1cCA9IChlKSAtPlxuICAgICMgT3ZlcnJpZGUgZXZlbnQua2V5dXAgd2l0aCB5b3VyIGtleXVwIGZ1bmN0aW9uIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxudXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG5ldmVudCA9IHJlcXVpcmUoJy4vZXZlbnQnKVxuXG5pbyA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IGlvXG5cbmlvLmdldFByZXNzZWRLZXlzID0gLT5cbiAgICByZXR1cm4gZXZlbnQucHJlc3NlZEtleXNcblxuaW8uaXNLZXlQcmVzc2VkID0gKGtleSkgLT5cbiAgICBpZiB0eXBlb2Yga2V5IGlzICdzdHJpbmcnXG4gICAgICAgIGtleSA9IHV0aWwuS0VZX0NPREVTW2tleS50b1VwcGVyQ2FzZSgpXVxuICAgIHVubGVzcyB0eXBlb2Yga2V5IGlzICdudW1iZXInXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIGV2ZW50LnByZXNzZWRLZXlzLmluZGV4T2Yoa2V5KSA+IC0xXG5cbmlvLmFueUtleVByZXNzZWQgPSAoa2V5cykgLT5cbiAgICBrZXlDb2RlcyA9IHV0aWwuS0VZX0NPREVTXG4gICAgaWYgdHlwZW9mIGtleSBpcyAnc3RyaW5nJ1xuICAgICAgICBrZXkgPSBba2V5XVxuICAgIGZvciBrZXkgaW4ga2V5c1xuICAgICAgICBpZiB0eXBlb2Yga2V5IGlzICdzdHJpbmcnXG4gICAgICAgICAgICBrZXkgPSBrZXlDb2Rlc1trZXkudG9VcHBlckNhc2UoKV1cbiAgICAgICAgaWYgZXZlbnQucHJlc3NlZEtleXMuaW5kZXhPZihrZXkpID4gLTFcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbmlvLmFsbEtleXNQcmVzc2VkID0gKGtleXMpIC0+XG4gICAga2V5Q29kZXMgPSB1dGlsLktFWV9DT0RFU1xuICAgIGlmIHR5cGVvZiBrZXkgaXMgJ3N0cmluZydcbiAgICAgICAga2V5ID0gW2tleV1cbiAgICBmb3Iga2V5IGluIGtleXNcbiAgICAgICAgaWYgdHlwZW9mIGtleSBpcyAnc3RyaW5nJ1xuICAgICAgICAgICAga2V5ID0ga2V5Q29kZXNba2V5LnRvVXBwZXJDYXNlKCldXG4gICAgICAgIGlmIGV2ZW50LnByZXNzZWRLZXlzLmluZGV4T2Yoa2V5KSA9PSAtMVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcbiIsIiMjIyBDb3B5cmlnaHQgKGMpIDIwMTUgTWFnbnVzIExlby4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gIyMjXG5cbmxheWVycyA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IGxheWVyc1xuXG5sYXllcnMub2JqZWN0cyA9IFtdXG5cbmxheWVycy5hZGQgPSAobGF5ZXJPYmopIC0+XG4gICAgaWYgbm90IGxheWVyT2JqPy5pZCBvclxuICAgIGxheWVycy5nZXQobGF5ZXJPYmouaWQpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICBsYXllcnMub2JqZWN0cy5wdXNoKGxheWVyT2JqKVxuXG5sYXllcnMuZ2V0ID0gKGlkKSAtPlxuICAgIGZvciBsYXllck9iaiBpbiBsYXllcnMub2JqZWN0c1xuICAgICAgICBpZiBsYXllck9iai5pZCBpcyBpZFxuICAgICAgICAgICAgcmV0dXJuIGxheWVyT2JqXG4gICAgcmV0dXJuIG51bGxcblxuXG4jIFRPRE86IERvIGxpa2UgQWN0b3Igc3ByaXRlcyBhbmQgYXNzaWduIFNwcml0ZSBvYmplY3RzIHRvIExheWVycy5cbmxheWVycy5nZXRJbWcgPSAocGF0aCkgLT5cbiAgICBfaW1nID0gbGF5ZXJzLl9pbWdcbiAgICBpZiBfaW1nW3BhdGhdXG4gICAgICAgIHJldHVybiBfaW1nW3BhdGhdXG4gICAgZWxzZVxuICAgICAgICBfaW1nT2JqID0gX2ltZ1twYXRoXSA9IG5ldyBJbWFnZSgpXG4gICAgICAgIF9pbWdPYmouc3JjID0gJ19pbWcvJyArIHBhdGhcbiAgICAgICAgcmV0dXJuIF9pbWdPYmpcblxubGF5ZXJzLnJlbW92ZUltZyA9IChwYXRoKSAtPlxuICAgIF9pbWcgPSBsYXllcnMuX2ltZ1xuICAgIGlmIF9pbWdbcGF0aF0gdGhlbiBfaW1nW3BhdGhdID0gbnVsbFxuXG5sYXllcnMuX2ltZyA9IHt9ICMgSGFzaG1hcCBvZiBpbWFnZSBvYmplY3RzIHdpdGggdGhlIHNwcml0ZSBwYXRoIGFzIGtleVxuIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNCBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxuY29yZSA9IHJlcXVpcmUoJy4vY29yZScpXG5ldmVudCA9IHJlcXVpcmUoJy4vZXZlbnQnKVxuTGF5ZXIgPSByZXF1aXJlKCcuL0xheWVyJylcbmxheWVycyA9IHJlcXVpcmUoJy4vbGF5ZXJzJylcblBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJylcblNwcml0ZSA9IHJlcXVpcmUoJy4vU3ByaXRlJylcbnV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKVxudmlldyA9IHJlcXVpcmUoJy4vdmlldycpXG5cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2xvYWQnLCAtPlxuICAgIGNvcmUuaW5pdCgpXG5cblxuICAgICMgRXZlbnRzXG5cbiAgICBldmVudC5rZXlkb3duID0gKGUpIC0+XG4gICAgICAgIGtleSA9IHV0aWwuS0VZX0NPREVTXG4gICAgICAgIHN3aXRjaCBlLmtleUNvZGVcbiAgICAgICAgICAgIHdoZW4ga2V5LlJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwbGF5ZXIuaGFuZGxlSW5wdXQoZSlcblxuICAgIGV2ZW50LmtleXVwID0gKGUpIC0+XG4gICAgICAgIHBsYXllci5oYW5kbGVJbnB1dChlKVxuXG5cbiAgICAjIFBsYXllclxuXG4gICAgcGxheWVyU3ByaXRlID0gbmV3IFNwcml0ZSgnc3ByaXRlLW9sbGUucG5nJylcblxuICAgIHBsYXllclNwcml0ZS5hZGRBbmltYXRpb25cbiAgICAgICAgbmFtZTogJ2p1bXBpbmdMZWZ0J1xuICAgICAgICBmcmFtZXM6IFtcbiAgICAgICAgICAgIHt4OjE5LCB5OjMzLCB3OjMwLCBoOjMyLCBvZmZzZXRYOi00LCBvZmZzZXRZOjAsIGR1cmF0aW9uOjAuMTkyfVxuICAgICAgICBdXG4gICAgICAgIGlzTG9vcGluZzogZmFsc2VcblxuICAgIHBsYXllclNwcml0ZS5hZGRBbmltYXRpb25cbiAgICAgICAgbmFtZTogJ2p1bXBpbmdSaWdodCdcbiAgICAgICAgZnJhbWVzOiBbXG4gICAgICAgICAgICB7eDoxOSwgeTowLCB3OjMwLCBoOjMyLCBvZmZzZXRYOi04LCBvZmZzZXRZOjAsIGR1cmF0aW9uOjAuMTkyfVxuICAgICAgICBdXG4gICAgICAgIGlzTG9vcGluZzogZmFsc2VcblxuICAgIHBsYXllclNwcml0ZS5hZGRBbmltYXRpb25cbiAgICAgICAgbmFtZTogJ3J1bm5pbmdMZWZ0J1xuICAgICAgICBmcmFtZXM6IFtcbiAgICAgICAgICAgIHt4OjE5LCB5OjMzLCB3OjMwLCBoOjMyLCBvZmZzZXRYOi02LCBvZmZzZXRZOi0xLCBkdXJhdGlvbjowLjE4fVxuICAgICAgICAgICAge3g6NDksIHk6MzMsIHc6MTMsIGg6MzIsIG9mZnNldFg6MSwgb2Zmc2V0WTowLCBkdXJhdGlvbjowLjEzfVxuICAgICAgICAgICAge3g6NjIsIHk6MzMsIHc6MjMsIGg6MzIsIG9mZnNldFg6LTQsIG9mZnNldFk6LTEsIGR1cmF0aW9uOjAuMTh9XG4gICAgICAgICAgICB7eDo0OSwgeTozMywgdzoxMywgaDozMiwgb2Zmc2V0WDoxLCBvZmZzZXRZOjAsIGR1cmF0aW9uOjAuMTN9XG4gICAgICAgIF1cbiAgICAgICAgaXNMb29waW5nOiB0cnVlXG5cbiAgICBwbGF5ZXJTcHJpdGUuYWRkQW5pbWF0aW9uXG4gICAgICAgIG5hbWU6ICdydW5uaW5nUmlnaHQnXG4gICAgICAgIGZyYW1lczogW1xuICAgICAgICAgICAge3g6MTksIHk6MCwgdzozMCwgaDozMiwgb2Zmc2V0WDotOSwgb2Zmc2V0WTotMSwgZHVyYXRpb246MC4xOH1cbiAgICAgICAgICAgIHt4OjQ5LCB5OjAsIHc6MTMsIGg6MzIsIG9mZnNldFg6MSwgb2Zmc2V0WTowLCBkdXJhdGlvbjowLjEzfVxuICAgICAgICAgICAge3g6NjIsIHk6MCwgdzoyMywgaDozMiwgb2Zmc2V0WDotNCwgb2Zmc2V0WTotMSwgZHVyYXRpb246MC4xOH1cbiAgICAgICAgICAgIHt4OjQ5LCB5OjAsIHc6MTMsIGg6MzIsIG9mZnNldFg6MSwgb2Zmc2V0WTowLCBkdXJhdGlvbjowLjEzfVxuICAgICAgICBdXG4gICAgICAgIGlzTG9vcGluZzogdHJ1ZVxuXG4gICAgcGxheWVyU3ByaXRlLmFkZEFuaW1hdGlvblxuICAgICAgICBuYW1lOiAnc3RhbmRpbmdMZWZ0J1xuICAgICAgICBmcmFtZXM6IFtcbiAgICAgICAgICAgIHt4OjAsIHk6MzMsIHc6MTksIGg6MzIsIG9mZnNldFg6MSwgb2Zmc2V0WTowLCBkdXJhdGlvbjoxfVxuICAgICAgICBdXG4gICAgICAgIGlzTG9vcGluZzogZmFsc2VcblxuICAgIHBsYXllclNwcml0ZS5hZGRBbmltYXRpb25cbiAgICAgICAgbmFtZTogJ3N0YW5kaW5nUmlnaHQnXG4gICAgICAgIGZyYW1lczogW1xuICAgICAgICAgICAge3g6MCwgeTowLCB3OjE5LCBoOjMyLCBvZmZzZXRYOi0xLCBvZmZzZXRZOjAsIGR1cmF0aW9uOjF9XG4gICAgICAgIF1cbiAgICAgICAgaXNMb29waW5nOiBmYWxzZVxuXG4gICAgcGxheWVyID0gbmV3IFBsYXllclxuICAgICAgICBzcHJpdGU6IHBsYXllclNwcml0ZVxuICAgICAgICBwb3NYOiA2XG4gICAgICAgIHBvc1k6IDZcbiAgICAgICAgY29sVzogMVxuICAgICAgICBjb2xIOiAyXG4gICAgICAgIHNwZWVkWE1heDogOVxuICAgICAgICBhY2NlbGVyYXRpb25BaXI6IDkwMFxuICAgICAgICBkZWNlbGVyYXRpb25BaXI6IDkwMFxuICAgICAgICBhY2NlbGVyYXRpb25Hcm91bmQ6IDkwMFxuICAgICAgICBkZWNlbGVyYXRpb25Hcm91bmQ6IDkwMFxuXG5cbiAgICAjIENhbWVyYVxuXG4gICAgY29yZS5jeWNsZUNhbGxiYWNrID0gLT5cbiAgICAgICAgdmlldy5jYW1lcmFQb3NYID0gcGxheWVyLnBvc1ggLSAxNVxuXG5cbiAgICAjIEJhY2tncm91bmRcblxuICAgIGxheWVycy5hZGQgbmV3IExheWVyXG4gICAgICAgIGlkOiAnbW91bnRhaW5zJ1xuICAgICAgICBzcHJpdGVzaGVldDogJ3Nwcml0ZS1iYWNrZ3JvdW5kLnBuZydcbiAgICAgICAgaXNMb29waW5nOiB0cnVlXG4gICAgICAgIHBhcmFsbGF4OiAwLjVcbiAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICBjaHVua09mZnNldFg6IDBcbiAgICAgICAgICAgIGNodW5rT2Zmc2V0WTogMFxuICAgICAgICAgICAgY29sQm94ZXM6IFtdXG4gICAgICAgICAgICB0aWxlT2Zmc2V0WDogMFxuICAgICAgICAgICAgdGlsZU9mZnNldFk6IDEwXG4gICAgICAgICAgICB0aWxlczogWy0xLDUsNiwtMSwtMSwtMSwtMSwtMSwtMSwtMSwyMCwyMSwyMiwyMywtMSwtMSwtMSwyNywyOCwtMSwzNiwzNywzOCwzOSw0MCwtMSw0Miw0Myw0NCw0NSw1Miw1Myw1NCw1NSw1Niw1Nyw1OCw1OSw2MCw2MSw2OCw2OSw3MCw3MSw3Miw3Myw3NCw3NSw3Niw3Nyw2OCw2OCw2OCw2OCw2OCw2OCw2OCw2OCw2OCw2OCw3LDgsOSwxMCwxMSw3LDgsOSwxMCwxMV1cbiAgICAgICAgICAgIHdpZHRoOiAxMFxuICAgICAgICBdXG5cbiAgICBsYXllcnMuYWRkIG5ldyBMYXllclxuICAgICAgICBpZDogJ2Nsb3VkIDEnXG4gICAgICAgIHNwcml0ZXNoZWV0OiAnc3ByaXRlLWJhY2tncm91bmQucG5nJ1xuICAgICAgICBpc0xvb3Bpbmc6IHRydWVcbiAgICAgICAgcGFyYWxsYXg6IDAuMjFcbiAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICBjaHVua09mZnNldFg6IDUwXG4gICAgICAgICAgICBjaHVua09mZnNldFk6IDBcbiAgICAgICAgICAgIGNvbEJveGVzOiBbXVxuICAgICAgICAgICAgdGlsZU9mZnNldFg6IDMwXG4gICAgICAgICAgICB0aWxlT2Zmc2V0WTogM1xuICAgICAgICAgICAgdGlsZXM6IFswLDEsMiwzLDE2LDE3LDE4LDE5XVxuICAgICAgICAgICAgd2lkdGg6IDRcbiAgICAgICAgXVxuXG4gICAgbGF5ZXJzLmFkZCBuZXcgTGF5ZXJcbiAgICAgICAgaWQ6ICdjbG91ZCAyJ1xuICAgICAgICBzcHJpdGVzaGVldDogJ3Nwcml0ZS1iYWNrZ3JvdW5kLnBuZydcbiAgICAgICAgaXNMb29waW5nOiB0cnVlXG4gICAgICAgIHBhcmFsbGF4OiAwLjJcbiAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICBjaHVua09mZnNldFg6IDBcbiAgICAgICAgICAgIGNodW5rT2Zmc2V0WTogMFxuICAgICAgICAgICAgY29sQm94ZXM6IFtdXG4gICAgICAgICAgICB0aWxlT2Zmc2V0WDogMjlcbiAgICAgICAgICAgIHRpbGVPZmZzZXRZOiA1XG4gICAgICAgICAgICB0aWxlczogWzAsMSwyLDMsMTYsMTcsMTgsMTldXG4gICAgICAgICAgICB3aWR0aDogNFxuICAgICAgICBdXG5cblxuICAgICMgR3JvdW5kXG5cbiAgICBsYXllcnMuYWRkIG5ldyBMYXllclxuICAgICAgICBpZDogJ2dyb3VuZCdcbiAgICAgICAgc3ByaXRlc2hlZXQ6ICdzcHJpdGUtYmFja2dyb3VuZC5wbmcnXG4gICAgICAgIGNodW5rczogW1xuICAgICAgICAgICAgY2h1bmtPZmZzZXRYOiAwXG4gICAgICAgICAgICBjaHVua09mZnNldFk6IDBcbiAgICAgICAgICAgIGNvbEJveGVzOiBbXVxuICAgICAgICAgICAgdGlsZU9mZnNldFg6IDBcbiAgICAgICAgICAgIHRpbGVPZmZzZXRZOiAxM1xuICAgICAgICAgICAgdGlsZXM6IFstMSwtMSwtMSw0LC0xLC0xLC0xLC0xLC0xLC0xLC0xLDMyLDM0LDMzLDM1LC0xLC0xLC0xLC0xLC0xLC0xLC0xLC0xLC0xLC0xLC0xLC0xLC0xLC0xLC0xLDMyLDMzLDM0LDMzLDM1LC0xLC0xLC0xLC0xLC0xLC0xLC0xLDQ4LDUxLC0xLC0xLC0xLC0xLC0xLC0xLC0xLDMyLDMzLDM0LDMzLDM0LDMzLDM0LDMzLDM1LDQ4LDQ5LDUwLDQ5LDUwLDMzLDM0LDM1LC0xLC0xLC0xLC0xLDQ4LDUxLC0xLC0xLC0xLC0xLDMyLDMzLDM0LDUwLDQ5LDUwLDQ5LDUwLDQ5LDUwLDQ5LDUxLDQ4LDQ5LDUwLDQ5LDUwLDQ5LDUwLDQ5LDM0LDMzLDM0LDMzLDUwLDQ5LDM0LDMzLDM0LDMzLDUwLDQ5LDUwLDUwLDQ5LDUwLDQ5LDUwLDQ5LDUwLDQ5LDUxXVxuICAgICAgICAgICAgd2lkdGg6IDMwXG4gICAgICAgICxcbiAgICAgICAgICAgIGNodW5rT2Zmc2V0WDogMzBcbiAgICAgICAgICAgIGNodW5rT2Zmc2V0WTogMFxuICAgICAgICAgICAgY29sQm94ZXM6IFtdXG4gICAgICAgICAgICB0aWxlT2Zmc2V0WDogMFxuICAgICAgICAgICAgdGlsZU9mZnNldFk6IDEzXG4gICAgICAgICAgICB0aWxlczogWy0xLC0xLC0xLDQsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsLTEsMzIsMzQsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzQsMzMsMzUsNDgsNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTEsNDgsNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTAsNDksNTFdXG4gICAgICAgICAgICB3aWR0aDogMzBcbiAgICAgICAgXVxuIiwiIyMjIENvcHlyaWdodCAoYykgMjAxNSBNYWdudXMgTGVvLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAjIyNcblxudXRpbCA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxcblxudXRpbC5LRVlfQ09ERVMgPSB7J0JBQ0tTUEFDRSc6OCwnVEFCJzo5LCdFTlRFUic6MTMsJ1NISUZUJzoxNiwnQ1RSTCc6MTcsJ0FMVCc6MTgsJ1BBVVNFX0JSRUFLJzoxOSwnQ0FQU19MT0NLJzoyMCwnRVNDQVBFJzoyNywnUEFHRV9VUCc6MzMsJ1BBR0VfRE9XTic6MzQsJ0VORCc6MzUsJ0hPTUUnOjM2LCdMRUZUJzozNywnVVAnOjM4LCdSSUdIVCc6MzksJ0RPV04nOjQwLCdJTlNFUlQnOjQ1LCdERUxFVEUnOjQ2LCcwJzo0OCwnMSc6NDksJzInOjUwLCczJzo1MSwnNCc6NTIsJzUnOjUzLCc2Jzo1NCwnNyc6NTUsJzgnOjU2LCc5Jzo1NywnQSc6NjUsJ0InOjY2LCdDJzo2NywnRCc6NjgsJ0UnOjY5LCdGJzo3MCwnRyc6NzEsJ0gnOjcyLCdJJzo3MywnSic6NzQsJ0snOjc1LCdMJzo3NiwnTSc6NzcsJ04nOjc4LCdPJzo3OSwnUCc6ODAsJ1EnOjgxLCdSJzo4MiwnUyc6ODMsJ1QnOjg0LCdVJzo4NSwnVic6ODYsJ1cnOjg3LCdYJzo4OCwnWSc6ODksJ1onOjkwLCdMRUZUX1dJTkRPV19LRVknOjkxLCdSSUdIVF9XSU5ET1dfS0VZJzo5MiwnU0VMRUNUX0tFWSc6OTMsJ05VTVBBRF8wJzo5NiwnTlVNUEFEXzEnOjk3LCdOVU1QQURfMic6OTgsJ05VTVBBRF8zJzo5OSwnTlVNUEFEXzQnOjEwMCwnTlVNUEFEXzUnOjEwMSwnTlVNUEFEXzYnOjEwMiwnTlVNUEFEXzcnOjEwMywnTlVNUEFEXzgnOjEwNCwnTlVNUEFEXzknOjEwNSwnTVVMVElQTFknOjEwNiwnKic6MTA2LCdBREQnOjEwNywnKyc6MTA3LCdTVUJUUkFDVCc6MTA5LCdERUNJTUFMX1BPSU5UJzoxMTAsJ0RJVklERSc6MTExLCdGMSc6MTEyLCdGMic6MTEzLCdGMyc6MTE0LCdGNCc6MTE1LCdGNSc6MTE2LCdGNic6MTE3LCdGNyc6MTE4LCdGOCc6MTE5LCdGOSc6MTIwLCdGMTAnOjEyMSwnRjExJzoxMjIsJ0YxMic6MTIzLCdOVU1fTE9DSyc6MTQ0LCdTQ1JPTExfTE9DSyc6MTQ1LCdTRU1JLUNPTE9OJzoxODYsJzsnOjE4NiwnRVFVQUxfU0lHTic6MTg3LCc9JzoxODcsJ0NPTU1BJzoxODgsJywnOjE4OCwnREFTSCc6MTg5LCctJzoxODksJ1BFUklPRCc6MTkwLCcuJzoxOTAsJ0ZPUldBUkRfU0xBU0gnOjE5MSwnLyc6MTkxLCdHUkFWRV9BQ0NFTlQnOjE5MiwnT1BFTl9CUkFDS0VUJzoyMTksJ1snOjIxOSwnQkFDS19TTEFTSCc6MjIwLCdcXFxcJzoyMjAsJ0NMT1NFX0JSQUtFVCc6MjIxLCddJzoyMjEsJ1NJTkdMRV9RVU9URSc6MjIyLCdcXCcnOjIyMn1cblxudXRpbC5kb2N1bWVudEhpZGRlbiA9IC0+XG4gICAgdmVuZG9ycyA9IFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ11cbiAgICBpID0gMFxuICAgIGlmIGRvY3VtZW50LmhpZGRlbj9cbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmhpZGRlblxuXG4gICAgZm9yIHZlbmRvciBpbiB2ZW5kb3JzXG4gICAgICAgIGlmIHR5cGVvZiBkb2N1bWVudFt2ZW5kb3IgKyAnSGlkZGVuJ10gaXNudCAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50W3ZlbmRvciArICdIaWRkZW4nXVxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbnV0aWwubWVyZ2UgPSAtPlxuICAgIHJldCA9IHt9XG4gICAgZm9yIG9iaiBpbiBhcmd1bWVudHNcbiAgICAgICAgaWYgdHlwZW9mIG9iaiBpc250ICdvYmplY3QnIG9yXG4gICAgICAgIChvYmogaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGZvciBuYW1lLCB2YWwgb2Ygb2JqXG4gICAgICAgICAgICByZXRbbmFtZV0gPSB2YWxcbiAgICByZXR1cm4gcmV0XG4iLCIjIyMgQ29weXJpZ2h0IChjKSAyMDE1IE1hZ251cyBMZW8uIEFsbCByaWdodHMgcmVzZXJ2ZWQuICMjI1xuXG5iYWNrZ3JvdW5kID0gcmVxdWlyZSgnLi9iYWNrZ3JvdW5kJylcblxudmlldyA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IHZpZXdcblxudmlldy5zY2FsZSA9IDJcbnZpZXcuY2FtZXJhUG9zWCA9IDIuMCAjIFVuaXQgdGlsZVxudmlldy5jYW1lcmFQb3NZID0gMC4wXG52aWV3LmNhbWVyYVNwZWVkWCA9IDAuMCAjIE9uZSB0aWxlcyBwZXIgc2Vjb25kLCBwb3NpdGl2ZSBpcyByaWdodFxudmlldy5jYW1lcmFTcGVlZFkgPSAwLjBcbnZpZXcuY2FtZXJhV2lkdGggPSAzMFxudmlldy5jYW1lcmFIZWlnaHQgPSAxN1xuXG52aWV3LnBvc1RvUHggPSAocG9zWCwgYXhpcywgcGFyYWxsYXggPSAxLjApIC0+XG4gICAgcmV0dXJuICgocG9zWCAtIHZpZXdbJ2NhbWVyYVBvcycgKyBheGlzLnRvVXBwZXJDYXNlKCldKSAqIGJhY2tncm91bmQudGlsZVNpemUgKiBwYXJhbGxheCkgPj4gMFxuXG52aWV3LmRyYXdPbmNlUXVlID0gW11cbnZpZXcuZHJhd09uY2UgPSAoZGF0YSkgLT5cbiAgICB2aWV3LmRyYXdPbmNlUXVlLnB1c2ggZGF0YVxuIl19
