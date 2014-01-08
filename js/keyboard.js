/*
   keyboard.js - Prototype for the keyboard input handling

   Copyright (c) 2012 Robin Norwood <robin.norwood@gmail.com>
 */
"use strict";

var Keyhandler = function () {
    this.shiftMap = {
        "1": "!",
        "2": "@",
        "3": "#",
        "4": "$",
        "5": "%",
        "6": "^",
        "7": "&",
        "8": "*",
        "9": "(",
        "0": ")",
        ";": ":",
        "=": "+",
        "`": "~",
        "-": "_",
        "[": "{",
        "]": "}",
        "\\": "|",
        "'": "\"",
        ",": "<",
        ".": ">",
        "/": "?"
    };

    this.keyMap = {
        109: "-",
        192: "`",
        186: ";",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        219: "[",
        221: "]",
        220: "\\",
        222: "'",
        27: "esc",
        32: " ",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        46: "del",
        8: "backspace",
        9: "tab"
    };
};

Keyhandler.prototype = {
    log: function (msg) {
        if (console) {
            console.log(msg);
        }
    },
    eventToState: function (event, state) {
        if (event.altKey || event.ctrlKey) {
            return true; // don't intercept ctrl and alt
        }
        event.preventDefault();

        var letter = "";
        if (event.which >= 48 && event.which <= 90) {
            letter = String.fromCharCode(event.which);
        }
        else if (event.which in this.keyMap) {
            letter = this.keyMap[event.which];
        }

        if (letter) {
            if (event.shiftKey) {
                if (this.shiftMap.hasOwnProperty(letter)) {
                    letter = this.shiftMap[letter];
                }
            }
            else {
                letter = letter.toLowerCase();
            }

            var idx = state.keysdown.indexOf(letter);
            if (event.type == 'keydown' && idx == -1) {
                state.keysdown.push(letter);
            }
            if (event.type == 'keyup') {
                if (idx != -1) {
                    state.keysdown = $.grep(state.keysdown,
                                            function (elem, targetIdx) {
                                                return idx != targetIdx && elem != undefined;
                                            });
                    delete state.keysdown[idx];
                }
                state.keyspressed.push(letter);
            }
        }

        return false;
    }
};
