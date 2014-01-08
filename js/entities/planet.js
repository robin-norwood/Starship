/*

   planet.js - An image that lives at a given position for a specified time.

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

var Planet = function (x, y) {
    this.x = x;
    this.y = y;
    this.mass = 100;
    this.has_mass = true;
    this.radius = 50;
    this.img = $('.image#planet').get(0);
};

Planet.prototype = $.extend({}, Entity.prototype, {
    check_hit: function (controller, other) {
        if (other.has_mass) {
            var distance_sq = Utils.distance(this.x, this.y, other.x, other.y);
            distance_sq *= distance_sq;
            distance_sq = Math.round(distance_sq);
            var accel = 0;
            if (distance_sq != 0) {
                accel = 0.67384 * (this.mass / distance_sq);
            }
            var angle = Utils.angle(other.x, other.y, this.x, this.y);
            if (accel && angle) {
                other.accelerate({angle: angle, magnitude: accel});
            }
            console.log("accel: " + accel + " angle: " + angle);
        }
        return false;
    },

    update: function (elapsed, controller) {
        return true;
    },

    render: function (screen) {
        // Draw the object.
        screen.context.drawImage(this.img, this.x - this.radius/2, this.y - this.radius/2, this.radius, this.radius);
    }

});

