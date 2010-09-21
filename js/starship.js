var Game = function () {
    // Private vars:

    var self = this;

    var lastTime = (new Date()).getTime();
    var entities = {};

    var tics = 20; // Minimum ms per update

    // Public vars:

    this.canvas = null;
    this.context = null;

    // Private functions:

    var init = function () {
        /* Game initialization code.  Should run only once. */
        self.canvas = $('#starship-canvas')[0];
        self.context = self.canvas.getContext("2d");
        resizeCanvas();

        $(window).bind('resize', this, function (e) {
            /* Many browsers fire multiple resize events during window resizing.
             * Put the resize event on a timer so we don't call it too often. */
            $.doTimeout('resize', 100, resizeCanvas);
        });
        $(window).bind('keydown', function (e) {
            switch(e.which) {
                case 37: // left arrow
                    entities.ship.beginRotate(1);
                    break;
                case 38: // up arrow
                    entities.ship.beginAccelerate(1);
                    break;
                case 39: // right arrow
                    entities.ship.beginRotate(-1);
                    break;
            };
        });
        $(window).bind('keyup', function (e) {
            switch(e.which) {
                case 37: // left arrow
                    entities.ship.endRotate();
                    break;
                case 38: // up arrow
                    entities.ship.endAccelerate();
                    break;
                case 39: // right arrow
                    entities.ship.endRotate();
                    break;
            };
        });
    };

    var resizeCanvas = function () {
        $(self.canvas).attr("height", $(window).height());
        $(self.canvas).attr("width", $(window).width());
        if (entities.stars) {
            entities.stars = new Stars(self);
        }
    };

    var update = function () {
        var curTime = (new Date()).getTime();
        var deltaTime = curTime - lastTime;
        lastTime = curTime;

        // Update everything's state
        $.each(entities, function (k, entity) {entity.update(curTime, deltaTime);});

        // Clear the screen
        self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);

        // Draw
        $.each(entities, function (k, entity) {
            self.context.save();
            entity.draw();
            self.context.restore();
        });

        // Paint
        self.context.fill();
        self.context.stroke();

        $.doTimeout('update-game', tics, update);
    };

    // Public functions:

    this.start = function() {
        entities.stars = new Stars(self);
        entities.target = new Target(self, 100, 100, 45, 5, 20);
        entities.ship = new Ship(self, self.canvas.width / 2, self.canvas.height / 2, 0, 0);

        $.doTimeout('update-game', tics, update);
    };

    // Init:

    init();

    return true;
};

$(document).ready(function () {
    var game = new Game();
    game.start();
});

