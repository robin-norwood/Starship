/*

   stars.js - Protype for stars object.

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

var Stars = function(width, height) {
    /* Container entity for stars.
     *
     * Stars that twinkle. Yes, I know, stars don't twinkle outside
     * of the atmosphere. I don't care. I wanted twinkly stars.
     *
     * Using ImageData and CanvasPixelArray should hypothetically be
     * faster, but for some reason on Firefox 3.6, accessing ImageData
     * is painfully slow. FIXME: Look at this again on modern browsers.
     */

    this.stars = [];

    this.star_density = 0.0004;

    this.starcolors = [
        ["#886666", "#AA8888", "#CCAAAA", "#AA8888"], // dim/red
        ["#888888", "#AAAAAA", "#CCCCCC", "#AAAAAA"], // med/white
        ["#AAAACC", "#CCCCEE", "#EEEEFF", "#CCCCEE"]  // bright/blue
    ];

    this.coloroptions = this.starcolors.length;
    this.cyclelength = this.starcolors[0].length;
    this.last_time = (new Date()).getTime();
    this.scalable = false;

    var numstars = Math.floor(width * height * this.star_density);

    for (var i=0;i<numstars;i++) {
        this.stars.push({x: Math.floor(Math.random() * width - 6) + 3,
                         y: Math.floor(Math.random() * height - 6) + 3,
                         color: Math.floor(Math.random() * this.coloroptions),
                         cycle: Math.floor(Math.random() * this.cyclelength)
                        });
    }

};

Stars.prototype = $.extend({}, Entity.prototype, {
    updateStar: function (idx, star) {
        star.cycle = ++star.cycle % this.cyclelength;
    },

    drawStar: function(screen, idx, star) {
        screen.context.fillStyle = this.starcolors[star.color][star.cycle];
        screen.context.fillRect(star.x, star.y, 1, 1);
    },

    check_hit: function(other, x, y) {
        return false;
    },

    update: function(elapsed, controller) {
        // Update 6% of the stars each cycle. Arbitrary, but seems
        // about right.

        var num_to_update = Math.floor(0.06 * this.stars.length);
        var which = 0;
        for (var i=0;i<num_to_update;i++) {
            which = Math.floor(Math.random()*this.stars.length);
            this.updateStar(which, this.stars[which]);
        }

        return true;
    },

    render: function(screen) {
        var self = this;
        $.each(this.stars, function (idx, star) {self.drawStar(screen, idx, star)});
    }
});

