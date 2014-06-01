var Actor, Animation, Chunk, Frame, Layer, Leo, Line, Player, PlayerState, PlayerStateAir, PlayerStateFalling, PlayerStateGround, PlayerStateJumping, PlayerStateRunning, PlayerStateStanding, Rect, Shape, Sprite, _camH, _camW, _camX, _camY, _editTile, _frameBuffer, _frameBufferCtx, _latestFrameTime, _pressedKeys, _view, _viewCtx,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

(function() {
  var lastTime, vendors, x;
  lastTime = 0;
  vendors = ["ms", "moz", "webkit", "o"];
  x = 0;
  while (x < vendors.length && !window.requestAnimationFrame) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
    ++x;
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime, id, timeToCall;
      currTime = new Date().getTime();
      timeToCall = Math.max(0, 16 - (currTime - lastTime));
      id = window.setTimeout(function() {
        return callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    return window.cancelAnimationFrame = function(id) {
      return clearTimeout(id);
    };
  }
})();


/* Copyright (c) 2014 Magnus Leo. All rights reserved. */

Leo = window.Leo != null ? window.Leo : window.Leo = {};

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


/* Copyright (c) 2014 Magnus Leo. All rights reserved. */

Leo = window.Leo != null ? window.Leo : window.Leo = {};

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
  gravity: 60
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

Leo.core.imgPath = '_img/';

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
  var actor, layer, name, shape, so, val, _i, _j, _k, _len, _len1, _len2, _name, _ref, _ref1, _ref2;
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
    shape = Leo[_name = 'drawOnce' + so.shape] != null ? Leo[_name] : Leo[_name] = new Leo[so.shape]();
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
  var actor, cycleLength, thisFrameTime, _i, _len, _ref;
  thisFrameTime = Date.now();
  cycleLength = Math.min(thisFrameTime - _latestFrameTime, 100) * 0.001;
  if (!cycleLength) {
    return;
  }
  Leo.view.cameraPosX += Leo.view.cameraSpeedX * cycleLength;
  _ref = Leo.actors;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    actor = _ref[_i];
    actor.update(cycleLength);
  }
  Leo.core.draw();
  _latestFrameTime = thisFrameTime;
  window.requestAnimationFrame(Leo.core.cycle);
  return Leo.cycleCallback(cycleLength);
};

Leo.core.DATA_TYPES = {
  CHUNK: 0
};

Leo.cycleCallback = function() {};


/* Copyright (c) 2014 Magnus Leo. All rights reserved. */

Leo = window.Leo != null ? window.Leo : window.Leo = {};

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

Leo.io = {};

Leo.io.getPressedKeys = function() {
  return _pressedKeys;
};

Leo.io.isKeyPressed = function(key) {
  if (typeof key === 'string') {
    key = Leo.util.KEY_CODES[key.toUpperCase()];
  }
  if (typeof key !== 'number') {
    return false;
  }
  return _pressedKeys.indexOf(key) > -1;
};

Leo.io.anyKeyPressed = function(keys) {
  var key, keyCodes, _i, _len;
  keyCodes = Leo.util.KEY_CODES;
  if (typeof key === 'string') {
    key = [key];
  }
  for (_i = 0, _len = keys.length; _i < _len; _i++) {
    key = keys[_i];
    if (typeof key === 'string') {
      key = keyCodes[key.toUpperCase()];
    }
    if (_pressedKeys.indexOf(key) > -1) {
      return true;
    }
  }
  return false;
};

Leo.io.allKeysPressed = function(keys) {
  var key, keyCodes, _i, _len;
  keyCodes = Leo.util.KEY_CODES;
  if (typeof key === 'string') {
    key = [key];
  }
  for (_i = 0, _len = keys.length; _i < _len; _i++) {
    key = keys[_i];
    if (typeof key === 'string') {
      key = keyCodes[key.toUpperCase()];
    }
    if (_pressedKeys.indexOf(key) === -1) {
      return false;
    }
  }
  return true;
};


