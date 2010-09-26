/*

   audio.js - Audio manager

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
 * Inspired by:
 * http://www.storiesinflight.com/html5/audio.html
 */

var AudioManager = function () {
    // Manage audio streams for multi-channel audio.

    // Private vars:

    var self = this;

    var named_streams = Object(); // For longrunning streams, like the music.
    var anonymous_streams = Array(); // For transient sounds, like bullets.

    // Public vars:

    /* None */

    // Private functions:

    var init = function () {
        // Object initialization code.  Should run only once.
    };

    // Public functions:

    this.add = function(id, name) {
        var the_stream = null;

        if (name) {
            the_stream = new AudioStream(id);
            named_streams[name] = stream;
        }
        else {
            var now = (new Date()).getTime();

            $.each(anonymous_streams, function (idx, stream) {
                if (stream.end_time < now) {
                    the_stream = stream;
                    stream.set(id);
                    return false;
                }
                return true;
            });

            if (!the_stream) {
                the_stream = new AudioStream(id);
                anonymous_streams.push(the_stream);
            }
        }

        return the_stream;
    };

    // Init:

    init();

    return this;
};

var AudioStream = function(id) {
    // A single Audio() object and other data.

    // Private vars:

    var self = this;

    // Public vars:

    this.end_time = 0;
    this.audio_obj = null;

    // Private functions:

    var init = function () {
        // Object initialization code.  Should run only once.
        self.audio_obj = new Audio();

        self.set(id);
    };

    // Public functions:

    this.set = function (id) {
        var orig = $($('.sound#' + id)[0]);
        this.audio_obj.src = orig.src;


        var now = (new Date()).getTime();
        this.end_time = now + orig.duration * 1000;

        this.audio_obj.load();
    };

    this.play = function() {
        this.audio_obj.play();
    };

    this.pause = function() {
        this.audio_obj.pause();
    };

    // Init:

    init();

    return this;
};