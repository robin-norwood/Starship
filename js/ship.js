/*

   ship.js - Prototype for the player's ship.

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

var Ship = function (game, x, y, dir, speed) {
    // Private vars:

    var self = this;
    var gun_cooldown = 200; // 5 shots/sec
    // Public vars:

    this.game = game;

    this.state = $.extend({}, this.state);
    $.extend(this.state, {x: x,
                          y: y,
                          dir: dir == null ? 0 : dir, // in degrees, 0 is 'down', 90 is 'right'
                          speed: speed == null ? 0 : speed,
                          max_speed: 8,
                          max_rotation: 10,
                          bearing: 0,
                          acceleration_factor: .25,
                          acceleration: 0,
                          rot_speed: 0,
                          rot_factor: .3,
                          rotation: 0,
                          lastShotTime: game.lastTime,
                          exhaust_flicker: 0,
                          bullet_speed: 10,
                          bullet_lifetime: 1000
                         });

    // Private functions:

    /* None */

    // Public functions:

    this.control = function() {
        // Return false to destroy this entity.
        this.state.rot_speed += this.state.rotation * this.state.rot_factor;
        this.state.bearing += this.state.rot_speed;

        this.state.bearing %= 360;
        if (this.state.bearing < 0) {
            this.state.bearing += 360;
        }

        if (this.state.acceleration > 0) {
            this.accelerate(this.state.bearing, this.state.acceleration * this.state.acceleration_factor);
        }

        this.state.speed = Math.min(this.state.speed, this.state.max_speed);
        if (this.state.rot_speed > this.state.max_rotation) {
            this.state.rot_speed = this.state.max_rotation;
        }
        else if (this.state.rot_speed < this.state.max_rotation * -1) {
            this.state.rot_speed = this.state.max_rotation * -1;
        }

        this.state.rot_speed = Math.min(this.state.rot_speed, this.state.max_rotation);

        return true;
    };

    this.draw_exhaust_arc = function (bearing_rad, size, alpha) {
        alpha -= this.state.exhaust_flicker;
        this.game.context.fillStyle = "rgba(200, 200, 255, " + alpha + ")";
        this.game.context.beginPath();
        this.game.context.arc(this.state.x - Math.sin(bearing_rad) * 6,
                              this.state.y - Math.cos(bearing_rad) * 6,
                              size,
                              Math.PI - bearing_rad,
                              Math.PI * 2 - bearing_rad,
                              false);
        this.game.context.closePath();
        this.game.context.fill();
    };

    this.draw = function() {
        // Draw the object.
        var bearing_rad = this.game.util.deg2rad(this.state.bearing);
        this.game.context.strokeStyle = "HotPink"; // That's right, a hot pink spaceship.
                                                   // Got a problem with that?
        this.game.context.lineWidth = 4;
        this.game.context.beginPath();
        this.game.context.moveTo(Math.sin(bearing_rad) * 14 + this.state.x,
                                 Math.cos(bearing_rad) * 14 + this.state.y);
        this.game.context.lineTo(Math.sin(bearing_rad - Math.PI * 2/3) * 7 + this.state.x,
                                 Math.cos(bearing_rad - Math.PI * 2/3) * 7 + this.state.y);
        this.game.context.lineTo(Math.sin(bearing_rad + Math.PI * 2/3) * 7 + this.state.x,
                                 Math.cos(bearing_rad + Math.PI * 2/3) * 7 + this.state.y);
        this.game.context.lineTo(Math.sin(bearing_rad) * 14 + this.state.x,
                                 Math.cos(bearing_rad) * 14 + this.state.y);
        this.game.context.closePath();
        this.game.context.stroke();
        this.game.context.fill();

        if (this.state.acceleration > 0) {
            this.state.exhaust_flicker -= Math.random() * .08;
            if (this.state.exhaust_flicker < 0) {
                this.state.exhaust_flicker = Math.random() * .3;
            }
            this.draw_exhaust_arc(bearing_rad, 2, 1);
            this.draw_exhaust_arc(bearing_rad, 4, .8);
            this.draw_exhaust_arc(bearing_rad, 6, .6);
        }

    };

    this.beginAccelerate = function(dir) {
        this.state.acceleration = dir;
    };

    this.endAccelerate = function (dir) {
        this.state.acceleration = 0;
    };

    this.beginRotate = function (dir) {
        this.state.rotation = dir;
    };

    this.endRotate = function() {
        this.state.rotation = 0;
        this.state.rot_speed = 0;
    };

    this.fire = function () {
        if (this.game.lastTime - this.state.lastShotTime > gun_cooldown) {
            this.game.entities.bullets.fire(this.game,
                                            Math.sin(this.game.util.deg2rad(this.state.bearing)) * 14 + this.state.x,
                                            Math.cos(this.game.util.deg2rad(this.state.bearing)) * 14 + this.state.y,
                                            this.state.dir,
                                            this.state.speed,
                                            this.state.bearing,
                                            this.state.bullet_speed,
                                            this.state.bullet_lifetime);
            this.state.lastShotTime = this.game.lastTime;

            this.game.audio.play('bullet_shot');
        }
    };

    return this;
};

Ship.prototype = new MovingEntity;

