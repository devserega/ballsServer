var util = require('util');
var Entity = require('./entity');
//var dataApi = require('../util/dataApi');
var EntityType = require('../consts/consts').EntityType;
//var logger = require('pomelo-logger').getLogger(__filename);
var area = require('./area');
var utils = require('../util/utils');

/**
 * Initialize a new 'Player' with the given 'opts'.
 * Player inherits Character
 *
 * @param {Object} opts
 * @api public
 */

function Player(opts) {
  Entity.call(this, opts);
  this.id = opts.id;
  this.type = EntityType.PLAYER;
  this.name = opts.name;
  this.score = opts.score || 0;
  this.target = null;
  this.color =  utils.dec2hex(utils.rand(0, 255))+
                utils.dec2hex(utils.rand(0, 255))+
                utils.dec2hex(utils.rand(0, 255));
}

util.inherits(Player, Entity);

module.exports = Player;

Player.prototype.addScore = function (score) {
  this.score += score;
};

/**
 * Parse String to json.
 * It covers object' method
 *
 * @param {String} data
 * @return {Object}
 * @api public
 */
Player.prototype.toJSON = function() {
  return {
    id: this.id,
    entityId: this.entityId,
    name: this.name,
    kindId: this.kindId,
    type: this.type,
    x: this.x,
    y: this.y,
    areaId: this.areaId,
    score: this.score,
    color: this.color
  };
};

// misha
Player.prototype.simpleCollide = function(check,d) {
  // Simple collision check
  var len = 2 * d >> 0; // Width of cell + width of the box (Int)

  return (this.abs(this.x - check.x) < len) &&
      (this.abs(this.y - check.y) < len);
};

Player.prototype.calcMergeTime = function(base) {
  this.recombineTicks = base + ((0.02 * this.mass) >> 0); // Int (30 sec + (.02 * mass))
};

// Movement

Player.prototype.calcMove = function(x2, y2) {
  var r = this.getSize(); // Cell radius

  // Get angle
  var deltaY = y2 - this.y;
  var deltaX = x2 - this.x;
  var angle = Math.atan2(deltaX,deltaY);
  if(isNaN(angle)) {
    return;
  }

  // Distance between mouse pointer and cell
  var dist = this.getDist(this.x,this.y,x2,y2);
  var speed = Math.min(this.getSpeed(),dist);

  var x1 = this.x + ( speed * Math.sin(angle) );
  var y1 = this.y + ( speed * Math.cos(angle) );

  // Collision check for other cells
  for (var i = 0; i < this.owner.cells.length;i++) {
    var cell = this.owner.cells[i];

    if ((this.nodeId == cell.nodeId) || (this.ignoreCollision)) {
      continue;
    }

    if ((cell.recombineTicks > 0) || (this.recombineTicks > 0)) {
      // Cannot recombine - Collision with your own cells
      var collisionDist = cell.getSize() + r; // Minimum distance between the 2 cells
      if (this.simpleCollide(cell, collisionDist)) {
        // Skip
        continue;
      }

      // First collision check passed... now more precise checking
      dist = this.getDist(this.x,this.y,cell.x,cell.y);

      // Calculations
      if (dist < collisionDist) { // Collided
        // The moving cell pushes the colliding cell
        var newDeltaY = cell.y - y1;
        var newDeltaX = cell.x - x1;
        var newAngle = Math.atan2(newDeltaX,newDeltaY);

        var move = collisionDist - dist + 5;

        cell.x = cell.x + ( move * Math.sin(newAngle) ) >> 0;
        cell.y = cell.y + ( move * Math.cos(newAngle) ) >> 0;
      }
    }
  }

  // Check to ensure we're not passing the world border
  if (x1 < 0) {
    x1 = 0;
  }
  if (x1 > area.width) {
    x1 = area.width;
  }
  if (y1 < 0) {
    y1 = 0;
  }
  if (y1 > area.height) {
    y1 = area.height;
  }

  this.x = x1 >> 0;
  this.y = y1 >> 0;

  //console.error("ballPos("+this.x+", "+this.y+")");
};
// Override
Player.prototype.getEatingRange = function() {
  return this.getSize() * .4;
};

/*
Player.prototype.onConsume = function(consumer,gameServer) {
  consumer.addMass(this.mass);
};

Player.prototype.onAdd = function(gameServer) {
  // Add to special player node list
  gameServer.nodesPlayer.push(this);
  // Gamemode actions
  gameServer.gameMode.onCellAdd(this);
};

Player.prototype.onRemove = function(gameServer) {
  var index;
  // Remove from player cell list
  index = this.owner.cells.indexOf(this);
  if (index != -1) {
    this.owner.cells.splice(index, 1);
  }
  // Remove from special player controlled node list
  index = gameServer.nodesPlayer.indexOf(this);
  if (index != -1) {
    gameServer.nodesPlayer.splice(index, 1);
  }
  // Gamemode actions
  gameServer.gameMode.onCellRemove(this);
};*/

Player.prototype.moveDone = function(gameServer) {
  this.ignoreCollision = false;
};

// Lib

Player.prototype.abs = function(x) {
  return x < 0 ? -x : x;
}

Player.prototype.getDist = function(x1, y1, x2, y2) {
  var xs = x2 - x1;
  xs = xs * xs;

  var ys = y2 - y1;
  ys = ys * ys;

  return Math.sqrt(xs + ys);
}

