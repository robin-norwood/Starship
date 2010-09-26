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
     */

    // Private vars:
    var self = this;

    var stars = [];

    var star_density = 0.0004;

    var starcolors = [
        ["#886666", "#997777", "#AA8888", "#BB9999", "#CCAAAA", "#BB9999", "#AA8888", "#997777"], // dim/red
        ["#888888", "#999999", "#AAAAAA", "#BBBBBB", "#CCCCCC", "#BBBBBB", "#AAAAAA", "#999999"], // med/white
        ["#AAAACC", "#BBBBDD", "#CCCCEE", "#DDDDFF", "#EEEEFF", "#DDDDFF", "#CCCCEE", "#BBBBDD"]  // bright/blue
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
        if (cur_time - last_time > 200) { // stars update (twinkle) every 200ms or so
            last_time = cur_time;

            $.each(stars, updateStar);
        }

        return true;
    };

    this.draw = function() {
        $.each(stars, drawStar);
    };

    init();

    return this;
};
