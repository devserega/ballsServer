// Module dependencies
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var dataApi = require('../util/dataApi');
var utils = require('../util/utils');
var area = require('./area');

var eid = 1;

/**
 * Initialize a new 'Entity' with the given 'opts'.
 * Entity inherits EventEmitter
 *
 * @param {Object} opts
 * @api public
 */
function Entity(opts) {
	EventEmitter.call(this);
	this.entityId = eid++;
	this.kindId = opts.kindId;
	//this.kindName = opts.kindName;
	//this.areaId = opts.areaId || 1;
    //this.parts = []; // not used yet

    if (opts.x === undefined || opts.y === undefined) {
      this.randPos(opts.areaId || 1);
    } else {
      this.x = opts.x;
      this.y = opts.y;
    }

    //misha
    this.owner = opts.owner; // playerTracker that owns this cell
    this.color = {r: 0, g: 255, b: 0};
    this.speed = 0;
    this.radius = 0;
    this.mass = 0;//mass; // Starting mass of the cell
    this.addMass(opts.mass);
    this.cellType = -1; // 0 = Player Cell, 1 = Food, 2 = Virus, 3 = Ejected Mass

    this.moveEngineTicks = 0; // Amount of times to loop the movement function
    this.moveEngineSpeed = 0;
    this.moveDecay = .75;
    this.angle = 0; // Angle of movement

}

util.inherits(Entity, EventEmitter);

module.exports = Entity;

// random position
Entity.prototype.randPos = function(areaId) {
  var areaData = dataApi.areaData.findById(areaId);
  this.x = utils.rand(200, areaData.width - 200);
  this.y = utils.rand(200, areaData.height - 200);
};

/**
 * Get state
 *
 * @return {Object}
 * @api public
 */
Entity.prototype.getPos = function() {
	return {x: this.x, y: this.y};
};

/**
 * Set positon of this entityId
 *
 * @param {Number} x
 * @param {Number} y
 * @api public
 */
Entity.prototype.setPos = function(x, y) {
	this.x = x;
	this.y = y;
};

//misha
Entity.prototype.getName = function() {
    if (this.owner) {
        return this.owner.name;
    } else {
        return "";
    }
};

Entity.prototype.setColor = function(color) {
    this.color.r = color.r;
    this.color.b = color.b;
    this.color.g = color.g;
};

Entity.prototype.getColor = function() {
    return this.color;
};

Entity.prototype.getType = function() {
    return this.cellType;
};

Entity.prototype.getSize = function() {
    // Calculates radius based on cell mass
    //return Math.ceil(Math.sqrt(100 * this.mass));
    return this.radius;
};

Entity.prototype.addMass = function(n) {
    this.mass = Math.min(this.mass + n, area.config.playerMaxMass);

    this.speed = 30 * Math.pow(this.mass, -1.0 / 4.5) * 50 / 40;

    this.radius = Math.ceil(Math.sqrt(100 * this.mass));
};

Entity.prototype.getSpeed = function() {
    // Old formula: 5 + (20 * (1 - (this.mass/(70+this.mass))));
    // Based on 50ms ticks. If updateMoveEngine interval changes, change 50 to new value
    // (should possibly have a config value for this?)
    //return 30 * Math.pow(this.mass, -1.0 / 4.5) * 50 / 40;
    return this.speed;
};

Entity.prototype.setAngle = function(radians) {
    this.angle = radians;
};

Entity.prototype.getAngle = function() {
    return this.angle;
};

