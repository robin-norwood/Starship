/*

   starship.js - Prototype for 'Game' object. 'Game' runs the whole show.

   Copyright (c) 2010 Robin Norwood <robin.norwood@gmail.com>

      This file is part of Starship.

    Starship is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Starship is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Starship.  If not, see <http://www.gnu.org/licenses/>.

 */

/*
 * Some ideas and inspiration from:
 *  http://www.somethinghitme.com/projects/jslander/
 *  http://www.ferretarmy.com/files/canvas/fullScreenCanvas/fullScreenCanvas.html
 *  http://diveintohtml5.org/canvas.html
 */

var Game = function () {
    // Private vars:

    var self = this;

    var entities = {};

    var tics = 40; // Minimum ms per update

    var playlist_pos = -1;

    // Public vars:

    this.canvas = null;
    this.context = null;
    this.lastTime = (new Date()).getTime();

    this.entities = entities;

    // Private functions:

    function init () {
        /* Game initialization code.  Should run only once. */
        self.canvas = $('#starship_canvas')[0];
        self.context = self.canvas.getContext("2d");

        self.util = new Util();
        self.audio = new AudioManager();

        resizeCanvas();

        $(window).bind('resize', self, function (e) {
            /* Many browsers fire multiple resize events during window resizing.
             * Put the resize event on a timer so we don't call it too often. */
            $.doTimeout('resize', 100, resizeCanvas);
        });
        $(window).bind('keydown', function (e) {
            if (self.entities.message) {
                self.entities.message.state.speed = 10;
            }
            switch(e.which) {
                case 37: // left arrow
                    self.entities.ship.beginRotate(1);
                    break;
                case 38: // up arrow
                    self.entities.ship.beginAccelerate(1);
                    break;
                case 39: // right arrow
                    self.entities.ship.beginRotate(-1);
                    break;
                case 88: // x
                    self.entities.ship.fire();
                    break;
                case 77: // m
                    var is_muted = self.audio.toggle_mute();
                    if (is_muted) {
                        self.entities.audio_indicator = new Indicator(self, self.canvas.width - 25, self.canvas.height - 25, 'audio_mute');
                    }
                    else {
                        self.entities.audio_indicator = new Indicator(self, self.canvas.width - 25, self.canvas.height - 25, 'audio', 5000);
                    }

            };
        });
        $(window).bind('keyup', function (e) {
            switch(e.which) {
                case 37: // left arrow
                    self.entities.ship.endRotate();
                    break;
                case 38: // up arrow
                    self.entities.ship.endAccelerate();
                    break;
                case 39: // right arrow
                    self.entities.ship.endRotate();
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
        /* Main loop */
        var curTime = (new Date()).getTime();
        var deltaTime = curTime - self.lastTime;
        self.lastTime = curTime;

        // Update everything's state
        $.each(self.entities, function (x,entity) {
            var keep = entity.update(curTime, deltaTime);
            if (!keep) {
                delete entity; // delete entity
                delete entities[x]; // remove from entities object
            }
            return keep;
        });

        // Clear the screen
        self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);

        // Draw
        $.each(entities, function (k, entity) {
            self.context.save();
            entity.draw();
            self.context.restore();
        });

        // Create the target if it has been destroyed
        if (!self.entities.target) {
            self.entities.target = new Target(self, self.canvas.width/2, 200, 45, 5, 20);
            self.entities.score.state.messages[0] += 1;
        }

        if (!self.audio.get('music') || self.audio.get('music').is_ended()) {
            play_next(); // FIXME: This causes the game to 'jump' - figure out how to load next track in the background.
        }

        var time = (new Date()).getTime() - curTime;
        var delay = tics - time;
        if (delay < 0) {
            delay = 0;
            if (console) {
                console.log("Main loop took too long: " + time);
            }
        }

        $.doTimeout('update-game', delay, update);
    };

    var play_next = function () {
        var playlist = $('.music');
        playlist_pos++;

        if (playlist_pos > playlist.length - 1) {
            playlist_pos = 0;
        }

        self.audio.play(playlist[playlist_pos].id, 'music');
    };

    var start = function() {
        entities.stars = new Stars(self);
        entities.target = new Target(self, self.canvas.width / 2, 150, 45, 5, 20);
        entities.ship = new Ship(self, self.canvas.width / 2, self.canvas.height / 2, 0, 0);
        entities.bullets = new Bullets(self);
        entities.score = new Message(self, [0], 5, 29, '24px monospace', 'rgba(255, 255, 255, 0.75)');
        entities.message = new Message(self,
                                       ["Starship",
                                        "An HTML5 canvas demo",
                                        "Shoot the target",
                                        "Arrow keys: move",
                                        "x: fire",
                                        "m: mute audio",
                                        "Music: Musical Landscapes I by Galdson"
                                       ],
                                       self.canvas.width/2,
                                       self.canvas.height/2 - 150,
                                       'bold 50px sans-serif',
                                       'rgba(255, 255, 255, 0.75)',
                                       'center',
                                       null,
                                       null,
                                       20000,
                                       30000
                                      );
        $.doTimeout('update-game', tics, update);
    };

    // Public functions:

    this.check_for_hits = function (source, x, y) {
        var hit_something = false;
        $.each(entities, function(k, entity) {
            if (entity.check_hit(source, x, y)) {
                hit_something = true;
                return false; // Stop checking for hits
            }
            return true;
        });

        return hit_something;
    };

    this.load = function() {
        // A short delay to give the various data (especially the music) time to load.
        // FIXME: Instead, watch for a ready event on the audio object.

        this.context.save();
        this.context.font = 'bold 50px sans-serif';
        this.context.textAlign = 'center';
        this.context.fillStyle = 'rgba(255, 255, 255, 0.5)';

        this.context.fillText("Loading...", this.canvas.width/2, this.canvas.height/2);
        this.context.restore();

        play_next();

        $.doTimeout('update-game', 5000, start);
    };

    // Init:

    init();

    return true;
};

// Init and run the game
$(document).ready(function () {
    var game = new Game();
    game.load();
});

