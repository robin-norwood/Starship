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

var AudioManager = function (selector) {
    // Manage audio streams for multi-channel audio.
    //
    // Supports either named streams, for long-running audio channels,
    // or transient streams, for sound effects, etc.
    //
    // By default, will load all audio streams with an id. Use
    // 'selector' to limit.
    //
    // // Usage:
    //   <html><body>
    //     <audio class="my_sounds" id="music_one" src="..."/>
    //     <audio class="my_sounds" id="music_two" src="..."/>
    //     <audio class="my_sounds" id="effect_one" src="..."/>
    //     <audio class="my_sounds" id="effect_two" src="..."/>
    //     <audio id="other_sound" src="..."/>
    //   </body></html>
    //
    // var am = new AudioManager(); // Loads all audio tags.
    // am.play('music_one', 'music'); // Starts playing first track
    // am.play('effect_one'); // Play sound effect
    // am.play('effect_two'); // Play same efect twice in a row
    // am.play('effect_two'); // All three playing at once, along with music
    //
    // // There are four audio streams playing now
    //
    // am.play('music_two', 'music'); // Skips to next track
    //
    // // Still just four audio streams - the 'music' stream was reused
    //
    // Use jQuery selectors to avoid loading all audio:
    //
    // var am = new AudioManager('.my_sounds'); // 'other_sound' not loaded.
    //
    // // Mute:
    //
    // am.toggle_mute();
    // am.toggle_mute();
    //
    // // Load without playing:
    //
    // am.load('music_two', 'music');

    if (!selector) {
        selector = "audio";
    }

    // Private vars:

    var self = this;

    var library = new Object(); // Library of audio objects
    var named_streams = new Object(); // For longrunning streams, like music.
    var named_streams_count = 0;
    var transient_streams = new Array(); // For transient sounds, like sound effects.
    var volume = 100;

    // Public vars:

    this.muted = false;

    // Private functions:

    var log = function (msg) {
        if (console) {
            console.log(msg);
        }
    };

    var init = function () {
        // Object initialization code.  Should run only once.

        $(selector).each(function (idx, obj) {
            if (obj.id) {
                library[obj.id] = obj;
            }
        });
    };

    var mute_stream = function (idx, stream) {
        if (!stream.muted) {
            stream.toggle_mute();
        }
    };

    var unmute_stream = function (idx, stream) {
        if (stream.muted) {
            stream.toggle_mute();
        }
    };

    // Public functions:

    this.stream_count = function () {
        return named_streams_count + transient_streams.length;
    };

    this.toggle_mute = function () {
        if (this.muted) {
            log("Unmuting");
            $.each(transient_streams, unmute_stream);
            $.each(named_streams, unmute_stream);
        }
        else {
            log("Muting");
            $.each(transient_streams, mute_stream);
            $.each(named_streams, mute_stream);
        }

        this.muted = !this.muted;

        return this.muted;
    };

    this.get = function (name) {
        // Get a named stream. Transient streams cannot be retrieved.
        return named_streams[name];
    };

    this.play = function (id, name, volume, loop) {
        // Shortcut that loads sound and plays it.
        log("Playing " + id + " in stream " + name);
        var snd = this.load(id, name, volume);
        log("THIS MUTED: " + this.muted + ", snd muted: " + snd.muted);
        if (this.muted && ! snd.muted) {
            snd.toggle_mute();
        }
        snd.play(loop);

        return snd;
    };

    this.load = function (id, name, volume) {
        // Load sound, return AudioStream object.
        //
        // id: id of <audio> tag
        // name: Name of audio stream, if a named stream

        var the_stream = null;

        if (volume == null) {
            volume = 100;
        }

        if (name) {
            if (named_streams[name]) { // Existing named stream
                log("Loading " + id + " on existing stream " + name);
                the_stream = named_streams[name];
                the_stream.load(library[id]);
            }
            else { // Create a new named stream
                log("Creating new stream " + name + " to load " + id);
                the_stream = new AudioStream();
                named_streams[name] = the_stream;
                named_streams_count++;
                named_streams[name].load(library[id]);
            }
        }
        else {
            $.each(transient_streams, function (idx, stream) {
                if (stream.is_ended()) { // Re-use existing transient stream
                    log("Reusing existing stream for " + id);
                    the_stream = stream;
                    stream.load(library[id]);
                    return false; // terminate 'each' loop
                }
                return true;
            });

            if (!the_stream) { // Create a new transient stream
                log("Creating new stream for " + id);
                the_stream = new AudioStream();
                the_stream.load(library[id]);
                transient_streams.push(the_stream);
            }
        }

        the_stream.set_volume(volume);

        return the_stream;
    };

    this.get_volume = function () {
        return parseInt(volume);
    };

    this.set_volume = function (vol) {
        if (vol > 100) {
            vol = 100;
        }
        if (vol < 0) {
            vol = 0;
        }

        volume = vol;

        log("Setting master volume to " + volume);
        $.each(transient_streams, function (idx, stream) {
            stream.set_master_volume(volume);
        });

        $.each(named_streams, function (idx, stream) {
            if (stream) {
                stream.set_master_volume(volume);
            }
        });
    };

    this.volume_up = function (incr) {
        this.set_volume(this.get_volume() + incr);
    };

    this.volume_down = function (incr) {
        this.set_volume(this.get_volume() - incr);
    };

    // Init:

    init();
};

