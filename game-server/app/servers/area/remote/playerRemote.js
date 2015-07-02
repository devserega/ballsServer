/**
 * Module dependencies
 */

var utils = require('../../../util/utils');
var area = require('../../../models/area');
var consts = require('../../../consts/consts');

//var exp = module.exports;

module.exports = function(app) {
	//console.log("CALL FIRST "+app.serverId);
	return new PlayerRemote(app);
};

var PlayerRemote = function(app) {
	this.app = app;
};

/**
 * Player exits. It will persistent player's state in the database. 
 *
 * @param {Object} args
 * @param {Function} cb
 * @api public
 */
PlayerRemote.prototype.playerLeave = function(args, cb) {
	console.log("playerLeave="+args.playerId);
	var playerId = args.playerId;
	var player = area.getPlayer(playerId);
	var playerRoomId = area.getPlayerRoom(playerId).cid;
	var serverId = args.serverId;

	if (!player) {
		utils.invokeCallback(cb);
		return;
	}
	area.removePlayer(playerRoomId, playerId, serverId);
	area.getChannel(playerRoomId).pushMessage({route: 'onUserLeave', code: consts.MESSAGE.RES, playerId: playerId});
	utils.invokeCallback(cb);
};

/* test
PlayerRemote.prototype.getCurrentTime = function(arg1, arg2, cb) {
	console.log("timeRemote - arg1:" + arg1 + ";" + "arg2:" + arg2);
	var d = new Date();
	var hour = d.getHours();
	var min = d.getMinutes();
	var sec = d.getSeconds();
	cb(hour, min, sec);
};
*/

PlayerRemote.prototype.isFreeSpaceExist = function(params, cb) {
	//console.log("serverId=" + this.app.serverId + " params.areaId=" + params.areaId);
	var result = area.getAreaServerInfo();
	var freePlaceExist = result['freeSpaceExist'];
	var totalPlayers = result['totalPlayers'];
	//console.log('totalPlayers='+totalPlayers);
	if(freePlaceExist){ //isFreeSpaceExist
		utils.invokeCallback(cb, null, this.app.serverId, totalPlayers);
		//cb(this.app.serverId);
	}
	else{
		var err = new Error("No free space in Area");
		utils.invokeCallback(cb, err, this.app.serverId, totalPlayers);
	}
};