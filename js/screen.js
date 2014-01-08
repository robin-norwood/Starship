/*
   screen.js - Base class for screen.

   Copyright (c) 2012 Robin Norwood <robin.norwood@gmail.com>
 */

"use strict";
var Screen = function (canvas, width, height) {
    this._canvas = canvas;
    this.context = canvas.getContext("2d");

    this.setSize(width, height);
};

Screen.prototype = {
    log: function (msg) {
        if (console) {
            console.log(msg);
        }
    },
    blit: function (sprite, frameNum, loc, size) {
        // Blit a sprite onto the current context.
        //
        // sprite: Sprite object
        // frameNum: Which frame of the sprite to use
        // loc: Target location of Sprite image on the canvas
        // size: Final size of the image (optional, defaults to sprite size)
        if (!size) {
            size = {w: sprite.w, h:sprite.h};
        }

        this.context.drawImage(sprite.src_img,
                               sprite.frames[frameNum].x,
                               sprite.frames[frameNum].y,
                               sprite.w,
                               sprite.h,
                               loc.x,
                               loc.y,
                               size.w,
                               size.h
                              );
    },
    clear: function () {
        this.context.clearRect(0, 0, this.width, this.height);
    },
    setSize: function (width, height) {
        this.width = width;
        this.height = height;
        this.x_factor = this._canvas.width / width;
        this.y_factor = this._canvas.height / height;

        this.context.scale(this.x_factor, this.y_factor);
    },
    getPos: function (event) {
        var relPos = Utils.getRelPos(event, this._canvas);
        return { x: relPos.x / this.x_factor, y: relPos.y / this.y_factor };
    },
    getCanvas: function () {
        return this._canvas;
    },
    cursor: function (style) {
        $('body').css('cursor', style);
    }
};
