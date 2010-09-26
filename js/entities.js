/*

   entities.js - Base class for entities.

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

var MovingEntity = function (game) {
    /* Base prototype for moving entities in the game. */

    // Private vars:
    var self = this; // Reference back to 'this' for private functions.

    // Public vars:
    this.game = game;

    this.state = {x: 0,
                  y: 0,
                  dir: 0, // in degrees, 0 is 'down', 90 is 'right'
                  speed: 0,
                  destroyed: false,
                  wrap: true
                 };

    // Private functions:

    /* None */

    // Public functions:

    this.check_hit = function(other, x, y) {
        // Was this entity hit by the other entity?

        return false;
    };

    this.control = function(cur_time, delta_time) {
        // Called by the 'update' method.
        // Return false to destroy this entity.

        return true;
    };

    this.accelerate = function(dir, rate) {
        // Accelerate entity in the given direction (in degrees), and the given rate

        if (!rate) {
            return;
        }

        // Vector addition.
        var angle_rad = this.game.util.deg2rad(180 - (this.state.dir - dir));

        var new_speed = Math.sqrt(Math.pow(this.state.speed, 2) +
                                  Math.pow(rate, 2) -
                                  2 * this.state.speed * rate * Math.cos(angle_rad));

        var new_angle = Math.asin(rate * Math.sin(angle_rad) / new_speed);
        var new_dir = this.state.dir - this.game.util.rad2deg(new_angle);

        this.state.speed = new_speed;
        if (new_speed) { // If new_speed drops to 0, new_dir becomes NaN
            this.state.dir = new_dir;
        }
        else {
            this.state.dir = dir;
        }
    };

    this.update = function(cur_time, delta_time) {
        // Return false to destroy this entity.

        this.state.x += (Math.sin(this.game.util.deg2rad(this.state.dir)) * this.state.speed);
        this.state.y += (Math.cos(this.game.util.deg2rad(this.state.dir)) * this.state.speed);

        if (this.state.wrap) {
            this.state.x %= this.game.canvas.width;
            this.state.y %= this.game.canvas.height;

            if (this.state.x < 0) {
                this.state.x = this.game.canvas.width - this.state.x;
            }
            if (this.state.y < 0) {
                this.state.y = this.game.canvas.height - this.state.y;
            }
        }

        return this.control(cur_time, delta_time);
    };

    this.draw = function() {
        // Draw the entity.
    };

    return this;
};
