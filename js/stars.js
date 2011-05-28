/*

   stars.js - Protype for stars object.

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

var Stars = function(game) {
    /* Container entity for stars.
     *
     * Stars that twinkle.  Yes, I know, stars don't twinkle outside
     * of the atmosphere.  I don't care.  I wanted twinkly stars.
     *
     * Using ImageData and CanvasPixelArray should hypothetically be
     * faster, but for some reason on Firefox 3.6, accessing ImageData
     * is painfully slow.
     */

    // Private vars:
    var self = this;

    var stars = [];

    var star_density = 0.0004;

    var starcolors = [
        ["#886666", "#AA8888", "#CCAAAA", "#AA8888"], // dim/red
        ["#888888", "#AAAAAA", "#CCCCCC", "#AAAAAA"], // med/white
        ["#AAAACC", "#CCCCEE", "#EEEEFF", "#CCCCEE"]  // bright/blue
    ];

    var coloroptions = starcolors.length;
    var cyclelength = starcolors[0].length;
    var last_time = (new Date()).getTime();

    // Public vars:

    this.game = game;

    // Private functions:

    var init = function () {
        // Initialization code.  Runs once per object.
        var width = self.game.canvas.width;
        var height = self.game.canvas.height;
        var numstars = Math.floor(width * height * star_density);

        for (var i=0;i<numstars;i++) {
            stars.push({x: Math.floor(Math.random()*width-6)+3,
                        y: Math.floor(Math.random()*height-6)+3,
                        color: Math.floor(Math.random()*coloroptions),
                        cycle: Math.floor(Math.random()*cyclelength)
                       });
        }
    };

    var updateStar = function (idx, star) {
        star.cycle = ++star.cycle % cyclelength;
    };

    var drawStar = function(idx, star) {
        self.game.context.fillStyle = starcolors[star.color][star.cycle];
        self.game.context.fillRect(star.x, star.y, 1, 1);
    };

    // Public functions:

    this.check_hit = function(other, x, y) {
        return false;
    };

    this.update = function(cur_time, delta_time) {
        // Update 6% of the stars each cycle. Arbitrary, but seems
        // about right.

        var num_to_update = Math.floor(0.06 * stars.length);
        var which = 0;
        for (var i=0;i<num_to_update;i++) {
            which = Math.floor(Math.random()*stars.length);
            updateStar(which, stars[which]);
        }

        return true;
    };

    this.draw = function() {
        $.each(stars, drawStar);
    };

    init();

    return this;
};
