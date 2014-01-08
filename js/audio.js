/*

   audio.js - Audio manager

   Copyright (c) 2013 Robin Norwood <robin.norwood@rackspace.com>

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

    self._library = new Object(); // Library of audio objects
    self._named_streams = new Object(); // For longrunning streams, like music.
    self._named_streams_count = 0; // Javascript annoyance; no good way to count # of entries in an object
    self._transient_streams = new Array(); // For transient sounds, like sound effects.
    self._volume = 100;

    // Public vars:

    self.muted = false;

    $(selector).each(function (idx, obj) {
        if (obj.id) {
            self._library[obj.id] = obj;
        }
    });

    return;
}

AudioManager.prototype = {
    log: function (msg) {
        if (console) {
            console.log("AudioManager:" + msg);
        }
    },
    mute_stream: function (idx, stream) {
        if (!stream.muted) {
            stream.toggle_mute();
        }
    },
    unmute_stream: function (idx, stream) {
        if (stream.muted) {
            stream.toggle_mute();
        }
    },
    stream_count: function () {
        return this._named_streams_count + this._transient_streams.length;
    },
    toggle_mute: function () {
        var self = this;

        if (self.muted) {
            $.each(self._transient_streams, self.unmute_stream);
            $.each(self._named_streams, self.unmute_stream);
        }
        else {
            $.each(self._transient_streams, self.mute_stream);
            $.each(self._named_streams, self.mute_stream);
        }

        self.muted = !self.muted;

        return self.muted;
    },
    get: function (name) {
        // Get a named stream. Transient streams cannot be retrieved.
        return this._named_streams[name];
    },
    play: function (id, name, vol, loop) {
        // Shortcut that loads sound and plays it.
        var snd = this.load(id, name, vol);
        snd.play(loop);

        return snd;
    },
    load: function (id, name, vol) {
        // Load sound, return AudioStream object.
        //
        // id: id of <audio> tag
        // name: Name of audio stream, if a named stream

        var the_stream = null;
        var self = this;

        if (vol == null) {
            vol = 100;
        }

        if (name) {
            if (self._named_streams[name]) { // Existing named stream
                the_stream = self._named_streams[name];
                the_stream.load(self._library[id]);
            }
            else { // Create a new named stream
                the_stream = new AudioStream();
                if (self.muted) {
                    the_stream.toggle_mute();
                }

                self._named_streams[name] = the_stream;
                self._named_streams_count++;
                self._named_streams[name].load(self._library[id]);
            }
        }
        else {
            $.each(self._transient_streams, function (idx, stream) {
                if (stream.is_ended()) { // Re-use existing transient stream
                    the_stream = stream;
                    the_stream.load(self._library[id]);

                    return false; // terminate 'each' loop
                }

                return true;
            });

            if (!the_stream) { // Create a new transient stream
                the_stream = new AudioStream();
                if (self.muted) {
                    the_stream.toggle_mute();
                }
                the_stream.load(self._library[id]);
                self._transient_streams.push(the_stream);
            }
        }

        the_stream.set_volume(vol);

        return the_stream;
    },
    get_volume: function () {
        return parseInt(this._volume);
    },
    set_volume: function (vol) {
        var self = this;

        if (vol > 100) {
            vol = 100;
        }
        if (vol < 0) {
            vol = 0;
        }

        self._volume = vol;

        $.each(self._transient_streams, function (idx, stream) {
            stream.set_master_volume(self._volume);
        });

        $.each(self._named_streams, function (idx, stream) {
            if (stream) {
                stream.set_master_volume(self._volume);
            }
        });
    },
    volume_up: function (incr) {
        this.set_volume(this.get_volume() + incr);
    },
    volume_down: function (incr) {
        this.set_volume(this.get_volume() - incr);
    }
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

    if (master_volume == undefined) {
        master_volume = 100;
    }

    this._master_volume = master_volume;
    this._premute_vol = 100;

    this.audio_obj = new Audio();
    this.muted = false;

    this.set_volume(100);

};

AudioStream.prototype = {
    log: function (msg) {
        if (console) {
            console.log("AudioStream: " + msg);
        }
    },
    play_obj: function (orig, loop) {
        // Load and play given audio source.
        this.load(orig);
        this.play(loop);
    },
    load: function (orig) {
        // Start loading given audio object, but do not play it yet.

        this.audio_obj.src = orig.src;
        this.audio_obj.load();
    },
    set_master_volume: function (vol) {
        var current_volume = this.get_volume();

        if (current_volume == 0 && !this.muted) {
            current_volume = 100;
        }
        this._master_volume = vol;
        this.set_volume(current_volume);
    },
    set_volume: function (vol) {
        if (vol < 0) {
            vol = 0;
        }
        if (vol > 100) {
            vol = 100;
        }
        
        if (this.muted) {
            this._premute_vol = vol;
        }
        else {
            vol = vol * (this._master_volume / 100);
            if (vol != this.get_volume()) { // Setting volume on a raw audio object is strangely expensive
                this.audio_obj.volume = vol / 100;
            }
        }
        
    },
    get_volume: function () {
        var vol = this.audio_obj.volume;

        if (this.muted) {
            vol = this._premute_vol;
        }

        if (this._master_volume == 0) {
            return vol * 100;
        }

        return parseInt((vol * 100) * (100 / this._master_volume));
    },
    volume_up: function (incr) {
        this.set_volume(this.get_volume() + incr);
    },
    volume_down: function (incr) {
        this.set_volume(this.get_volume() - incr);
    },
    toggle_mute: function () {
        if (this.muted) {
            this.muted = false;
            this.set_volume(this._premute_vol);
        }
        else {
            this.set_volume(0);
            this.muted = true;
        }

        return this.muted;
    },
    is_ended: function () {
        return this.audio_obj.ended;
    },
    play: function(loop) {
        var self = this;
        self.audio_obj.play();

        if (loop) {
            $(self.audio_obj).bind('ended', function (event) {
                $(self.audio_obj).unbind('ended');
                self.play(true);
            });

        }
    },
    pause: function() {
        this.audio_obj.pause();
    }
};

