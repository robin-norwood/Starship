"use strict";

/*

   controller.js - Prototype for 'Controller' object. 'Controller' runs the whole show.

   Copyright (c) 2013 Robin Norwood <robin.norwood@gmail.com>

      This file is part of Starship.

    Starship is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Starship is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Starship.  If not, see <http://www.gnu.org/licenses/>.

 */

/*
 * Some ideas and inspiration from:
 *  http://www.somethinghitme.com/projects/jslander/
 *  http://www.ferretarmy.com/files/canvas/fullScreenCanvas/fullScreenCanvas.html
 *  http://diveintohtml5.org/canvas.html
 */


//
// shim layer with setTimeout fallback
// See http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame   ||
       window.webkitRequestAnimationFrame ||
       window.oRequestAnimationFrame      ||
       window.msRequestAnimationFrame     ||
       window.mozRequestAnimationFrame    ||
       function(callback, element) {
           window.setTimeout(callback, 1000 / 30);
       };
})();

var Controller = function (game) {
    this.entities = {};
    this.state = { "keysdown": [],
                   "keyspressed": [],
                   "pointerpos": {x: -1, y: -1},
                   "pointerdown": false,
                   "pointerclicked": false,
                   "gamestate": {}
                 };

    this.lastUpdateTime = (new Date()).getTime();
    this.game = game; //FIXME //TODO: Remember why this is a "FIXME"... :-/ //UPDATE: Nope
    this.keyhandler = new Keyhandler();

    var config = this.game.initCallback(this);

    $(this.game.canvas).attr("width", 1000); // FIXME: allow for zooming/scrolling/full window canvas
    $(this.game.canvas).attr("height", 750);

    this.screen = new Screen(this.game.canvas, config.width, config.height);
    this.audio = new AudioManager();

    this.bindEvents();

    // ready to start()

    this.game.loadCallback(this);
};

Controller.prototype = {
    log: function (msg) {
        if (console) {
            console.log(msg);
        }
    },
    bindEvents: function () {
        var self = this;

        // Bind handlers
        $(this.screen._canvas).bind('mousedown', function (e) { return self.mouseDown(e); });
        $(this.screen._canvas).bind('mousemove', function (e) { return self.mouseMove(e); });
        $(this.screen._canvas).bind('mouseup', function (e) { return self.mouseUp(e); });
        $(this.screen._canvas).bind('mouseout', function (e) { return self.mouseOut(e); });

        /* Thanks to http://www.sitepen.com/blog/2008/07/10/touching-and-gesturing-on-the-iphone/
         * for 'splaining this */

        $(this.screen._canvas).bind('touchstart', function (e) { return self.touchStart(e); });
        $(this.screen._canvas).bind('touchmove', function (e) { return self.touchMove(e); });
        $(this.screen._canvas).bind('touchend', function (e) { return self.touchEnd(e); });

        $(this.screen._canvas).bind('touchcancel', function (e) { return self.touchCancel(e); });

        $(window).bind('keydown', function (e) { return self.key(e); });
        $(window).bind('keyup', function (e) { return self.key(e); });
    },
    update: function (elapsed, controller) {
        var updateEntity = function (entity) {
            if (entity) {
                return entity.update(elapsed, controller);
            }

            return false;
        };

        Utils.deepGrep(updateEntity, this.entities);

        return;
    },
    render: function () {
        var screen = this.screen;
        screen.clear();
        var self = this;

        var renderEntity = function (entity) {
            if (entity) {
                screen.context.save();
                entity.render(screen);
                screen.context.restore();
            }
            return true;
        };

        Utils.deepGrep(renderEntity, this.entities);

        return;
    },
    key: function (event) {
        return this.keyhandler.eventToState(event, this.state);
    },
    mouseDown: function (event) {
        this.state.pointerdown = true;
        this.state.pointerpressed = true;

        event.preventDefault();
        return false;
    },
    mouseMove: function (event) {
        this.state.pointerpos = this.screen.getPos(event);

        event.preventDefault();
        return false;
    },
    mouseUp: function (event) {
        if (this.state.pointerdown) {
            this.state.pointerclicked = true;
            this.state.pointerdown = false;
        }

        event.preventDefault();
        return false;
    },
    mouseOut: function (event) {
        this.state.pointerdown = false;

        event.preventDefault();
        return false;
    },
    touchStart: function (event) {
        var theTouch = event.originalEvent.changedTouches[0];

        this.state.pointerpos = this.screen.getPos(theTouch);
        this.state.pointerdown = true;
        this.state.pointerpressed = true;

        event.preventDefault();
        return false;
    },
    touchMove: function (event) {
        var theTouch = event.originalEvent.changedTouches[0];

        this.state.pointerpos = this.screen.getPos(theTouch);

        event.preventDefault();
        return false;
    },
    touchEnd: function (event) {
        this.state.pointerdown = false;
        this.state.pointerclicked = true;

        event.preventDefault();
        return false;
    },
    touchCancel: function (event) {
        this.state.pointerdown = false;

        event.preventDefault();
        return false;
    },
    start: function () {
        var self = this; // 'this' inside animloop is not the Controller

        function animloop() {
            var now = (new Date()).getTime();
            var elapsed = now - self.lastUpdateTime;
            self.lastUpdateTime = now;
            
            var cont = self.game.loopCallback(self, elapsed);
            
            self.screen.cursor("default");
            self.update(elapsed, self); // update the state of all entities.
            self.render(self.screen); // draw all entities.
            
            self.state = { "keysdown": self.state.keysdown,
                           "keyspressed": [],
                           "pointerpos": self.state.pointerpos,
                           "pointerdown": self.state.pointerdown,
                           "pointerpressed": false,
                           "pointerclicked": false,
                           "gamestate": self.state.gamestate
                         };
            
            if (cont) {
                requestAnimFrame(animloop); // repeat
            }
        };

        animloop();
    },
    collision: function (source) {
        var hit = null;
        var self = this;
        $.each(this.entities, function(k, entity) {
            if (entity === source) {
                return true;
            }
            if (entity.check_hit(self, source)) {
                return false; // Stop checking for hits
            }
            return true;
        });

        return hit;
    }

};

