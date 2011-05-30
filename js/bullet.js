/*

   bullet.js - Bullets entity prototype and prototype for individual bullets.

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

var Bullets = function (game) {
    // Container for all bullets in the game

    // Private vars:

    var self = this;

    // Public vars:

    this.game = game;
    this.bullets = [];

    // Private functions:

    /* None */

    // Public functions:

    this.update = function (cur_time, delta_time) {
        this.bullets = $.grep(this.bullets, function (bullet) {
            var keep = bullet.update(cur_time, delta_time);
            if (!keep) {
                delete bullet;
            }
            return keep;
        });

        return true;
    };

    this.draw = function () {
        $.each(this.bullets, function (idx, bullet) {
            bullet.draw();
        });
    };

    this.fire = function (game, x, y, ship_dir, ship_speed, bearing, acceleration, lifetime) {
        this.bullets.push(new NormalBullet(game, x, y, ship_dir, ship_speed, bearing, acceleration, lifetime));
    };

    return this;

};

Bullets.prototype = new MovingEntity;

var NormalBullet = function (game, x, y, ship_dir, ship_speed, bearing, acceleration, max_lifetime) {
    // Contained by 'Bullets' entity

    // Private vars:

    var self = this;

    // Public vars:

    this.game = game;
    this.state = $.extend({}, this.state);
    $.extend(this.state, {x: x,
                          y: y,
                          dir: ship_dir == null ? 0 : ship_dir, // in degrees, 0 is 'down', 90 is 'right'
                          speed: ship_speed == null ? 0 : ship_speed,
                          lifetime: 0,
                          max_lifetime: max_lifetime == null ? 1000 : max_lifetime
                         });

    // Private functions:
    function init() {
        return;
    }

    // Public functions:

    this.control = function(cur_time, delta_time) {
        // Return false to destroy this entity
        if (this.state.lifetime == 0) {
            this.accelerate(bearing, acceleration);
        }

        this.state.lifetime += delta_time;

        if (this.state.lifetime > this.state.max_lifetime) {
            return false;
        }

        var hit_something = this.game.check_for_hits(this, this.state.x, this.state.y);
        return !hit_something;
    };

    this.draw = function() {
        // Draw the object.
        this.game.context.fillStyle = "red";
        this.game.context.fillRect(this.state.x-1, this.state.y-1, 3, 3);
    };

    init();

    return this;
};

NormalBullet.prototype = new MovingEntity;

