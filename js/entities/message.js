/*

   message.js - Prototype messages

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

var Message = function (messages, x, y, font, style, align, dir, speed, move_time, max_lifetime) {
    this.x = x;
    this.y = y;
    this.dir = dir == null ? 0 : dir,
    this.speed = speed == null ? 0 : speed;
    this.messages = messages;
    this.font = font ? font : null;
    this.style = style ? style : null;
    this.align = align ? align : null;
    this.lifetime = 0;
    this.move_time = move_time || 0;
    this.max_lifetime = max_lifetime || 0;
    this.wrap = false;

}

Message.prototype = $.extend({}, this.MovingEntity.prototype, {

    update: function(elapsed, controller) {
        if (this.move_time) {
            if (controller.state.keysdown.length > 0 || controller.state.keyspressed.length > 0) {
                this.speed = .75;
            }

            this.lifetime += elapsed;
            if (this.move_time && this.lifetime > this.move_time) {
                this.speed += 0.05;
            }
        }
        if (this.max_lifetime && this.lifetime > this.max_lifetime) {
            return false;
        }

        return MovingEntity.prototype.update.call(this, elapsed, controller);
    },

    render: function(screen) {
        // Draw the object.
        if (this.font) {
            screen.context.font = this.font;
        }

        if (this.align) {
            screen.context.textAlign = this.align;
        }

        if (this.style) {
            screen.context.fillStyle = this.style;
        }

        var self = this;

        var cur_y = this.y;
        $.each(this.messages, function (idx, message) {
            screen.context.fillText(message, self.x, cur_y);
            cur_y += 60; // FIXME: dirty hack is dirty.
        });
    }
});

