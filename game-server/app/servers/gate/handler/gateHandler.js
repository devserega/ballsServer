var Code = require('../../../../../shared/code');
//var dispatcher = require('../../../util/dispatcher');
var utils = require('../../../util/utils');

/**
 * Gate handler that dispatch user to connectors.
 */
module.exports = function(app) {
	return new GateHandler(app);
};

var GateHandler = function(app) {
	this.app = app;
};

var gateHandler = GateHandler.prototype; // need for local debugging at WebStorm

gateHandler.queryEntry = function(msg, session, next) {
	var uid = msg.uid; // username
	if (!uid) {
		next(null, {code: Code.FAIL});
		return;
	}

	var connectorServers = this.app.getServersByType('connector');
	if (!connectorServers || connectorServers.length === 0) {
		next(null, {code: Code.CONNECTOR.NO_SERVER_AVAILABLE});
		return;
	}

	var areaServers = this.app.getServersByType('area');
	if(!areaServers || areaServers.length === 0) {
		next(null, {code: Code.AREA.FA_NO_SERVER_AVAILABLE});
		return;
	}

	var serverIndex=0;
	var serverFound=false;
	var allPlayersOnAllServers = 0;
	utils.findFreeGameLogicServer({app: this.app}, function(err, areaServerId, app, totalPlayers){
		//console.log("totalPlayers1="+totalPlayers);
		allPlayersOnAllServers=allPlayersOnAllServers+totalPlayers;
		if(err){
			//console.error("ERROR: no free space on server "+areaServerId);
		}else {
			if (!serverFound) {
				serverFound=true;

				var connectorServerId = utils.getConnectorServerId(areaServerId);
				var connectorServer = app.getServerById(connectorServerId);

				//console.log("SUCCESS: serverIndex=" + serverIndex + " backendServerId=" + areaServerId + " frontendServerId=" + connectorServer.id);
				next(null, {code: 200, host: connectorServer.host, port: connectorServer.clientPort, totalPlayers: totalPlayers});
			}
		}
		serverIndex++;

		if(serverIndex===areaServers.length){
			//console.log("allPlayersOnAllServers="+allPlayersOnAllServers);
			// not free game logic server found
			next(null, {code: Code.AREA.FA_NO_SERVER_AVAILABLE});
			return;
		}
	});
};

gateHandler.gueryGetAllUsers = function(msg, session, next) {
	//console.log("HUI=" + (10 >> 0));
	var areaServers = this.app.getServersByType('area');
	if(!areaServers || areaServers.length === 0) {
		next(null, {code: Code.AREA.FA_NO_SERVER_AVAILABLE});
		return;
	}

	var servers = {};
	var serverIndex = 0;
	var allPlayersOnAllServers = 0;
	utils.findFreeGameLogicServer({app: this.app}, function(err, areaServerId, app, totalPlayers){
		allPlayersOnAllServers=allPlayersOnAllServers+totalPlayers;
		servers[areaServerId]=totalPlayers;
		if(err){}
		serverIndex++;

		if(serverIndex===areaServers.length){
			next(null, {code: 200, allPlayersOnAllServers: allPlayersOnAllServers, servers: servers});
			return;
		}
	});
};