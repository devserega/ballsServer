/**
 * Created by jam on 6/29/15.
 */
var util = require('util');
var area = require('./area');

function PlayerTracker(opts) {
    this.id = opts.id;
    this.name = opts.name;
    this.cells = {};
    this.score = 0; // Needed for leaderboard

    this.mouse = {x: 0, y: 0};

    this.team = 0;
}

module.exports = PlayerTracker;

// Setters/Getters

PlayerTracker.prototype.setName = function(name) {
    this.name = name;
};

PlayerTracker.prototype.getName = function() {
    return this.name;
};

PlayerTracker.prototype.getScore = function(reCalcScore) {
    if (reCalcScore) {
        var s = 0;
        for (var i = 0; i < this.cells.length; i++) {
            s += this.cells[i].mass;
            this.score = s;
        }
    }
    return this.score >> 0;
};

PlayerTracker.prototype.setColor = function(color) {
    this.color.r = color.r;
    this.color.b = color.b;
    this.color.g = color.g;
};

PlayerTracker.prototype.getTeam = function() {
    return this.team;
};

PlayerTracker.prototype.getCells = function() {
    return this.cells;
}

PlayerTracker.prototype.addCell = function(keyVal, val) {
    //if(undefined === this.cells[keyVal])
    //    this.cells[keyVal] = [];
    this.cells[keyVal] = val;
}

PlayerTracker.prototype.setMousePos = function(mousePos) {
    this.mouse = mousePos;
}