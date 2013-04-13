// Generated by CoffeeScript 1.6.2
/*Copyright 2013 Magnus Leo. All rights reserved.
*/


(function() {
  var Leo, LeoActor, el, _canvas, _ctx, _latestFrameTime;

  el = function(id) {
    return document.getElementById(id);
  };

  _canvas = null;

  _ctx = null;

  _latestFrameTime = Date.now();

  Leo = window.Leo = {
    init: function() {
      _canvas = el('leo-view');
      _canvas.width = _canvas.width * Leo.view.scale;
      _canvas.height = _canvas.height * Leo.view.scale;
      _ctx = _canvas.getContext('2d');
      _ctx.imageSmoothingEnabled = false;
      _ctx.webkitImageSmoothingEnabled = false;
      Leo.background.sprite = new Image();
      Leo.background.sprite.onload = function() {
        return webkitRequestAnimationFrame(Leo.cycle);
      };
      return Leo.background.sprite.src = '_img/sprite-background.png';
    },
    draw: function() {
      var actor, chunk, column, frame, tile, x, y, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2;

      _ctx.fillStyle = Leo.background.color;
      _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
      _ref = Leo.view.chunks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        chunk = _ref[_i];
        _ref1 = chunk.tiles;
        for (x = _j = 0, _len1 = _ref1.length; _j < _len1; x = ++_j) {
          column = _ref1[x];
          for (y = _k = 0, _len2 = column.length; _k < _len2; y = _k += 2) {
            tile = column[y];
            Leo.background.draw(column[y], column[y + 1], (x + chunk.tileOffsetX - Leo.view.cameraPosX + chunk.chunkOffsetX) * Leo.background.tileSize * Leo.view.scale, ((y >> 1) + chunk.tileOffsetY - Leo.view.cameraPosY + chunk.chunkOffsetY) * Leo.background.tileSize * Leo.view.scale);
          }
        }
      }
      _ref2 = Leo.actors;
      for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
        actor = _ref2[_l];
        frame = actor.animations[actor.animName].frames[actor.animFrame];
        _ctx.drawImage(actor.spriteImg, frame[0], frame[1], frame[2], frame[3], ((actor.posX - Leo.view.cameraPosX) * Leo.background.tileSize + frame[4]) * Leo.view.scale, ((actor.posY - Leo.view.cameraPosY) * Leo.background.tileSize + frame[5]) * Leo.view.scale, frame[2] * Leo.view.scale, frame[3] * Leo.view.scale);
      }
      Leo.background.draw(3, 0, 5 * Leo.background.tileSize * Leo.view.scale, 6 * Leo.background.tileSize * Leo.view.scale);
      Leo.background.draw(4, 0, 6 * Leo.background.tileSize * Leo.view.scale, 6 * Leo.background.tileSize * Leo.view.scale);
      Leo.background.draw(5, 0, 7 * Leo.background.tileSize * Leo.view.scale, 6 * Leo.background.tileSize * Leo.view.scale);
      Leo.background.draw(6, 0, 8 * Leo.background.tileSize * Leo.view.scale, 6 * Leo.background.tileSize * Leo.view.scale);
      Leo.background.draw(3, 1, 5 * Leo.background.tileSize * Leo.view.scale, 7 * Leo.background.tileSize * Leo.view.scale);
      Leo.background.draw(4, 1, 6 * Leo.background.tileSize * Leo.view.scale, 7 * Leo.background.tileSize * Leo.view.scale);
      Leo.background.draw(5, 1, 7 * Leo.background.tileSize * Leo.view.scale, 7 * Leo.background.tileSize * Leo.view.scale);
      return Leo.background.draw(6, 1, 8 * Leo.background.tileSize * Leo.view.scale, 7 * Leo.background.tileSize * Leo.view.scale);
    },
    cycle: function() {
      var actor, animation, cycleLengthMs, cycleLengthS, maxFrame, thisFrameTime, _i, _len, _ref;

      thisFrameTime = Date.now();
      cycleLengthMs = thisFrameTime - _latestFrameTime;
      cycleLengthS = cycleLengthMs * 0.001;
      Leo.view.cameraPosX += Leo.view.cameraSpeedX * cycleLengthS;
      _ref = Leo.actors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        actor = _ref[_i];
        animation = actor.animations[actor.animName];
        maxFrame = animation.frames.length - 1;
        if (actor.animFrame > maxFrame) {
          actor.animFrame = maxFrame;
        }
        actor.animFrameTimeLeft -= cycleLengthMs;
        while (actor.animFrameTimeLeft < 0) {
          actor.animFrame++;
          if (actor.animFrame > maxFrame) {
            if (animation.doLoop) {
              actor.animFrame = 0;
            }
          }
          actor.animFrameTimeLeft = animation.frames[actor.animFrame][6] + actor.animFrameTimeLeft;
        }
        actor.posX += actor.speedX;
        actor.posY += actor.speedY;
      }
      Leo.draw();
      _latestFrameTime = thisFrameTime;
      webkitRequestAnimationFrame(Leo.cycle);
      return Leo.cycleCallback();
    },
    cycleCallback: function() {},
    view: {
      scale: 2,
      cameraPosX: 2.0,
      cameraPosY: 0.0,
      cameraSpeedX: 0.0,
      cameraSpeedY: 0.0,
      chunks: [
        {
          chunkOffsetX: 0,
          chunkOffsetY: 0,
          colBoxes: [],
          tileOffsetX: 0,
          tileOffsetY: 13,
          tiles: [[-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [2, 0, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1]]
        }, {
          chunkOffsetX: 30,
          chunkOffsetY: 0,
          colBoxes: [],
          tileOffsetX: 0,
          tileOffsetY: 13,
          tiles: [[-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [2, 0, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1], [-1, -1, 0, 0, 0, 1, 0, 1], [-1, -1, 1, 0, 1, 1, 1, 1]]
        }
      ]
    },
    background: {
      tileSize: 16,
      color: '#6ec0ff',
      draw: function(spriteX, spriteY, posX, posY) {
        if (spriteX === -1 || spriteY === -1) {
          return;
        }
        return ctx.drawImage(this.sprite, spriteX * this.tileSize, spriteY * this.tileSize, this.tileSize, this.tileSize, posX, posY, this.tileSize * Leo.view.scale, this.tileSize * Leo.view.scale);
      }
    },
    actors: [],
    util: {
      KEY_CODES: {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
        19: 'pause/break',
        20: 'caps lock',
        27: 'escape',
        33: 'page up',
        34: 'page down',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'insert',
        46: 'delete',
        48: '0',
        49: '1',
        50: '2',
        51: '3',
        52: '4',
        53: '5',
        54: '6',
        55: '7',
        56: '8',
        57: '9',
        65: 'a',
        66: 'b',
        67: 'c',
        68: 'd',
        69: 'e',
        70: 'f',
        71: 'g',
        72: 'h',
        73: 'i',
        74: 'j',
        75: 'k',
        76: 'l',
        77: 'm',
        78: 'n',
        79: 'o',
        80: 'p',
        81: 'q',
        82: 'r',
        83: 's',
        84: 't',
        85: 'u',
        86: 'v',
        87: 'w',
        88: 'x',
        89: 'y',
        90: 'z',
        91: 'left window key',
        92: 'right window key',
        93: 'select key',
        96: 'numpad 0',
        97: 'numpad 1',
        98: 'numpad 2',
        99: 'numpad 3',
        100: 'numpad 4',
        101: 'numpad 5',
        102: 'numpad 6',
        103: 'numpad 7',
        104: 'numpad 8',
        105: 'numpad 9',
        106: 'multiply',
        106: '*',
        107: 'add',
        107: '+',
        109: 'subtract',
        110: 'decimal point',
        111: 'divide',
        112: 'f1',
        113: 'f2',
        114: 'f3',
        115: 'f4',
        116: 'f5',
        117: 'f6',
        118: 'f7',
        119: 'f8',
        120: 'f9',
        121: 'f10',
        122: 'f11',
        123: 'f12',
        144: 'num lock',
        145: 'scroll lock',
        186: 'semi-colon',
        186: ';',
        187: 'equal sign',
        187: '=',
        188: 'comma',
        188: ',',
        189: 'dash',
        189: '-',
        190: 'period',
        190: '.',
        191: 'forward slash',
        191: '/',
        192: 'grave accent',
        219: 'open bracket',
        219: '[',
        220: 'back slash',
        220: '\\',
        221: 'close braket',
        221: ']',
        222: 'single quote',
        222: '\''
      }
    }
  };

  LeoActor = (function() {
    function LeoActor(properties) {
      var key, val;

      this.spritesheet = "";
      this.animations = {
        example: {
          frames: [],
          doLoop: false,
          completeFallback: function() {}
        }
      };
      this.animFrameTimeLeft = 0;
      this.animFrame = 0;
      this.animName = "";
      this.posX = 0;
      this.posY = 0;
      this.speedX = 0;
      this.speedY = 0;
      for (key in properties) {
        val = properties[key];
        this[key] = val;
      }
      this.spriteImg = new Image();
      this.spriteImg.src = '_img/' + this.spritesheet;
    }

    LeoActor.prototype.setAnimation = function(animName) {
      if (animName == null) {
        animName = '';
      }
      this.animFrame = 0;
      this.animFrameTimeLeft = this.animations[animName].frames[0][6];
      return this.animName = animName;
    };

    return LeoActor;

  })();

  window.onload = function() {
    Leo.init();
    Leo.actors.push(new LeoActor({
      spritesheet: "sprite-olle.png",
      animations: {
        running: {
          frames: [[19, 0, 30, 32, -9, 0, 192], [49, 0, 13, 32, 0, 0, 192]],
          doLoop: true
        },
        standing: {
          frames: [[0, 0, 19, 32, 0, 0, 1000]],
          doLoop: true
        }
      },
      animName: "standing",
      posX: 4,
      posY: 12
    }));
    Leo.player = Leo.actors[Leo.actors.length - 1];
    window.addEventListener('keydown', function(e) {
      e.preventDefault();
      switch (Leo.util.KEY_CODES[e.keyCode]) {
        case 'left':
          Leo.player.speedX = -0.15;
          return Leo.player.setAnimation("running");
        case 'right':
          Leo.player.speedX = 0.15;
          return Leo.player.setAnimation("running");
      }
    });
    window.addEventListener('keyup', function(e) {
      Leo.player.speedX = 0;
      return Leo.player.setAnimation("standing");
    });
    return Leo.cycleCallback = function() {
      return Leo.view.cameraPosX = Leo.player.posX - 15;
    };
  };

}).call(this);
