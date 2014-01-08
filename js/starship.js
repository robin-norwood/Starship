"use strict";
/*

   starship.js - Prototype for 'Game' object. 'Game' runs the whole show.

   Copyright (c) 2013 Robin Norwood <robin.norwood@gmail.com>

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


var Starship = function () {
    this.playlist_pos = -1;
    this.playlist = $('.music');

    this.canvas = $('#starship_canvas')[0];

    this.width = 1000;
    this.height = 750;

};

Starship.prototype = {
    initCallback: function (controller) {
/*        this.resizeCanvas(); // FIXME: make this work

        var self = this;
        $(window).bind('resize', self, function (e) {
            // Many browsers fire multiple resize events during window resizing.
            // Put the resize event on a timer so we don't call it too often.
            $.doTimeout('resize', 100, function () {self.resizeCanvas(controller)});
        });*/

        return {width: this.width,
                height: this.height
               }; // config
    },

    resizeCanvas: function (controller) {
        $(this.canvas).attr("height", $(window).height());
        $(this.canvas).attr("width", $(window).width());
        controller.entities.stars = new Stars(self);
    },

    loopCallback: function (controller, elapsed) {
        // Create the target if it has been destroyed
        if (!controller.entities.target) {
            controller.entities.target = new Target(this.canvas.width/2, 200, 45, 5, 20);
            controller.entities.score.messages[0] += 1;
        }

        if (!controller.audio.get('music') || controller.audio.get('music').is_ended()) {
            this.play_next(controller); // FIXME: This causes the game to 'jump' - figure out how to load next track in the background.
        }

        if (Utils.contains(controller.state.keyspressed, "m")) {
            var is_muted = controller.audio.toggle_mute();
            if (is_muted) {
                controller.entities.audio_indicator = new Indicator(this.canvas.width - 25, this.canvas.height - 25, 'audio_mute');
            }
            else {
                controller.entities.audio_indicator = new Indicator(this.canvas.width - 25, this.canvas.height - 25, 'audio', 5000);
            }
        }

        return true;
    },

    play_next: function (controller) {
        this.playlist_pos++;

        if (this.playlist_pos > this.playlist.length - 1) {
            this.playlist_pos = 0;
        }

        controller.audio.play(this.playlist[this.playlist_pos].id, 'music');
    },

    loadCallback: function(controller) {
        // A short delay to give the various data (especially the music) time to load.
        // FIXME: Instead, watch for a ready event on the audio object.

        controller.screen.context.save();
        controller.screen.context.font = 'bold 50px sans-serif';
        controller.screen.context.textAlign = 'center';
        controller.screen.context.fillStyle = 'rgba(255, 255, 255, 0.75)';

        controller.screen.context.fillText("Loading...", this.canvas.width/2, this.canvas.height/2);
        controller.screen.context.restore();

        controller.audio.toggle_mute();
        this.play_next(controller);

        controller.entities.stars = new Stars(this.canvas.width, this.canvas.height);
        controller.entities.target = new Target(this.canvas.width / 2, 50, 45, .1, 20);
        controller.entities.ship = new Ship(this.canvas.width / 2, this.canvas.height / 2, 0, 0);
        controller.entities.score = new Message([0], 5, 29, '24px monospace', 'rgba(255, 255, 255, 0.75)');
        controller.entities.message = new Message(["Starship",
                                                   "An HTML5 canvas demo",
                                                   "Shoot the target",
                                                   "Arrow keys: move",
                                                   "x: fire",
                                                   "m: mute audio",
                                                   "Music: Musical Landscapes I by Galdson"
                                                  ],
                                                  this.canvas.width/2,
                                                  this.canvas.height/2 - 150,
                                                  'bold 50px sans-serif',
                                                  'rgba(255, 255, 255, 0.75)',
                                                  'center',
                                                  Math.PI * 2,
                                                  0,
                                                  6000,
                                                  10000
                                                 );

        controller.start();
//        $.doTimeout('update-game', 5000, controller.start);

        return true;
    }

};

// Init and run the game
$(document).ready(function () {
    var game = new Starship();
    var controller = new Controller(game); // starts looping
});

