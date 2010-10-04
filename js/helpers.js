/*

   helpers.js - Various helper functions and prototypes.

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

var Util = function () {
    // Utility functions

    // Private vars:

    var self = this; // Reference back to 'this' for private functions.

    // Public vars:

    /* None */

    // Private functions:

    /* None */

    // Public functions:

    this.distance = function (x1, y1, x2, y2) {
        // distance between two pixels

        return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    };

    this.deg2rad = function (deg) {
        // degrees to radians

        return Math.PI * deg/180;
    };

    this.rad2deg = function (rad) {
        // radians to degrees

        return rad * 180 / Math.PI;
    };

    return this;
};

/*
 *  * New entity template:

var AnEntity = function (game, x, y, dir, speed) {
    // Private vars:
    var self = this; // Reference back to 'this' for private functions.
    this.game = game;

    this.state = $.extend({}, this.state); // Copy the base prototype's state object.
    $.extend(this.state, {x: x,
                          y: y,
                          dir: dir == null ? 0 : dir, // in degrees, 0 is 'down', 90 is 'right'
                          speed: speed == null ? 0 : speed
                         });

    // Public vars:

    // Private functions:

    var init = function () {
        // Object initialization code.  Should run only once.
    };

    // Public functions:

    this.control = function (curTime, deltaTime) {
        // Return false to destroy this entity
    };

    this.draw = function () {
        // Draw the object.
    };

    // Init:

    init();

    return this;
};

AnEntity.prototype = new MovingEntity;

 */

/*
 * An object template:
var AnObject = function () {
    // Private vars:

    var self = this; // Reference back to 'this' for private functions.

    // Public vars:

    this.public = "public";

    // Private functions:

    var init = function () {
        // Object initialization code.  Should run only once.
    };

    // Public functions:

    this.public_f = function () {
    };

    // Init:

    init();

    return this;
};

 */