var crc = require('crc');

module.exports.dispatch = function(uid, servers) {
	var index = Math.abs(parseInt(crc.crc32(uid)),16) % servers.length;
	return servers[index];
};

module.exports.dispatchConnector = function(uid, servers) {
	//console.log("index="+index);
	return servers[uid];
};

module.exports.dispatchAreaByConnector = function(connectorServerId, areaServers) {
	var index = Math.abs(parseInt(crc.crc32(uid)),16) % servers.length;
	return areaServers[index];
};
