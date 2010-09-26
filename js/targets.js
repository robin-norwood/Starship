var Target = function (game, x, y, dir, speed, radius) {
    // Private vars:

    var self = this;

    // Public vars:

    this.game = game;

    this.state = $.extend({}, this.state);
    $.extend(this.state, {x: x,
                          y: y,
                          dir: dir,
                          speed: speed ? speed : 0,
                          inner_radius: radius ? radius : 50,
                          outer_radius: radius ? radius + 10 : 60,
                          incr: -1,
                          distance: 0 // distance travelled in the current direction
                         });

    // Private functions:

    /* None */

    // Public functions:

    this.check_hit = function (source, x, y) {
        if (this.game.util.distance(x, y, this.state.x, this.state.y) < this.state.inner_radius) {
            this.state.destroyed = true;
            return true;
        }
        return false;
    };

    this.control = function () {
        // Return false to destroy this entity.
        this.state.distance += this.state.speed;
        if (this.state.distance > 1000 * Math.random() + 10) {
            this.state.distance = 0;
            this.state.dir = parseInt(Math.random() * 360);
            this.state.speed = parseInt(Math.random() * 10 + 1);
        }

        this.state.inner_radius += this.state.incr;
        if (this.state.inner_radius < 5 || this.state.inner_radius > radius) {
            this.state.incr *= -1;
        }

        return !this.state.destroyed;
    };

    this.draw = function () {
        this.game.context.fillStyle = "#FFFF00";
        this.game.context.beginPath();
        this.game.context.arc(this.state.x, this.state.y, this.state.outer_radius, 0, Math.PI*2, true);
        this.game.context.closePath();
        this.game.context.fill();

        this.game.context.fillStyle = "#FF0000";
        this.game.context.beginPath();
        this.game.context.arc(this.state.x, this.state.y, this.state.inner_radius, 0, Math.PI*2, true);
        this.game.context.closePath();
        this.game.context.fill();
    };

    return this;
};

Target.prototype = new MovingEntity;
