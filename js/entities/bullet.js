/*

   bullet.js - Bullets entity prototype and prototype for individual bullets.

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

var NormalBullet = function (x, y, ship_dir, ship_speed, bearing, acceleration, max_lifetime) {
    this.x = x;
    this.y = y;
    this.dir = ship_dir == null ? 0 : ship_dir;
    this.speed = ship_speed == null ? 0 : ship_speed;
    this.lifetime = 0;
    this.max_lifetime = max_lifetime == null ? 1000 : max_lifetime
    this.bearing = bearing;
    this.acceleration = acceleration;
};

NormalBullet.prototype = $.extend({}, MovingEntity.prototype, {
    update: function(elapsed, controller) {
        // Return false to destroy this entity
        if (this.lifetime == 0) {
            this.accelerate({angle: this.bearing, magnitude: this.acceleration});
            this.bearing = 0;
            this.acceleration = 0;
        }

        this.lifetime += elapsed;

        if (this.lifetime > this.max_lifetime) {
            return false;
        }

        var hit_something = controller.collision(this);

        if (hit_something) {
            return false;
        }
        else {
            return MovingEntity.prototype.update.call(this, elapsed, controller);
        }
    },

    render: function(screen) {
        // Draw the object.
        screen.context.fillStyle = "red";
        screen.context.fillRect(this.x-1, this.y-1, 3, 3);
    }

});

