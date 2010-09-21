var MovingEntity = function () {

    this.state = {x: 0,
                  y: 0,
                  dir: 0, // in degrees, 0 is 'down', 90 is 'right'
                  speed: 0
                 };

    this.control = function() {
    };

    this.accelerate = function(dir, rate) {
        if (!rate) {
            return;
        }

        // Vector addition.  TODO: Clean this up.
        var angle_rad = Math.PI * (180 - (this.state.dir - dir)) / 180;
        angle_rad %= Math.PI * 2;

        var new_speed = Math.sqrt(Math.pow(this.state.speed, 2) +
                                  Math.pow(rate, 2) -
                                  2 * this.state.speed * rate * Math.cos(angle_rad));

        var new_angle = Math.asin(rate * Math.sin(angle_rad) / new_speed);
        var new_dir = this.state.dir - new_angle * 180 / Math.PI;

        this.state.speed = new_speed;
        if (new_speed) { // If new_speed is 0, new_dir is NaN
            this.state.dir = Math.round(new_dir);
        }
        else {
            this.state.dir = Math.round(dir);
        }

        this.state.dir = Math.round(this.state.dir);
    };

    this.update = function(cur_time, delta_time) {
        this.control();

        this.state.x += (Math.sin(Math.PI * this.state.dir/180) * this.state.speed);
        this.state.y += (Math.cos(Math.PI * this.state.dir/180) * this.state.speed);

        this.state.x %= this.game.canvas.width;
        this.state.y %= this.game.canvas.height;

        if (this.state.x < 0) {
            this.state.x = this.game.canvas.width - this.state.x;
        }
        if (this.state.y < 0) {
            this.state.y = this.game.canvas.height - this.state.y;
        }
    };

    this.draw = function() {
    };

    return this;
};