/* Copyright (c) 2014 Magnus Leo. All rights reserved. */

Leo = window.Leo != null ? window.Leo : window.Leo = {};

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
    return Rect.__super__.constructor.apply(this, arguments);
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


/* Copyright (c) 2014 Magnus Leo. All rights reserved. */

Leo = window.Leo != null ? window.Leo : window.Leo = {};

Leo.sprite = {};

Leo.sprite.Sprite = Sprite = (function() {
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
    return _frameBufferCtx.drawImage(this.spriteImg, frameData[0], frameData[1], frameData[2], frameData[3], Leo.view.posToPx(x, 'x') + frameData[4], Leo.view.posToPx(y, 'y') + frameData[5], frameData[2], frameData[3]);
  };

  Sprite.prototype.getImg = function() {
    var path, _img, _imgObj;
    path = this.spritesheet;
    if (_img = this._img[path]) {
      return _img[path];
    } else {
      _imgObj = this._img[path] = new Image();
      _imgObj.src = Leo.core.imgPath + path;
      return _imgObj;
    }
  };

  Sprite.prototype._img = {};

  return Sprite;

})();

Leo.sprite.Animation = Animation = (function() {
  function Animation(sprite, options) {
    var defaultOptions, frameData, _i, _len, _ref;
    defaultOptions = {
      isLooping: false
    };
    this.options = Leo.util.merge(defaultOptions, options);
    if (!(sprite instanceof Sprite)) {
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

Leo.sprite.Frame = Frame = (function() {
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
    data = Leo.util.merge(defaultData, data);
    this.data = [data.x, data.y, data.w, data.h, data.offsetX, data.offsetY, data.duration];
  }

  return Frame;

})();


/* Copyright (c) 2014 Magnus Leo. All rights reserved. */

Leo = window.Leo != null ? window.Leo : window.Leo = {};

Leo.collision = {};

Leo.collision.actorToLayer = function(actor, layer, options) {
  var a2Corner, bgCorner, colAng, collisions, endX, endY, isHorizontalCollision, movAng, neighborTile, newPosX, newPosY, newSpeedX, newSpeedY, o, startX, startY, tile, x, y, _i, _j;
  o = {
    reposition: false
  };
  o = Leo.util.merge(o, options);
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
              newSpeedX = 0;
              collisions.any = true;
              collisions.left = true;
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
        } else {
          if (actor.speedY < 0) {
            neighborTile = layer.getTile(x, y, 0, 1);
            if (neighborTile === -1) {
              newPosY = y + 1;
              newSpeedY = 0;
              collisions.any = true;
              collisions.top = true;
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
          } else if (actor.speedY > 0) {
            neighborTile = layer.getTile(x, y, 0, -1);
            if (neighborTile === -1) {
              newPosY = y - actor.colH;
              newSpeedY = 0;
              collisions.any = true;
              collisions.bottom = true;
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
  if (o.reposition) {
    actor.posX = newPosX;
    actor.posY = newPosY;
    actor.speedX = newSpeedX;
    actor.speedY = newSpeedY;
  }
  return collisions;
};


/* Copyright (c) 2014 Magnus Leo. All rights reserved. */

Leo = window.Leo != null ? window.Leo : window.Leo = {};

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

Leo.layers.getImg = function(path) {
  var _img, _imgObj;
  _img = Leo.layers._img;
  if (_img[path]) {
    return _img[path];
  } else {
    _imgObj = _img[path] = new Image();
    _imgObj.src = '_img/' + path;
    return _imgObj;
  }
};

Leo.layers.removeImg = function(path) {
  var _img;
  _img = Leo.layers._img;
  if (_img[path]) {
    return _img[path] = null;
  }
};

Leo.layers._img = {};

Leo.Layer = Layer = (function() {
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
    this.spriteImg = Leo.layers.getImg(this.spritesheet);
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
      posX = Leo.view.posToPx(chunk.tileOffsetX + chunk.chunkOffsetX, 'x', this.parallax);
      multiplier = ((Leo.view.cameraPosX / this.layerNumTilesX * this.parallax) >> 0) - 1;
      posX += this.layerNumTilesX * Leo.background.tileSize * multiplier;
      while (posX < _camW) {
        _ref = this.chunks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          chunk = _ref[_i];
          posY = Leo.view.posToPx(chunk.tileOffsetY + chunk.chunkOffsetY, 'y');
          chunk.draw(posX, posY);
          posX += chunk.drawBuffer.width + chunk.tileOffsetXPx;
        }
      }
    } else {
      _ref1 = this.chunks;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        chunk = _ref1[_j];
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
    var i, x, y, _i, _ref;
    if (posX < -this.drawBuffer.width || posX > _camW || posY < -this.drawBuffer.height || posY > _camH) {
      return;
    }
    if (this.drawBufferDirty) {
      this.drawBufferCtx.clearRect(0, 0, this.drawBuffer.width, this.drawBuffer.height);
      for (i = _i = 0, _ref = this.tiles.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
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
    return this.drawBuffer.height = ((this.tiles.length / this.width) >> 0) * Leo.background.tileSize;
  };

  return Chunk;

})();


/* Copyright (c) 2014 Magnus Leo. All rights reserved. */

Leo = window.Leo != null ? window.Leo : window.Leo = {};

Leo.Actor = Actor = (function() {
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
    Leo.actors.push(this);
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


/* Copyright (c) 2014 Magnus Leo. All rights reserved. */

Leo = window.Leo != null ? window.Leo : window.Leo = {};

Leo.Player = Player = (function(_super) {
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
    this.speedY += Leo.environment.gravity * cycleLength;
    this.speedX += this.accX * cycleLength;
    this.speedX = Math.min(this.speedX, this.speedXMax);
    this.speedX = Math.max(this.speedX, -this.speedXMax);
    Player.__super__.update.call(this, cycleLength);
    this.state.update(cycleLength);
    collisions = Leo.collision.actorToLayer(this, Leo.layers.get('ground'), {
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

Leo.PlayerState = PlayerState = (function() {
  function PlayerState(parent) {
    this.parent = parent;
  }

  PlayerState.prototype.handleInput = function(e) {
    var key;
    key = Leo.util.KEY_CODES;
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
      this.parent.sprite.getCurrentAnimation().jumpToFrame(1);
    }
  }

  PlayerStateRunning.prototype.handleInput = function(e) {
    var key, leftPressed, rightPressed;
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
          rightPressed = Leo.io.isKeyPressed(key.RIGHT);
          leftPressed = Leo.io.isKeyPressed(key.LEFT);
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

Leo.PlayerStateAir = PlayerStateAir = (function(_super) {
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
          rightPressed = Leo.io.isKeyPressed(key.RIGHT);
          leftPressed = Leo.io.isKeyPressed(key.LEFT);
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

Leo.PlayerStateJumping = PlayerStateJumping = (function(_super) {
  __extends(PlayerStateJumping, _super);

  function PlayerStateJumping(data) {
    PlayerStateJumping.__super__.constructor.apply(this, arguments);
    this.parent.speedY = -21;
  }

  PlayerStateJumping.prototype.handleInput = function(e) {
    var key;
    PlayerStateJumping.__super__.handleInput.apply(this, arguments);
    key = Leo.util.KEY_CODES;
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

Leo.PlayerStateFalling = PlayerStateFalling = (function(_super) {
  __extends(PlayerStateFalling, _super);

  function PlayerStateFalling() {
    return PlayerStateFalling.__super__.constructor.apply(this, arguments);
  }

  return PlayerStateFalling;

})(PlayerStateAir);


/* Copyright (c) 2014 Magnus Leo. All rights reserved. */

Leo = window.Leo != null ? window.Leo : window.Leo = {};

window.addEventListener('load', function() {
  var playerSprite;
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
  playerSprite = new Leo.sprite.Sprite('sprite-olle.png');
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
  Leo.player = new Leo.Player({
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

//# sourceMappingURL=game.js.map
