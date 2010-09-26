/*

   message.js - Prototype messages

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

var Message = function (game, messages, x, y, font, style, align, dir, speed) {
    // Private vars:

    var self = this;

    // Public vars:

    this.game = game;

    this.state = $.extend({}, this.state);
    $.extend(this.state, {x: x,
                          y: y,
                          dir: dir == null ? 180 : dir, // in degrees, 0 is 'down', 90 is 'right'
                          speed: speed == null ? 0 : speed,
                          messages: messages,
                          font: font ? font : null,
                          style: style ? style : null,
                          align: align ? align : null,
                          lifetime: 0,
                          move_time: 5000,
                          max_lifetime: 15000,
                          wrap: false
                         });

    // Private functions:

    /* None */

    // Public functions:

    this.control = function(cur_time, delta_time) {
        this.state.lifetime += delta_time;
        if (this.state.lifetime > this.state.move_time) {
            this.state.speed += 0.5;
        }
        if (this.state.lifetime > this.state.max_lifetime) {
            return false;
        }

        return true;
    };

    this.draw = function() {
        // Draw the object.
        if (this.state.font) {
            this.game.context.font = this.state.font;
        }

        if (this.state.align) {
            this.game.context.textAlign = this.state.align;
        }

        if (this.state.style) {
            this.game.context.fillStyle = this.state.style;
        }

        var cur_y = this.state.y;
        $.each(this.state.messages, function (idx, message) {
            self.game.context.fillText(message, self.state.x, cur_y);
            cur_y += 60; // FIXME: dirty hack.
        }
              );
    };

    return this;
};

Message.prototype = new MovingEntity;

