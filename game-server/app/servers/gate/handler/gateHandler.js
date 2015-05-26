var Code = require('../../../../../shared/code');
var dispatcher = require('../../../util/dispatcher');

/**
 * Gate handler that dispatch user to connectors.
 */
module.exports = function(app) {
	return new HandlerGate(app);
};

var HandlerGate = function(app) {
	this.app = app;
};

var proGate = HandlerGate.prototype; // need for local debugging at WebStorm

proGate.queryEntry = function(msg, session, next) {
	var uid = msg.uid;
	if (!uid) {
		next(null, {code: Code.FAIL});
		return;
	}

	var connectors = this.app.getServersByType('connector');
	if (!connectors || connectors.length === 0) {
		next(null, {code: Code.GATE.NO_SERVER_AVAILABLE});
		return;
	}

	var res = dispatcher.dispatch(uid, connectors);
	next(null, {code: Code.OK, host: res.host, port: res.clientPort});
};
