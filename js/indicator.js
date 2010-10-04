/*

   indicator.js - An image that lives at a given position for a specified time.

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

var Indicator = function (game, x, y, name, duration) {
    // Private vars:
    var self = this; // Reference back to 'this' for private functions.
    this.game = game;

    this.state = {};
    $.extend(this.state, {x: x,
                          y: y,
                          duration: duration,
                          name: name,
                          img: null
                         });

    // Public vars:

    // Private functions:

    var init = function () {
        // Object initialization code.  Should run only once.
        if (self.state.duration > 0) {
            self.state.endTime = (new Date()).getTime() + self.state.duration;
        }
        self.state.img = $('.image#' + self.state.name)[0];
    };

    // Public functions:

    this.check_hit = function () {
        return false;
    };

    this.update = function (curTime, deltaTime) {
        return this.control(curTime, deltaTime);
    };

    this.control = function (curTime, deltaTime) {
        // Return false to destroy this entity

        if (this.state.endTime < curTime) {
            return false;
        }

        return true;
    };

    this.draw = function () {
        // Draw the object.
        this.game.context.drawImage(this.state.img, x, y);
    };

    // Init:

    init();

    return this;
};
