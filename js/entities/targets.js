var Target = function (x, y, dir, speed, radius) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = speed ? speed : 0;
    this.radius = radius;
    this.inner_radius = radius ? radius : 50;
    this.outer_radius = radius ? radius + 10 : 60;
    this.incr = -1;
    this.distance = 0; // distance traveled in the current directio;
    this.broken = false;
    this.broken_duration = 1500; // 1.5 seconds
    this.shards = [];
    this.wrap = true;

    return;
};

Target.prototype = $.extend({}, MovingEntity.prototype, {
    check_hit: function (controller, source) {
        if (!this.broken && Utils.distance(source.x, source.y, this.x, this.y) < this.inner_radius) {
            controller.audio.play("shatter");
            this.broken = true;

            var start = 360;
            var end = 360;
            while (end > 0) {
                end = start - Math.random() * 60;
                if (end < 0) {
                    end = 0;
                }

                this.shards.push(new TargetShard(this.x,
                                                 this.y,
                                                 (start - end) / 2,
                                                 this.speed + .01,
                                                 this.inner_radius,
                                                 this.outer_radius,
                                                 start,
                                                 end,
                                                 Math.random() * 10));
                start = end;
            }

            return true;
        }
        return false;
    },

    update: function (elapsed, controller) {
        // Return false to destroy this entity.
        MovingEntity.prototype.update.call(this, elapsed, controller);

        if (this.broken) {
            $.each(this.shards, function (idx, shard) {
                shard.update(elapsed, controller);
            });
            this.broken_duration -= elapsed;

            if (this.broken_duration < 0) {
                this.destroyed = true;
            }
        }
        else {
            this.distance += this.speed;

            if (this.distance > 10 * Math.random() + 10) {
                this.distance = 0;
                this.dir = parseInt(Math.random() * 360);
                this.speed = parseInt(Math.random() * 2 + 1) / 10; // FIXME
            }

            this.inner_radius += this.incr;
            if (this.inner_radius < 5 || this.inner_radius > this.radius) {
                this.incr *= -1;
            }
        }

        return !this.destroyed;
    },

    render: function (screen) {
        if (this.broken) {
            $.each(this.shards, function(idx, shard) {
                shard.render(screen);
            });
        }
        else {
            // Outside
            screen.context.fillStyle = "rgba(255, 255, 0, 1)";
            screen.context.beginPath();
            screen.context.arc(this.x, this.y, this.outer_radius, 0, Math.PI*2, true);
            screen.context.closePath();
            screen.context.fill();

            // Inside
            screen.context.fillStyle = "rgba(255, 0, 0, 1)";
            screen.context.beginPath();
            screen.context.arc(this.x, this.y, this.inner_radius, 0, Math.PI*2, true);
            screen.context.closePath();
            screen.context.fill();
        }
    }

});

var TargetShard = function(x, y, dir, speed, inner_radius, outer_radius, start_angle, end_angle, rot_speed) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = speed;
    this.inner_radius = inner_radius;
    this.outer_radius = outer_radius;
    this.start_angle = start_angle;
    this.end_angle = end_angle;
    this.rot_speed = rot_speed;
    this.duration = 0;
};

TargetShard.prototype = $.extend({}, MovingEntity.prototype, {

    update: function(elapsed, controller) {
        // Return false to destroy this entity
        this.duration += elapsed;
        this.start_angle += this.rot_speed;
        this.end_angle += this.rot_speed;

        this.start_angle %= 360;
        if (this.start_angle < 0) {
            this.start_angle += 360;
        }

        this.end_angle %= 360;
        if (this.end_angle < 0) {
            this.end_angle += 360;
        }

        return MovingEntity.prototype.update.call(this, elapsed, controller);
    },

    render: function(screen) {
        // Draw the object.
        screen.context.fillStyle = "#FFFF00";
        screen.context.fillRect(this.x, this.y, 1, 1);
        screen.context.beginPath();
        screen.context.arc(this.x, this.y, this.outer_radius, Utils.deg2rad(this.start_angle), Utils.deg2rad(this.end_angle), true);
        screen.context.lineTo(this.x, this.y);
        screen.context.closePath();
        screen.context.fill();

        screen.context.fillStyle = "#FF0000";
        screen.context.beginPath();
        screen.context.arc(this.x, this.y, this.inner_radius, Utils.deg2rad(this.start_angle), Utils.deg2rad(this.end_angle), true);
        screen.context.lineTo(this.x, this.y);
        screen.context.closePath();
        screen.context.fill();
    }
});

