/*

   indicator.js - An image that lives at a given position for a specified time.

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

var Indicator = function (x, y, name, duration) {
    this.x = x;
    this.y = y;
    this.duration = duration;
    this.name = name;
    this.img = $('.image#' + this.name).get(0);

}

Indicator.prototype = $.extend({}, Entity.prototype, {

    check_hit: function () {
        return false;
    },

    update: function (elapsed, controller) {
        // Return false to destroy this entity
        
        if (this.duration -= elapsed < 0) {
            return false;
        }

        return true;

    },

    render: function (screen) {
        // Draw the object.
        screen.context.drawImage(this.img, this.x, this.y);
    }

});
