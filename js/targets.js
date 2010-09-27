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
                          distance: 0, // distance traveled in the current direction
                          broken: false,
                          broken_duration: 1500, // 1.5 seconds
                          shards: []
                         });

    // Private functions:

    /* None */

    // Public functions:

    this.check_hit = function (source, x, y) {
        if (!this.state.broken && this.game.util.distance(x, y, this.state.x, this.state.y) < this.state.inner_radius) {
            this.game.audio.play("shatter");
            this.state.broken = true;

            var start = 360;
            var end = 360;
            while (end > 0) {
                end = start - Math.random() * 80;
                if (end < 0) {
                    end = 0;
                }

                this.state.shards.push(new TargetShard(game,
                                                       this.state.x,
                                                       this.state.y,
                                                       (start - end) / 2,
                                                       this.state.speed + 1,
                                                       this.state.inner_radius,
                                                       this.state.outer_radius,
                                                       start,
                                                       end,
                                                       Math.random() * 10));
                start = end;
            }

            return true;
        }
        return false;
    };

    this.control = function (cur_time, delta_time) {
        // Return false to destroy this entity.

        if (this.state.broken) {
            $.each(this.state.shards, function (idx, shard) {
                shard.update(cur_time, delta_time);
            });
            this.state.broken_duration -= delta_time;

            if (this.state.broken_duration < 0) {
                this.state.destroyed = true;
            }
        }
        else {
            this.state.distance += this.state.speed;

            if (this.state.distance > 1000 * Math.random() + 10) {
                this.state.distance = 0;
                this.state.dir = parseInt(Math.random() * 360);
                this.state.speed = parseInt(Math.random() * 10 + 1); // FIXME
            }

            this.state.inner_radius += this.state.incr;
            if (this.state.inner_radius < 5 || this.state.inner_radius > radius) {
                this.state.incr *= -1;
            }
        }

        return !this.state.destroyed;
    };

    this.draw = function () {
        if (this.state.broken) {
            $.each(this.state.shards, function(idx, shard) {
                shard.draw();
            });
        }
        else {
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
        }
    };

    return this;
};

Target.prototype = new MovingEntity;

var TargetShard = function(game, x, y, dir, speed, inner_radius, outer_radius, start_angle, end_angle, rot_speed) {
    // Private vars:
    var self = this; // Reference back to 'this' for private functions.
    this.game = game;

    this.state = $.extend({}, this.state);
    $.extend(this.state, {x: x,
                          y: y,
                          dir: dir, // in degrees, 0 is 'down', 90 is 'right'
                          speed: speed,
                          inner_radius: inner_radius,
                          outer_radius: outer_radius,
                          start_angle: start_angle,
                          end_angle: end_angle,
                          rot_speed: rot_speed,
                          duration: 0
                         });

    console.log("start: " + this.state.start_angle + ", end: " + this.state.end_angle);
    // Public vars:

    // Private functions:

    var init = function () {
        // Object initialization code.  Should run only once.
    };

    // Public functions:

    this.control = function(cur_time, delta_time) {
        // Return false to destroy this entity
        this.state.duration += delta_time;
        this.state.start_angle += this.state.rot_speed;
        this.state.end_angle += this.state.rot_speed;

        this.state.start_angle %= 360;
        if (this.state.start_angle < 0) {
            this.state.start_angle += 360;
        }

        this.state.end_angle %= 360;
        if (this.state.end_angle < 0) {
            this.state.end_angle += 360;
        }

        return true;
    };

    this.draw = function() {
        // Draw the object.
        this.game.context.fillStyle = "#FFFF00";
        this.game.context.fillRect(this.state.x, this.state.y, 1, 1);
        this.game.context.beginPath();
        this.game.context.arc(this.state.x, this.state.y, this.state.outer_radius, this.game.util.deg2rad(this.state.start_angle), this.game.util.deg2rad(this.state.end_angle), true);
        this.game.context.lineTo(this.state.x, this.state.y);
        this.game.context.closePath();
        this.game.context.fill();

        this.game.context.fillStyle = "#FF0000";
        this.game.context.beginPath();
        this.game.context.arc(this.state.x, this.state.y, this.state.inner_radius, this.game.util.deg2rad(this.state.start_angle), this.game.util.deg2rad(this.state.end_angle), true);
        this.game.context.lineTo(this.state.x, this.state.y);
        this.game.context.closePath();
        this.game.context.fill();
    };

    // Init:

    init();

    return this;
};

TargetShard.prototype = new MovingEntity;
