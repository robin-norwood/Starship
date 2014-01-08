/*

   ship.js - Prototype for the player's ship.

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

var Ship = function (x, y, dir, speed) {
    this.gun_cooldown = 200; // 5 shots/sec
    this.gun_cooldown_timer = 0;
    this.x = x;
    this.y = y;
    this.dir = dir == null ? 0 : dir; // in radians, 0 is 'down', Math.PI/2 is 'right'
    this.speed = speed == null ? 0 : speed;
    this.max_speed = 1;
    this.max_rotation = .1; // radians
    this.bearing = 0;
    this.acceleration_factor = .005;
    this.acceleration = 0;
    this.rot_speed = 0; // radians
    this.rot_factor = .005; // radians
    this.rotation = 0; // 1 : counter-clockwise, -1 : clockwise
    this.exhaust_flicker = 0;
    this.bullet_speed = .25;
    this.bullet_lifetime = 500;
    this.wrap = true;

    this.entities = [];

}

Ship.prototype = $.extend({}, MovingEntity.prototype, {
    update: function(elapsed, controller) {
        // Return false to destroy this entity.
        var hit_something = controller.collision(this);

        if (this.gun_cooldown_timer > 0) {
            this.gun_cooldown_timer -= elapsed;
        }

        this.rotation = 0;
        this.acceleration = 0;

        if (Utils.contains(controller.state.keysdown, "left")) {
            this.rotation = 1;
        }

        if (Utils.contains(controller.state.keysdown, "right")) {
            this.rotation = -1;
        }

        if (Utils.contains(controller.state.keysdown, "up")) {
            this.acceleration = 1;
        }

        if (Utils.contains(controller.state.keysdown, "x")) {
            this.fire(elapsed, controller);
        }

        if (!this.rotation) {
            if (this.rot_speed < 0) {
                this.rotation = 1;
            } else if (this.rot_speed > 0) {
                this.rotation = -1;
            }
        }

        this.rot_speed += this.rotation * this.rot_factor;

        if (Math.abs(this.rot_speed) < .0001) {
            this.rot_speed = 0;
        }

        this.bearing += this.rot_speed;

        this.bearing %= Math.PI * 2;
        if (this.bearing < 0) {
            this.bearing += Math.PI * 2;
        }

        if (this.acceleration > 0) {
            this.accelerate({angle: this.bearing, magnitude: this.acceleration * this.acceleration_factor});
        }

        this.speed = Math.min(this.speed, this.max_speed);
        if (this.rot_speed > this.max_rotation) {
            this.rot_speed = this.max_rotation;
        }
        else if (this.rot_speed < this.max_rotation * -1) {
            this.rot_speed = this.max_rotation * -1;
        }

        MovingEntity.prototype.update.call(this, elapsed, controller);

        return true;
    },

    draw_exhaust_arc: function (screen, bearing, size, alpha) {
        alpha -= this.exhaust_flicker;
        screen.context.fillStyle = "rgba(200, 200, 255, " + alpha + ")";
        screen.context.beginPath();
        screen.context.arc(this.x - Math.sin(bearing) * 6,
                           this.y - Math.cos(bearing) * 6,
                           size,
                           Math.PI - bearing,
                           Math.PI * 2 - bearing,
                           false);
        screen.context.closePath();
        screen.context.fill();
    },

    render: function(screen) {
        // Draw the object.
        screen.context.strokeStyle = "HotPink"; // That's right, a hot pink spaceship.
                                                // Got a problem with that?
        screen.context.lineWidth = 4;
        screen.context.beginPath();
        screen.context.moveTo(Math.sin(this.bearing) * 14 + this.x,
                              Math.cos(this.bearing) * 14 + this.y);
        screen.context.lineTo(Math.sin(this.bearing - Math.PI * 2/3) * 7 + this.x,
                              Math.cos(this.bearing - Math.PI * 2/3) * 7 + this.y);
        screen.context.lineTo(Math.sin(this.bearing + Math.PI * 2/3) * 7 + this.x,
                              Math.cos(this.bearing + Math.PI * 2/3) * 7 + this.y);
        screen.context.lineTo(Math.sin(this.bearing) * 14 + this.x,
                              Math.cos(this.bearing) * 14 + this.y);
        screen.context.closePath();
        screen.context.stroke();
        screen.context.fill();

        if (this.acceleration > 0) {
            this.exhaust_flicker -= Math.random() * .08;
            if (this.exhaust_flicker < 0) {
                this.exhaust_flicker = Math.random() * .3;
            }
            this.draw_exhaust_arc(screen, this.bearing, 2, 1);
            this.draw_exhaust_arc(screen, this.bearing, 4, .8);
            this.draw_exhaust_arc(screen, this.bearing, 6, .6);
        }

    },

    fire: function (elapsed, controller) {
        if (this.gun_cooldown_timer <= 0) {
            this.entities.push(new NormalBullet(Math.sin(this.bearing) * 14 + this.x,
                                                Math.cos(this.bearing) * 14 + this.y,
                                                this.dir,
                                                this.speed,
                                                this.bearing,
                                                this.bullet_speed,
                                                this.bullet_lifetime));

            this.gun_cooldown_timer = this.gun_cooldown;

            controller.audio.play('bullet_shot');
        }
    }

});

