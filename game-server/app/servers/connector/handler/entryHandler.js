var pomelo = require('pomelo');
var Code = require('../../../../../shared/code');
var area = require('../../../models/area');
var utils = require('../../../util/utils');
var dispatcher = require('../../../util/dispatcher');

module.exports = function(app) {
  return new ConnectorHandler(app);
};

var ConnectorHandler = function(app) {
    this.app = app;
    this.serverId = app.get('serverId').split('-')[2];
};

var connectorHandler = ConnectorHandler.prototype;

// generate playerId
var pid = 1;
 
/**
 * New client entry game server. Check token and bind user info into session.
 * 
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
connectorHandler.enter = function(msg, session, next){
    // double check if space still exist (not work yet)
    var areaServers = this.app.getServersByType('area');
    if(!areaServers || areaServers.length === 0) {
        next(null, {code: 500}); // no one area servers are exist !!!
        return;
    }

    var frontedServerIdIndex = utils.getServerIndex(session.frontendId);
    var backendServer = dispatcher.dispatch(frontedServerIdIndex-1, areaServers);

    var self = this;
    var playerId = parseInt(this.serverId + pid, 10);
    pid += 1;
    session.bind(playerId);
    session.set('playerId', playerId);
    session.set('areaId', 1);
    session.on('closed', onUserLeave.bind(null, self.app));
    session.set('serverId', self.app.get('serverId'));
    session.set('backendServerId', backendServer.id);
    session.pushAll();

    next(null, {code: Code.OK, playerId: playerId});

    // serega added [begin]
    //logger.error("PLAYER Enter id=%j frontendServer=%s", playerId, session.frontendId);
    //area.getChannel().add(playerId, session.frontendId);
    // serega added [end]
};

var onUserLeave = function (app, session, reason) {
    if (session && session.uid) {
        app.rpc.area.playerRemote.playerLeave(session,{playerId: session.get('playerId'), areaId: session.get('areaId'), serverId: session.frontendId}, null);
    }
};
