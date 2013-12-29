// Generated by CoffeeScript 1.6.2
/*Copyright 2013 Magnus Leo. All rights reserved.
*/


(function() {
  var Actor, Chunk, Layer, Leo, Line, Player, PlayerState, PlayerStateAir, PlayerStateGround, PlayerStateJumping, PlayerStateRunning, PlayerStateStanding, Rect, Shape, _camH, _camW, _camX, _camY, _editTile, _frameBuffer, _frameBufferCtx, _latestFrameTime, _pressedKeys, _ref, _view, _viewCtx,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Leo = window.Leo = {};

  _view = null;

  _viewCtx = null;

  _frameBuffer = document.createElement('canvas');

  _frameBufferCtx = _frameBuffer.getContext('2d');

  _latestFrameTime = Date.now();

  _pressedKeys = [];

  _camX = 0;

  _camY = 0;

  _camW = 0;

  _camH = 0;

  _editTile = -1;

  Leo.environment = {
    gravity: 1.0
  };

  Leo.view = {
    scale: 2,
    cameraPosX: 2.0,
    cameraPosY: 0.0,
    cameraSpeedX: 0.0,
    cameraSpeedY: 0.0,
    cameraWidth: 30,
    cameraHeight: 17
  };

  Leo.view.posToPx = function(posX, axis, parallax) {
    if (parallax == null) {
      parallax = 1.0;
    }
    return ((posX - Leo.view['cameraPos' + axis.toUpperCase()]) * Leo.background.tileSize * parallax) >> 0;
  };

  Leo.view.drawOnceQue = [];

  Leo.view.drawOnce = function(data) {
    return Leo.view.drawOnceQue.push(data);
  };

  Leo.background = {
    tileSize: 16,
    color: '#6ec0ff'
  };

  Leo.actors = [];

  Leo.shapes = [];

  Leo.core = {};

  Leo.core.init = function() {
    _view = document.getElementById('leo-view');
    Leo._view = _view;
    _frameBuffer.width = _view.width;
    _frameBuffer.height = _view.height;
    _view.width = _view.width * Leo.view.scale;
    _view.height = _view.height * Leo.view.scale;
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
      camX = Leo.view.cameraPosX;
      camY = Leo.view.cameraPosY;
      scale = Leo.view.scale;
      tileSize = Leo.background.tileSize;
      tileX = (mouseX / scale / tileSize + camX) >> 0;
      tileY = (mouseY / scale / tileSize + camY) >> 0;
      layer = Leo.layers.get('ground');
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
    window.addEventListener('keydown', Leo.event._keydown);
    window.addEventListener('keyup', Leo.event._keyup);
    return window.requestAnimationFrame(Leo.core.cycle);
  };

  Leo.core.draw = function() {
    var actor, layer, name, shape, so, val, _i, _j, _k, _len, _len1, _len2, _name, _ref, _ref1, _ref2, _ref3;

    if (Leo.util.documentHidden()) {
      return;
    }
    _camX = Leo.view.cameraPosX * Leo.background.tileSize;
    _camY = Leo.view.cameraPosY * Leo.background.tileSize;
    _camW = Leo.view.cameraWidth * Leo.background.tileSize;
    _camH = Leo.view.cameraHeight * Leo.background.tileSize;
    _frameBufferCtx.fillStyle = Leo.background.color;
    _frameBufferCtx.fillRect(0, 0, _view.width, _view.height);
    _ref = Leo.layers.objects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layer = _ref[_i];
      layer.draw();
    }
    _ref1 = Leo.actors;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      actor = _ref1[_j];
      actor.draw();
    }
    _ref2 = Leo.shapes;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      shape = _ref2[_k];
      shape.draw();
    }
    while (so = Leo.view.drawOnceQue.pop()) {
      shape = (_ref3 = Leo[_name = 'drawOnce' + so.shape]) != null ? _ref3 : Leo[_name] = new Leo[so.shape]();
      for (name in so) {
        val = so[name];
        shape[name] = val;
      }
      shape.isVisible = true;
      shape.draw();
      shape.isVisible = false;
    }
    return _viewCtx.drawImage(_frameBuffer, 0, 0, _frameBuffer.width * Leo.view.scale, _frameBuffer.height * Leo.view.scale);
  };

  Leo.core.cycle = function() {
    var actor, cycleLengthMs, thisFrameTime, _i, _len, _ref;

    thisFrameTime = Date.now();
    cycleLengthMs = Math.min(thisFrameTime - _latestFrameTime, 500);
    Leo.view.cameraPosX += Leo.view.cameraSpeedX * cycleLengthMs * 0.001;
    _ref = Leo.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      actor = _ref[_i];
      actor.update(cycleLengthMs);
    }
    Leo.core.draw();
    _latestFrameTime = thisFrameTime;
    window.requestAnimationFrame(Leo.core.cycle);
    return Leo.cycleCallback(cycleLengthMs);
  };

  Leo.core.DATA_TYPES = {
    CHUNK: 0
  };

  Leo.cycleCallback = function() {};

  Leo.event = {};

  Leo.event._keydown = function(e) {
    var data, key, keyIndex;

    if (!(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
    }
    keyIndex = _pressedKeys.indexOf(e.keyCode);
    if (keyIndex === -1) {
      _pressedKeys.push(e.keyCode);
      key = Leo.util.KEY_CODES;
      switch (e.keyCode) {
        case key.S:
          data = Leo.layers.get('ground').serialize();
          localStorage.setItem('ground', data);
          break;
        case key.L:
          data = localStorage.getItem('ground');
          Leo.layers.get('ground').deserialize(data);
      }
      return Leo.event.keydown(e);
    }
  };

  Leo.event.keydown = function(e) {};

  Leo.event._keyup = function(e) {
    var keyIndex;

    e.preventDefault();
    keyIndex = _pressedKeys.indexOf(e.keyCode);
    if (keyIndex !== -1) {
      _pressedKeys.splice(keyIndex, 1);
    }
    return Leo.event.keyup(e);
  };

  Leo.event.keyup = function(e) {};

  Leo.sprite = {};

  Leo.sprite.getImg = function(path) {
    var _img, _imgObj;

    _img = Leo.sprite._img;
    if (_img[path]) {
      return _img[path];
    } else {
      _imgObj = _img[path] = new Image();
      _imgObj.src = '_img/' + path;
      return _imgObj;
    }
  };

  Leo.sprite.remove = function(path) {
    var _img;

    _img = Leo.sprite._img;
    if (_img[path]) {
      return _img[path] = null;
    }
  };

  Leo.sprite._img = {};

  Leo.layers = {};

  Leo.layers.objects = [];

  Leo.layers.add = function(layerObj) {
    if (!(layerObj instanceof Layer) || !layerObj.id || Leo.layers.get(layerObj.id)) {
      return null;
    }
    return Leo.layers.objects.push(layerObj);
  };

  Leo.layers.get = function(id) {
    var layerObj, _i, _len, _ref;

    _ref = Leo.layers.objects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layerObj = _ref[_i];
      if (layerObj.id === id) {
        return layerObj;
      }
    }
    return null;
  };

  Leo.util = {};

  Leo.util.KEY_CODES = {
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

  Leo.util.documentHidden = function() {
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

  Leo.util.merge = function() {
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

  Leo.Shape = Shape = (function() {
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
      data = Leo.util.merge(defaultData, data);
      for (name in data) {
        val = data[name];
        this[name] = val;
      }
      Leo.shapes.push(this);
    }

    Shape.prototype.draw = function() {
      if (!this.isVisible) {
        return false;
      }
      this.drawX = Leo.view.posToPx(this.x, 'x');
      this.drawY = Leo.view.posToPx(this.y, 'y');
      this.drawW = this.w * Leo.background.tileSize;
      this.drawH = this.h * Leo.background.tileSize;
      _frameBufferCtx.fillStyle = this.fillStyle;
      _frameBufferCtx.strokeStyle = this.strokeStyle;
      return true;
    };

    return Shape;

  })();

  Leo.Rect = Rect = (function(_super) {
    __extends(Rect, _super);

    function Rect() {
      _ref = Rect.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Rect.prototype.draw = function() {
      if (!Rect.__super__.draw.apply(this, arguments)) {
        return false;
      }
      _frameBufferCtx.fillRect(this.drawX, this.drawY, this.drawW, this.drawH);
      return true;
    };

    return Rect;

  })(Shape);

  Leo.Line = Line = (function(_super) {
    __extends(Line, _super);

    function Line(data) {
      var defaultData;

      defaultData = {
        x2: 0,
        y2: 0
      };
      data = Leo.util.merge(defaultData, data);
      Line.__super__.constructor.call(this, data);
    }

    Line.prototype.draw = function() {
      if (!Line.__super__.draw.apply(this, arguments)) {
        return false;
      }
      _frameBufferCtx.beginPath();
      _frameBufferCtx.moveTo(this.drawX, this.drawY);
      _frameBufferCtx.lineTo(Leo.view.posToPx(this.x2, 'x'), Leo.view.posToPx(this.y2, 'y'));
      _frameBufferCtx.closePath();
      _frameBufferCtx.stroke();
      return true;
    };

    return Line;

  })(Shape);

  Leo.Actor = Actor = (function() {
    function Actor(properties) {
      var key, val;

      this.spritesheet = '';
      this.animations = {
        example: {
          frames: [],
          doLoop: false,
          completeFallback: function() {}
        }
      };
      this.animFrameTimeLeft = 0;
      this.animFrame = 0;
      this.animName = '';
      this.posX = 0;
      this.posY = 0;
      this.speedX = 0;
      this.speedY = 0;
      for (key in properties) {
        val = properties[key];
        this[key] = val;
      }
      this.spriteImg = Leo.sprite.getImg(this.spritesheet);
      Leo.actors.push(this);
    }

    Actor.prototype.draw = function() {
      var frame;

      frame = this.animations[this.animName].frames[this.animFrame];
      return _frameBufferCtx.drawImage(this.spriteImg, frame[0], frame[1], frame[2], frame[3], Leo.view.posToPx(this.posX, 'x') + frame[4], Leo.view.posToPx(this.posY, 'y') + frame[5], frame[2], frame[3]);
    };

    Actor.prototype.setAnimation = function(animName, animFrame) {
      if (animName == null) {
        animName = '';
      }
      if (animFrame == null) {
        animFrame = 0;
      }
      this.animFrame = animFrame;
      this.animFrameTimeLeft = this.animations[animName].frames[0][6];
      return this.animName = animName;
    };

    Actor.prototype.advanceAnimation = function(cycleLengthMs) {
      var animation, maxFrame, _results;

      animation = this.animations[this.animName];
      maxFrame = animation.frames.length - 1;
      if (this.animFrame > maxFrame) {
        this.animFrame = maxFrame;
      }
      this.animFrameTimeLeft -= cycleLengthMs;
      _results = [];
      while (this.animFrameTimeLeft < 0) {
        this.animFrame++;
        if (this.animFrame > maxFrame) {
          if (animation.doLoop) {
            this.animFrame = 0;
          } else {
            this.animFrame--;
          }
        }
        _results.push(this.animFrameTimeLeft = animation.frames[this.animFrame][6] + this.animFrameTimeLeft);
      }
      return _results;
    };

    Actor.prototype.update = function(cycleLengthMs) {
      this.advanceAnimation(cycleLengthMs);
      this.posX += this.speedX;
      return this.posY += this.speedY;
    };

    return Actor;

  })();

  Leo.Player = Player = (function(_super) {
    __extends(Player, _super);

    function Player(data) {
      Player.__super__.constructor.call(this, data);
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

    Player.prototype.handleInput = function(e) {
      return this.state.handleInput(e);
    };

    Player.prototype.update = function(cycleLengthMs) {
      var bgCorner, colAng, colH, colW, endX, endY, isHorizontalCollision, layer, movAng, neighborTile, newPosX, newPosY, newSpeedX, newSpeedY, p2Corner, startX, startY, tile, x, y, _i, _j;

      this.speedY += Leo.environment.gravity * cycleLengthMs * 0.001;
      Player.__super__.update.call(this, cycleLengthMs);
      this.state.update(cycleLengthMs);
      colW = 1;
      colH = 2;
      startX = this.posX >> 0;
      endX = (this.posX + colW) >> 0;
      startY = this.posY >> 0;
      endY = (this.posY + colH) >> 0;
      layer = Leo.layers.get('ground');
      newPosX = this.posX;
      newPosY = this.posY;
      newSpeedX = this.speedX;
      newSpeedY = this.speedY;
      for (y = _i = startY; startY <= endY ? _i <= endY : _i >= endY; y = startY <= endY ? ++_i : --_i) {
        for (x = _j = startX; startX <= endX ? _j <= endX : _j >= endX; x = startX <= endX ? ++_j : --_j) {
          tile = layer.getTile(x, y);
          if (tile > -1) {
            /*
            +----+  Player moves from P1 to P2
            | P1 |  and collides with background tile Bg.
            |    |  Player moves with vector (speedX, speedY)
            +----+
                 +----+  The angle between AB and the movement vector determines
                 | P2 |  if it is a horizontal or vertical collision.
                 |  A------+
                 +--|-B    |
                    |  Bg  |
                    +------+
            */

            if (this.speedX === 0) {
              isHorizontalCollision = false;
            } else if (this.speedY === 0) {
              isHorizontalCollision = true;
            } else {
              p2Corner = {};
              bgCorner = {};
              if (this.speedX > 0) {
                p2Corner.x = this.posX + colW;
                bgCorner.x = x;
              } else {
                p2Corner.x = this.posX;
                bgCorner.x = x + 1;
              }
              if (this.speedY > 0) {
                p2Corner.y = this.posY + colH;
                bgCorner.y = y;
              } else {
                p2Corner.y = this.posY;
                bgCorner.y = y + 1;
              }
              movAng = Math.abs(this.speedY / this.speedX);
              colAng = Math.abs((p2Corner.y - bgCorner.y) / (p2Corner.x - bgCorner.x));
              if (movAng - colAng < 0.01) {
                isHorizontalCollision = true;
              } else {
                isHorizontalCollision = false;
              }
            }
            if (isHorizontalCollision) {
              if (this.speedX > 0) {
                neighborTile = layer.getTile(x, y, -1, 0);
                if (neighborTile === -1) {
                  newPosX = x - colW - 0.01;
                  Leo.view.drawOnce({
                    shape: 'Line',
                    x: x,
                    y: y,
                    x2: x,
                    y2: y + 1,
                    strokeStyle: 'rgba(0,128,0,0.9)'
                  });
                } else {
                  Leo.view.drawOnce({
                    shape: 'Line',
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
                  Leo.view.drawOnce({
                    shape: 'Line',
                    x: x + 1,
                    y: y,
                    x2: x + 1,
                    y2: y + 1,
                    strokeStyle: 'rgba(0,128,0,0.9)'
                  });
                } else {
                  Leo.view.drawOnce({
                    shape: 'Line',
                    x: x + 1,
                    y: y,
                    x2: x + 1,
                    y2: y + 1,
                    strokeStyle: 'rgba(255,64,0,0.6)'
                  });
                }
              }
              if (this.speedX === 0 && this.state === PlayerStateRunning) {
                this.setState(PlayerStateStanding);
              }
            } else {
              if (this.speedY < 0) {
                neighborTile = layer.getTile(x, y, 0, 1);
                if (neighborTile === -1) {
                  newPosY = y + 1;
                  newSpeedY = 0;
                  Leo.view.drawOnce({
                    shape: 'Line',
                    x: x,
                    y: y + 1,
                    x2: x + 1,
                    y2: y + 1,
                    strokeStyle: 'rgba(0,128,0,0.9)'
                  });
                } else {
                  Leo.view.drawOnce({
                    shape: 'Line',
                    x: x,
                    y: y + 1,
                    x2: x + 1,
                    y2: y + 1,
                    strokeStyle: 'rgba(255,64,0,0.6)'
                  });
                }
              } else if (this.speedY > 0) {
                neighborTile = layer.getTile(x, y, 0, -1);
                if (neighborTile === -1) {
                  newPosY = y - colH;
                  newSpeedY = 0;
                  if (this.speedX === 0) {
                    this.setState(PlayerStateStanding);
                  } else {
                    this.setState(PlayerStateRunning);
                  }
                  Leo.view.drawOnce({
                    shape: 'Line',
                    x: x,
                    y: y,
                    x2: x + 1,
                    y2: y,
                    strokeStyle: 'rgba(0,128,0,0.9)'
                  });
                } else {
                  Leo.view.drawOnce({
                    shape: 'Line',
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
              Leo.view.drawOnce({
                shape: 'Rect',
                x: x,
                y: y,
                w: 1,
                h: 1,
                fillStyle: 'rgba(0,255,0,0.6)'
              });
            } else {
              Leo.view.drawOnce({
                shape: 'Rect',
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
      this.posX = newPosX;
      this.posY = newPosY;
      this.speedX = newSpeedX;
      return this.speedY = newSpeedY;
    };

    return Player;

  })(Actor);

  Leo.PlayerState = PlayerState = (function() {
    function PlayerState(parent) {
      this.parent = parent;
    }

    PlayerState.prototype.handleInput = function(e) {
      var key;

      key = Leo.util.KEY_CODES;
      switch (e.keyCode) {
        case key.LEFT:
          return this.parent.direction = -1;
        case key.RIGHT:
          return this.parent.direction = 1;
      }
    };

    PlayerState.prototype.update = function(cycleLengthMs) {};

    return PlayerState;

  })();

  Leo.PlayerStateGround = PlayerStateGround = (function(_super) {
    __extends(PlayerStateGround, _super);

    function PlayerStateGround(data) {
      PlayerStateGround.__super__.constructor.call(this, data);
    }

    PlayerStateGround.prototype.handleInput = function(e) {
      var key;

      PlayerStateGround.__super__.handleInput.call(this, e);
      key = Leo.util.KEY_CODES;
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

  Leo.PlayerStateStanding = PlayerStateStanding = (function(_super) {
    __extends(PlayerStateStanding, _super);

    function PlayerStateStanding(data) {
      PlayerStateStanding.__super__.constructor.call(this, data);
      this.parent.speedX = 0;
      if (this.parent.direction > 0) {
        this.parent.setAnimation('standingRight');
      } else {
        this.parent.setAnimation('standingLeft');
      }
    }

    PlayerStateStanding.prototype.handleInput = function(e) {
      var key;

      PlayerStateStanding.__super__.handleInput.call(this, e);
      key = Leo.util.KEY_CODES;
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

  Leo.PlayerStateRunning = PlayerStateRunning = (function(_super) {
    __extends(PlayerStateRunning, _super);

    function PlayerStateRunning(data) {
      PlayerStateRunning.__super__.constructor.call(this, data);
      this._setSpeedAndAnim();
      if (this.parent.stateBefore instanceof PlayerStateAir) {
        this.parent.animFrame = 1;
      }
    }

    PlayerStateRunning.prototype.handleInput = function(e) {
      var key, keyIndexLeft, keyIndexRight;

      PlayerStateRunning.__super__.handleInput.call(this, e);
      key = Leo.util.KEY_CODES;
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
            keyIndexLeft = _pressedKeys.indexOf(key.LEFT);
            keyIndexRight = _pressedKeys.indexOf(key.RIGHT);
            if (keyIndexLeft === -1 && keyIndexRight === -1) {
              return this.parent.setState(PlayerStateStanding);
            } else if (keyIndexLeft === -1 && keyIndexRight > -1) {
              this.parent.direction = 1;
              return this._setSpeedAndAnim({
                animFrame: 1
              });
            } else {
              this.parent.direction = -1;
              return this._setSpeedAndAnim({
                animFrame: 1
              });
            }
        }
      }
    };

    PlayerStateRunning.prototype._setSpeedAndAnim = function(options) {
      if (options == null) {
        options = {};
      }
      this.parent.speedX = 0.15 * this.parent.direction;
      if (this.parent.direction > 0) {
        return this.parent.setAnimation('runningRight', options.animFrame);
      } else {
        return this.parent.setAnimation('runningLeft', options.animFrame);
      }
    };

    return PlayerStateRunning;

  })(PlayerStateGround);

  Leo.PlayerStateAir = PlayerStateAir = (function(_super) {
    __extends(PlayerStateAir, _super);

    function PlayerStateAir(data) {
      PlayerStateAir.__super__.constructor.call(this, data);
    }

    PlayerStateAir.prototype.handleInput = function(e) {
      return PlayerStateAir.__super__.handleInput.call(this, e);
    };

    PlayerStateAir.prototype.update = function(cycleLengthMs) {
      return PlayerStateAir.__super__.update.call(this, cycleLengthMs);
    };

    return PlayerStateAir;

  })(PlayerState);

  Leo.PlayerStateJumping = PlayerStateJumping = (function(_super) {
    __extends(PlayerStateJumping, _super);

    function PlayerStateJumping(data) {
      PlayerStateJumping.__super__.constructor.call(this, data);
      this.parent.speedY = -0.35;
      if (this.parent.direction > 0) {
        this.parent.setAnimation('jumpingRight');
      } else {
        this.parent.setAnimation('jumpingLeft');
      }
    }

    PlayerStateJumping.prototype.handleInput = function(e) {
      var key, keyIndexLeft, keyIndexRight;

      PlayerStateJumping.__super__.handleInput.call(this, e);
      key = Leo.util.KEY_CODES;
      if (e.type === 'keydown') {
        switch (e.keyCode) {
          case key.LEFT:
            this.parent.direction = -1;
            return this._setSpeedAndAnim();
          case key.RIGHT:
            this.parent.direction = 1;
            return this._setSpeedAndAnim();
        }
      } else if (e.type === 'keyup') {
        switch (e.keyCode) {
          case key.LEFT:
          case key.RIGHT:
            keyIndexLeft = _pressedKeys.indexOf(key.LEFT);
            keyIndexRight = _pressedKeys.indexOf(key.RIGHT);
            if (keyIndexLeft === -1 && keyIndexRight === -1) {
              return this.parent.speedX = 0;
            } else if (keyIndexLeft === -1 && keyIndexRight > -1) {
              this.parent.direction = 1;
              return this._setSpeedAndAnim();
            } else {
              this.parent.direction = -1;
              return this._setSpeedAndAnim();
            }
        }
      }
    };

    PlayerStateJumping.prototype._setSpeedAndAnim = function() {
      this.parent.speedX = 0.15 * this.parent.direction;
      if (this.parent.direction > 0) {
        return this.parent.setAnimation('jumpingRight');
      } else {
        return this.parent.setAnimation('jumpingLeft');
      }
    };

    return PlayerStateJumping;

  })(PlayerStateAir);

  Leo.Layer = Layer = (function() {
    function Layer(properties) {
      var chunk, i, key, layer, val, _i, _len, _ref1;

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
      this.spriteImg = Leo.sprite.getImg(this.spritesheet);
      layer = this;
      this.spriteImg.addEventListener('load', function() {
        var chunk, _i, _len, _ref1;

        if (!layer.chunks) {
          return;
        }
        _ref1 = layer.chunks;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          chunk = _ref1[_i];
          chunk.redraw();
        }
      });
      this.layerNumTilesX = 0;
      _ref1 = this.chunks;
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        chunk = _ref1[i];
        this.chunks[i] = new Chunk(this, chunk);
        this.layerNumTilesX += chunk.tiles.length + chunk.tileOffsetX;
      }
    }

    Layer.prototype.draw = function() {
      var chunk, multiplier, posX, posY, _i, _j, _len, _len1, _ref1, _ref2;

      if (this.isLooping) {
        chunk = this.chunks[0];
        posX = Leo.view.posToPx(chunk.tileOffsetX + chunk.chunkOffsetX, 'x', this.parallax);
        multiplier = ((Leo.view.cameraPosX / this.layerNumTilesX * this.parallax) >> 0) - 1;
        posX += this.layerNumTilesX * Leo.background.tileSize * multiplier;
        while (posX < _camW) {
          _ref1 = this.chunks;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            chunk = _ref1[_i];
            posY = Leo.view.posToPx(chunk.tileOffsetY + chunk.chunkOffsetY, 'y');
            chunk.draw(posX, posY);
            posX += chunk.drawBuffer.width + chunk.tileOffsetXPx;
          }
        }
      } else {
        _ref2 = this.chunks;
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          chunk = _ref2[_j];
          posX = Leo.view.posToPx(chunk.tileOffsetX + chunk.chunkOffsetX, 'x', this.parallax);
          posY = Leo.view.posToPx(chunk.tileOffsetY + chunk.chunkOffsetY, 'y');
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
      chunkNo = ((tileX + offsetX) / this.chunks[0].width) >> 0;
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
      var chunk, chunkData, data, _i, _len, _ref1;

      data = '';
      _ref1 = this.chunks;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        chunk = _ref1[_i];
        data += String.fromCharCode(Leo.core.DATA_TYPES.CHUNK);
        chunkData = chunk.serialize();
        data += String.fromCharCode(chunkData.length) + chunkData;
      }
      return data;
    };

    Layer.prototype.deserialize = function(data) {
      var chunkOffsetX, i, length, numChunks, t, _results;

      chunkOffsetX = 0;
      this.chunks.length = 0;
      t = Leo.core.DATA_TYPES;
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

  Leo.Chunk = Chunk = (function() {
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
      this.drawBuffer.width = this.width * Leo.background.tileSize;
      this.drawBuffer.height = ((this.tiles.length / this.width) >> 0) * Leo.background.tileSize;
      this.tileOffsetXPx = this.tileOffsetX * Leo.background.tileSize;
    }

    Chunk.prototype.draw = function(posX, posY) {
      var i, x, y, _i, _ref1;

      if (posX < -this.drawBuffer.width || posX > _camW || posY < -this.drawBuffer.height || posY > _camH) {
        return;
      }
      if (this.drawBufferDirty) {
        this.drawBufferCtx.clearRect(0, 0, this.drawBuffer.width, this.drawBuffer.height);
        for (i = _i = 0, _ref1 = this.tiles.length; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          x = i % this.width;
          y = (i / this.width) >> 0;
          this.drawTile(this.drawBufferCtx, this.tiles[i], x * Leo.background.tileSize, (y + this.chunkOffsetY) * Leo.background.tileSize);
        }
        this.drawBufferDirty = false;
      }
      return _frameBufferCtx.drawImage(this.drawBuffer, 0, 0, this.drawBuffer.width, this.drawBuffer.height, posX, posY, this.drawBuffer.width, this.drawBuffer.height);
    };

    Chunk.prototype.redraw = function() {
      return this.drawBufferDirty = true;
    };

    Chunk.prototype.drawTile = function(ctx, spriteN, posX, posY) {
      var spriteWidth, spriteX, spriteY, tileSize;

      if (spriteN === -1) {
        return;
      }
      tileSize = Leo.background.tileSize;
      spriteWidth = 16;
      spriteX = spriteN % spriteWidth;
      spriteY = (spriteN / spriteWidth) >> 0;
      return ctx.drawImage(this.layer.spriteImg, spriteX * tileSize, spriteY * tileSize, tileSize, tileSize, posX >> 0, posY >> 0, tileSize, tileSize);
    };

    Chunk.prototype.serialize = function() {
      var data, tile, _i, _len, _ref1;

      data = '';
      _ref1 = this.tiles;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        tile = _ref1[_i];
        data += String.fromCharCode(tile + 1);
      }
      return data;
    };

    Chunk.prototype.deserialize = function(data) {
      var i, _i, _ref1;

      this.drawBufferDirty = true;
      this.tiles.length = 0;
      for (i = _i = 0, _ref1 = data.length; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        this.tiles.push(data.charCodeAt(i) - 1);
      }
      return this.drawBuffer.height = ((this.tiles.length / this.width) >> 0) * Leo.background.tileSize;
    };

    return Chunk;

  })();

  window.onload = function() {
    Leo.core.init();
    Leo.event.keydown = function(e) {
      var key;

      key = Leo.util.KEY_CODES;
      switch (e.keyCode) {
        case key.R:
          return window.location.reload();
        default:
          return Leo.player.handleInput(e);
      }
    };
    Leo.event.keyup = function(e) {
      return Leo.player.handleInput(e);
    };
    Leo.player = new Leo.Player({
      spritesheet: 'sprite-olle.png',
      animations: {
        jumpingLeft: {
          frames: [[19, 33, 30, 32, -4, 0, 192]],
          doLoop: false
        },
        jumpingRight: {
          frames: [[19, 0, 30, 32, -8, 0, 192]],
          doLoop: false
        },
        runningLeft: {
          frames: [[19, 33, 30, 32, -4, 0, 192], [49, 33, 13, 32, 4, 0, 192]],
          doLoop: true
        },
        runningRight: {
          frames: [[19, 0, 30, 32, -8, 0, 192], [49, 0, 13, 32, 1, 0, 192]],
          doLoop: true
        },
        standingLeft: {
          frames: [[0, 33, 19, 32, 1, 0, 1000]],
          doLoop: false
        },
        standingRight: {
          frames: [[0, 0, 19, 32, -1, 0, 1000]],
          doLoop: false
        }
      },
      animName: 'standingRight',
      posX: 6,
      posY: 6
    });
    Leo.cycleCallback = function() {
      return Leo.view.cameraPosX = Leo.player.posX - 15;
    };
    Leo.layers.add(new Leo.Layer({
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
    Leo.layers.add(new Leo.Layer({
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
    Leo.layers.add(new Leo.Layer({
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
    return Leo.layers.add(new Leo.Layer({
      id: 'ground',
      spritesheet: 'sprite-background.png',
      chunks: [
        {
          chunkOffsetX: 0,
          chunkOffsetY: 0,
          colBoxes: [],
          tileOffsetX: 0,
          tileOffsetY: 13,
          tiles: [-1, -1, -1, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 32, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 34, 33, 35, 48, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 51, 48, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 50, 49, 51],
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
  };

}).call(this);

/*
//@ sourceMappingURL=main.map
*/
