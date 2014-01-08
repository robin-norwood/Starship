var Util = function () {

};

Util.prototype = {
    deepGrep: function (callback, objectOrArray) {
        // Works like a 'grep' that unpacks arrays and objects
        //
        // The callback function is called like: callback(item)
        // If callback returns false, delete the item from the
        // objectOrArray.

        var deleteList = [];

        var self = this;

        $.each(objectOrArray, function (idx, item) {
            if (self.isArray(item)) {
                self.deepGrep(callback, item);
            }
            else if (!callback(item)) {
                deleteList.push([idx, item]);
            }

            if (self.isObject(item) &&
                (item.entities && (self.isObject(item.entities) || self.isArray(item.entities)))) {
                self.deepGrep(callback, item.entities);
            }

        });

        if (self.isArray(objectOrArray)) {
            deleteList.sort(function (a, b) {
                return b[0] - a[0];
            });
        }

        $.each(deleteList, function (idx, thing) {
            if (self.isObject(thing[1]) && typeof thing[1].destroy == 'function') {
                thing[1].destroy();
            }

            if (self.isArray(objectOrArray)) {
                objectOrArray.splice(thing[0], 1);
            }
            else {
                delete objectOrArray[thing[0]];
            }
        });
    },
    isArray: function (thing) {
        return thing &&
            typeof thing.length === 'number' &&
            !(thing.propertyIsEnumerable('length')) &&
            typeof thing.splice === 'function';
    },
    isObject: function (thing) { // A "real" object, not an array. Oh, JavaScript...
        return typeof thing == 'object' && (! this.isArray(thing));
    },
    getRelPos: function (e, obj) {
        // Get the relative position of the event inside the object
        return {x: e.pageX - obj.offsetLeft,
                y: e.pageY - obj.offsetTop};
    },
    deg2rad: function (deg) {
        // degrees to radians

        return Math.PI * deg/180;
    },
    rad2deg: function (rad) {
        // radians to degrees

        return rad * 180 / Math.PI;
    },
    distance: function (x1, y1, x2, y2) {
        // distance between two pixels

        return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    },
    vectorComps: function (ang, mag) {
        // Break a vector (magnitude and ang in radians)
        // into components
        return [mag * Math.cos(ang), mag * Math.sin(ang)];
    },
    vectorAddition: function (v1Ang, v1Mag, v2Ang, v2Mag) {
        // v1Ang and v2Ang are in radians

        // Normalize directions for simplicity
        v1Ang = v1Ang % (Math.PI * 2);
        v2Ang = v2Ang % (Math.PI * 2);

        if (!v2Mag) {
            return {ang: v1Ang, mag: v1Mag};
        }

        if (v1Mag == 0) {
            return {angle: v2Ang, magnitude: v2Mag};
        }

        var newAng = undefined;
        var newMag = undefined;

        var diff = Math.round((v1Ang - v2Ang) * 1000) / 1000;
        var approxPI = Math.round(Math.PI * 1000) / 1000;
        if (diff == 0) { // 'forward'
            newAng = v1Ang;
            newMag = v1Mag + v2Mag;
        }
        else if (diff == approxPI) { // 'backward'
            if (v1Mag - v2Mag > 0) {
                newAng = v1Ang;
                newMag = v1Mag - v2Mag;
            }
            else {
                newAng = v2Ang;
                newMag = v2Mag - v1Mag;
            }
        }
        else if (diff % (approxPI/2) == 0) { // right angle
            newMag = Math.sqrt(Math.pow(v1Mag, 2) + Math.pow(v2Mag, 2));
            newAng = v1Ang + Math.asin(v2Mag / newMag);
        }
        else { // Vector addition.
            var a = this.vectorComps(v1Ang, v1Mag);
            var b = this.vectorComps(v2Ang, v2Mag);

            var rx = a[0] + b[0];
            var ry = a[1] + b[1];
            newMag = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2));
            newAng = Math.atan(ry / rx);

            if (rx < 0) {
                newAng += Math.PI;
            }
        }

        if (!newMag) { // If newMag drops to 0, newAng becomes NaN
            newAng = v1Ang;
        }

        return {angle: newAng, magnitude: newMag};
    },
    accelerate: function(curDir, speed, accelDir, rate) {
        // Accelerate  in the given direction (in radians), and the given rate

        // Normalize directions
        curDir = curDir % (Math.PI * 2);
        accelDir = accelDir % (Math.PI * 2);

        if (!rate) {
            return {dir: curDir, speed: speed};
        }

        if (speed == 0) {
            return {dir: accelDir, speed: rate};
        }

        var newDir = undefined;
        var newSpeed = undefined;

        var diff = Math.round((curDir - accelDir) * 1000) / 1000;
        var approxPI = Math.round(Math.PI * 1000) / 1000;
        if (diff == 0) { // 'forward'
            newDir = curDir;
            newSpeed = speed + rate;
        }
        else if (diff == approxPI) { // 'backward'
            if (speed - rate > 0) {
                newDir = curDir;
                newSpeed = speed - rate;
            }
            else {
                newDir = accelDir;
                newSpeed = rate - speed;
            }
        }
        else if (diff % (approxPI/2) == 0) { // right angle
            newSpeed = Math.sqrt(Math.pow(speed, 2) + Math.pow(rate, 2));
            newDir = curDir + Math.asin(rate / newSpeed);
        }
        else { // Vector addition.
            var a = this.vectorComps(curDir, speed);
            var b = this.vectorComps(accelDir, rate);

            var rx = a[0] + b[0];
            var ry = a[1] + b[1];
            newSpeed = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2));
            newDir = Math.atan(ry / rx);

            if (rx < 0) {
                newDir += Math.PI;
            }
        }

        if (!newSpeed) { // If new_speed drops to 0, new_dir becomes NaN
            newDir = dir;
        }

        return {dir: newDir, speed: newSpeed};
    },
    angle: function(x0, y0, x1, y1) {
        // Return the angle in radians between the horizontal axis and
        // a line through the given points
        var rx = x1 - x0;
        var ry = y1 - y0;

        var dir = Math.atan2(ry,rx);

        return dir;
    },
    inside: function (object, target) {
    // return true iff "object" is inside the target
    // object and target must have an .x and a .y
    // target must also have a .w and an .h

        return (object.x >= target.x &&
        object.x <= target.x + target.w &&
        object.y >= target.y &&
        object.y <= target.y + target.h);
    },
    extend: function (parent, child) {
        // Wrap jquery's extend() because I don't like the semantics.
        // Which probably means I'm doing it wrong, but whatever.
        var args = [{}, parent, child];
        args.splice(3, 0, arguments);
        return $.extend.apply(null, args);
    },
    contains: function (arr, target) {
        return $.grep(arr,
                      function (elem, targetIdx) {
                          return elem == target;
                      }).length > 0;
    }

};

var Utils = new Util();