var AudioStream = function(master_volume) {
    // A single Audio() object and other data. Generally returned by
    // AudioManager functions like 'play' and 'load'.
    //
    // Usage:
    //
    // am = new AudioManager();
    //
    // as = am.play('music_two', 'music'); // AudioStream object
    // as.pause();
    // as.play();
    //
    // as2 = am.load('effect_one');
    // as2.play();
    //
    // // Access to underlying Audio object:
    // as2.audio_obj;

    if (!master_volume) {
        master_volume = 100;
    }
    // Private vars:

    var self = this;
    var orig_volume = 100;

    // Public vars:

    this.audio_obj = null;
    this.muted = false;

    // Private functions:

    var init = function () {
        // Object initialization code.  Should run only once.
        self.audio_obj = new Audio();
        self.set_volume(100);
    };

    var log = function (msg) {
        if (console) {
            console.log(msg);
        }
    };

    // Public functions:
    this.play_obj = function (orig, loop) {
        // Load and play given audio source.
        this.load(orig);
        this.play(loop);
    };

    this.load = function (orig) {
        // Start loading given audio object, but do not play it yet.
        this.audio_obj.src = orig.src;
        this.audio_obj.load();
    };

    this.set_master_volume = function (vol) {
        log("Setting master volume to " + vol);
        var current_volume = this.get_volume();

        if (current_volume == 0 && !this.muted) {
            current_volume = 100;
        }
        master_volume = vol;
        this.set_volume(current_volume);
    };

    this.set_volume = function (vol) {
        log("Setting volume to " + vol);
        if (this.muted) {
            return;
        }
        if (vol < 0) {
            vol = 0;
        }
        if (vol > 100) {
            vol = 100;
        }

        log("MASTER: " + master_volume);
        vol = vol * (master_volume / 100);

        log("Vol set to " + vol);
        this.audio_obj.volume = vol / 100;
    };

    this.get_volume = function (vol) {
        if (master_volume == 0) {
            return this.audio_obj.volume * 100;
        }
        return parseInt((this.audio_obj.volume * 100) * (100 / master_volume));
    };

    this.volume_up = function (incr) {
        this.set_volume(this.get_volume() + incr);
    };

    this.volume_down = function (incr) {
        this.set_volume(this.get_volume() - incr);
    };

    this.toggle_mute = function () {
        if (this.muted) {
            this.set_volume(orig_volume);
        }
        else {
            orig_volume = this.get_volume();
            this.set_volume(0);
        }

        this.muted = !this.muted;

        return this.muted;
    };

    this.is_ended = function () {
        return this.audio_obj.ended;
    };

    this.play = function(loop) {
        this.audio_obj.play();

        if (loop) {
            $(self.audio_obj).bind('ended', function (event) {
                log("TRACK ENDED");
                $(self.audio_obj).unbind('ended');
                self.play(true);
            });

        }

        return this;
    };

    this.pause = function() {
        this.audio_obj.pause();
    };

    // Init:

    init();
};
