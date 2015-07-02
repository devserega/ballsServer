var pomelo = require('pomelo');
var util = require('util');

var utils = module.exports;

// callback util
utils.invokeCallback = function(cb) {
	if (!!cb && typeof cb == 'function') {
		cb.apply(null, Array.prototype.slice.call(arguments, 1));
	}
};

//generate a random number between min and max
utils.rand = function (min, max) {
  var n = max - min;
  return min + Math.round(Math.random() * n);
};

// clone a object
utils.clone = function(o) {
	var n = {};
	for (var k in o) {
		n[k] = o[k];
	}
	
	return n;
};

utils.dec2hex = function d2h(d) {
	return (d+0x100).toString(16).substr(-2).toUpperCase();
};

// added by serega [begin] (not work)
utils.findFreeGameLogicServer = function(args, cb){
	// get all game logic servers
	var servers = args.app.getServersByType('area');
	if(!servers || servers.length === 0) {
		var err = new Error("No Game Logic Servers run!");
		utils.invokeCallback(cb, err);
		return;
	}

	for(var index=0;index<servers.length; index++){
		//console.log(index+" "+chatServers[index]+" serverId="+chatServers[index].id);

		var serverId = servers[index].id

		//rpc invoke
		var params = {
			namespace : 'user',
			service : 'playerRemote',
			method : 'isFreeSpaceExist',
			args : [{
				areaId : 1,
				instanceId : 5
			}]
		};

		pomelo.app.rpcInvoke(serverId, params, function(err, serverId, totalPlayers){
			if(!!err) {
				// error
				//console.error('Not free space serverId='+result);
				var err = new Error("Not free space serverId="+serverId);
				utils.invokeCallback(cb, err, serverId, args.app, totalPlayers);
			}
			else{
				// no error
				utils.invokeCallback(cb, null, serverId, args.app, totalPlayers);
			}
		});
	}
};

utils.getServerIndex = function(serverId){
	var last = serverId.lastIndexOf("-");
	return  serverId.substring(last+1);
};

utils.getConnectorServerId = function(areaServerId){
	var last = areaServerId.lastIndexOf("-");
	var connectorServerId =  "connector-server-"+areaServerId.substring(last+1);
	return  connectorServerId;
};
// added by serega [end]