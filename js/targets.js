var Target = function (game, x, y, dir, speed, size) { // game is a reference back to game object.
    // Private vars:

    // Public vars:

    this.game = game;
    $.extend(this.state, {x: x,
                          y: y,
                          dir: dir,
                          speed: speed ? speed : 0,
                          size: size ? size : 50,
                          distance: 0 // distance travelled in the current direction
                         });

    // Private functions:

    var init = function () {
        // Object initialization code.  Should run only once.
    };

    // Public functions:

    this.control = function() {
        this.state.distance += this.state.speed;
        if (this.state.distance > 1000 * Math.random() + 10) {
            this.state.distance = 0;
            this.state.dir = parseInt(Math.random() * 360);
            this.state.speed = parseInt(Math.random() * 10 + 1);
        }
    };

    this.draw = function() {
        this.game.context.strokeStyle = "#FFFF00";
        this.game.context.fillStyle = "#FF0000";
        this.game.context.beginPath();
        this.game.context.lineWidth = this.state.size * 0.6;
        this.game.context.arc(this.state.x, this.state.y, this.state.size, 0, Math.PI*2, true);
        this.game.context.closePath();
        this.game.context.stroke();
        this.game.context.fill();
    };

    // Init:

    init();

    return this;
};

Target.prototype = new MovingEntity;
