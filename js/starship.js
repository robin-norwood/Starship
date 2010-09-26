/*

   starship.js - Prototype for 'Game' object. 'Game' runs the whole show.

   Copyright (c) 2010 Robin Norwood <robin.norwood@gmail.com>

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

var Game = function () {
    // Private vars:

    var self = this;

    var lastTime = (new Date()).getTime();
    var entities = {};

    var tics = 20; // Minimum ms per update

    // Public vars:

    this.canvas = null;
    this.context = null;

    this.entities = entities;
    // Private functions:

    function init () {
        /* Game initialization code.  Should run only once. */
        self.canvas = $('#starship-canvas')[0];
        self.context = self.canvas.getContext("2d");

        self.util = new Util();

        resizeCanvas();

        $(window).bind('resize', self, function (e) {
            /* Many browsers fire multiple resize events during window resizing.
             * Put the resize event on a timer so we don't call it too often. */
            $.doTimeout('resize', 100, resizeCanvas);
        });
        $(window).bind('keydown', function (e) {
            switch(e.which) {
                case 37: // left arrow
                    entities.ship.beginRotate(1);
                    break;
                case 38: // up arrow
                    entities.ship.beginAccelerate(1);
                    break;
                case 39: // right arrow
                    entities.ship.beginRotate(-1);
                    break;
                case 88: // x
                    entities.ship.fire();
                    break;

            };
        });
        $(window).bind('keyup', function (e) {
            switch(e.which) {
                case 37: // left arrow
                    entities.ship.endRotate();
                    break;
                case 38: // up arrow
                    entities.ship.endAccelerate();
                    break;
                case 39: // right arrow
                    entities.ship.endRotate();
                    break;
            };
        });
    };

    var resizeCanvas = function () {
        $(self.canvas).attr("height", $(window).height());
        $(self.canvas).attr("width", $(window).width());
        if (entities.stars) {
            entities.stars = new Stars(self);
        }
    };

    var update = function () {
        var curTime = (new Date()).getTime();
        var deltaTime = curTime - lastTime;
        lastTime = curTime;

        // Update everything's state
        $.each(self.entities, function (x,entity) {
            var keep = entity.update(curTime, deltaTime);
            if (!keep) {
                delete entity; // delete entity
                delete entities[x]; // remove from entities object
            }
            return keep;
        });

        // Clear the screen
        self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);

        // Draw
        $.each(entities, function (k, entity) {
            self.context.save();
            entity.draw();
            self.context.restore();
        });

        if (!self.entities.target) {
            self.entities.target = new Target(self, 100, 100, 45, 5, 20);
        }
        $.doTimeout('update-game', tics, update);
    };

    // Public functions:

    this.check_for_hits = function (source, x, y) {
        var hit_something = false;
        $.each(entities, function(k, entity) {
            if (entity.check_hit(source, x, y)) {
                hit_something = true;
                return false; // Stop checking for hits
            }
            return true;
        });

        return hit_something;
    };

    this.start = function() {
        entities.stars = new Stars(this);
        entities.target = new Target(this, 100, 100, 45, 5, 20);
        entities.ship = new Ship(this, this.canvas.width / 2, this.canvas.height / 2, 0, 0);
        entities.bullets = new Bullets(this);

        $.doTimeout('update-game', tics, update);
    };

    // Init:

    init();

    return true;
};

$(document).ready(function () {
    var game = new Game();
    game.start();
});

