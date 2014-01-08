/*

   entities.js - Base class for entities.

   Copyright (c) 2013 Robin Norwood <robin.norwood@rackspace.com>

      This file is part of SimCloud.
 */

var Entity = function (x, y) {
    this.x = x;
    this.y = y;

    this.die = false;

    return;
}

Entity.prototype = {
    update: function (elapsed, controller) {
        return true;
    },
    render: function (screen) {
        return;
    },
    check_hit: function (controller, source) {
        return false;
    }
};

var MovingEntity = function () {
    /* Base prototype for moving entities in the game. */

    this.x = null;
    this.y = null;

    this.die = false;

    this.dir = null
    this.speed = null;
    this.wrap = false;

    return;
};

MovingEntity.prototype = $.extend({}, Entity.prototype, {
    accelerate: function(vec) {
        var newVector = Utils.accelerate(this.dir, this.speed, vec.angle, vec.magnitude);
        this.dir = newVector.dir;
        this.speed = newVector.speed;
    },
    update: function(elapsed, controller) {
        this.x += (Math.sin(this.dir) * this.speed * elapsed);
        this.y += (Math.cos(this.dir) * this.speed * elapsed);

        if (this.wrap) {
            this.x %= controller.game.canvas.width;
            this.y %= controller.game.canvas.height;

            if (this.x < 0) {
                this.x = controller.game.canvas.width - this.x;
            }
            if (this.y < 0) {
                this.y = controller.game.canvas.height - this.y;
            }
        }

        return true;
    }
});


var ClickableEntity = function () {
    /* Base prototype for clickable entities in the game. */

    this.x = null;
    this.y = null;

    this.w = null;
    this.h = null;

    return;
};

ClickableEntity.prototype = $.extend({}, Entity.prototype, {
    update: function (elapsed, controller) {
        this.hovering = false;
        this.pressed = false;
        this.clicked = false;

        this.hovering = Utils.inside(controller.state.pointerpos, this);

        if (this.hovering && controller.state.pointerpressed) {
            this.pressed = true;
        }

        if (this.hovering && controller.state.pointerclicked) {
            this.clicked = true;
            this.log("clicked!");
        }

        return true;
    }
});

