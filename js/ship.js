var Ship = function (game, x, y, dir, speed) {
    // Private vars:

    this.game = game;
    $.extend(this.state, {x: x,
                          y: y,
                          dir: dir == null ? 0 : dir, // in degrees, 0 is 'down', 90 is 'right'
                          speed: speed == null ? 0 : speed,
                          max_speed: 10,
                          max_rotation: 10,
                          bearing: 0,
                          acceleration_factor: .5,
                          acceleration: 0,
                          rot_speed: 0,
                          rot_factor: .5,
                          rotation: 0
                         });

    // Public vars:

    // Private functions:

    var init = function () {
        // Object initialization code.  Should run only once.
    };

    // Public functions:

    this.control = function() {
        // Code to run each update goes here.
        this.state.rot_speed += this.state.rotation * this.state.rot_factor;
        this.state.bearing += this.state.rot_speed;

        this.state.bearing %= 360;
        if (this.state.bearing < 0) {
            this.state.bearing += 360;
        }

        this.accelerate(this.state.bearing, this.state.acceleration * this.state.acceleration_factor);

        this.state.speed = Math.min(this.state.speed, this.state.max_speed);
        this.state.rot_speed = Math.min(this.state.rot_speed, this.state.max_rotation);
    };

    this.draw = function() {
        // Draw the object.
        this.game.context.strokeStyle = "pink";
        this.game.context.lineWidth = 2;
        this.game.context.beginPath();
        this.game.context.moveTo(Math.sin(Math.PI * this.state.bearing / 180) * 14 + this.state.x,
                                 Math.cos(Math.PI * this.state.bearing / 180) * 14 + this.state.y);
        this.game.context.lineTo(Math.sin(Math.PI * (this.state.bearing - 135) / 180) * 7 + this.state.x,
                                 Math.cos(Math.PI * (this.state.bearing - 135) / 180) * 7 + this.state.y);
        this.game.context.lineTo(Math.sin(Math.PI * (this.state.bearing + 135) / 180) * 7 + this.state.x,
                                 Math.cos(Math.PI * (this.state.bearing + 135) / 180) * 7 + this.state.y);
        this.game.context.lineTo(Math.sin(Math.PI * this.state.bearing / 180) * 14 + this.state.x,
                                 Math.cos(Math.PI * this.state.bearing / 180) * 14 + this.state.y);
        this.game.context.closePath();
        this.game.context.stroke();
        this.game.context.fill();
    };

    this.beginAccelerate = function(dir) {
        this.state.acceleration = dir;
    };

    this.endAccelerate = function (dir) {
        this.state.acceleration = 0;
    };

    this.beginRotate = function (dir) {
        this.state.rotation = dir;
    };

    this.endRotate = function() {
        this.state.rotation = 0;
    };

    // Init:

    init();

    return this;
};

Ship.prototype = new MovingEntity;
