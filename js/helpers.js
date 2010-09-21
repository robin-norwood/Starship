/*
 * Various helpers, etc.
 * New entity template:

var AnEntity = function (game, x, y, dir, speed) {
    // Private vars:

    this.game = game;
    $.extend(this.state, {x: x,
                          y: y,
                          dir: dir == null ? 0 : dir, // in degrees, 0 is 'down', 90 is 'right'
                          speed: speed == null ? 0 : speed
                         });

    // Public vars:

    // Private functions:

    var init = function () {
        // Object initialization code.  Should run only once.
    };

    // Public functions:

    this.control = function() {
        // Code to run each update goes here.
    };

    this.draw = function() {
        // Draw the object.
    };

    // Init:

    init();

    return this;
};

AnEntity.prototype = new MovingEntity;

 */