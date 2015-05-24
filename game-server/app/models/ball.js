var util = require('util');
var Entity = require('./entity');
var EntityType = require('../consts/consts').EntityType;

/**
 * Initialize a new 'Ball' with the given 'opts'.
 * Player inherits Character
 *
 * @param {Object} opts
 * @api public
 */

function Ball(opts) {
    Entity.call(this, opts);
    this.id = opts.id;
    this.type = EntityType.BALL;
    //this.name = opts.name;
    //this.walkSpeed = 240;
    //this.score = opts.score || 0;
    this.target = null;

    this.angle = opts.angle;
    this.radius = opts.radius;
}

util.inherits(Ball, Entity);

module.exports = Ball;

/**
 * Parse String to json.
 * It covers object' method
 *
 * @param {String} data
 * @return {Object}
 * @api public
 */
Ball.prototype.toJSON = function() {
    return {
        id: this.id,
        entityId: this.entityId,
        name: this.name,
        kindId: this.kindId,
        type: this.type,
        x: this.x,
        y: this.y,
        //walkSpeed: this.walkSpeed,
        areaId: this.areaId
        //score: this.score
    };
};
