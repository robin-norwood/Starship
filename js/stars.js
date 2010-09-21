var Stars = function(game) {
    // Private vars

    var self = this;

    var stars = [];

    var star_density = 0.0004;

    var starcolors = [
        ["#886666", "#997777", "#AA8888", "#BB9999", "#CCAAAA", "#BB9999", "#AA8888", "#997777"], // dim/red
        ["#888888", "#999999", "#AAAAAA", "#BBBBBB", "#CCCCCC", "#BBBBBB", "#AAAAAA", "#999999"], // med/white
        ["#AAAACC", "#BBBBDD", "#CCCCEE", "#DDDDFF", "#EEEEFF", "#DDDDFF", "#CCCCEE", "#BBBBDD"]  // bright/blue
    ];
    var coloroptions = starcolors.length;
    var cyclelength = starcolors[0].length;
    var last_time = (new Date()).getTime();

    // Public vars

    /* None */

    // Private functions

    var init = function () {
        var width = game.canvas.width;
        var height = game.canvas.height;
        var numstars = Math.floor(width * height * star_density);

        for (var i=0;i<numstars;i++) {
            stars.push({x: Math.floor(Math.random()*width-6)+3,
                        y: Math.floor(Math.random()*height-6)+3,
                        color: Math.floor(Math.random()*coloroptions),
                        cycle: Math.floor(Math.random()*cyclelength)
                       });
        }
    };

    var updateStar = function (idx, star) {
        star.cycle = ++star.cycle % cyclelength;
    };

    var drawStar = function(idx, star) {
        game.context.fillStyle = starcolors[star.color][star.cycle];
        game.context.fillRect(star.x, star.y, 1, 1);
    };

    // Public functions

    this.update = function(cur_time, delta_time) {
        if (cur_time - last_time > 200) { // stars update (twinkle) every 200ms or so
            last_time = cur_time;

            $.each(stars, updateStar);
        }
    };

    this.draw = function() {
        $.each(stars, drawStar);
    };

    init();

    return this;
};
