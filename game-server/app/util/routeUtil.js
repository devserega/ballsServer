var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.area = function(session, msg, app, cb) {
    if(!session) {
        cb(new Error('fail to route to area server for session is empty'));
        return;
    }

    var backendServerId = session.get('backendServerId');
    //console.log("serverId(super)="+backendServerId);

    if(!backendServerId) {
        cb(new Error('fail to find backendServerId in session'));
        return;
    }

    cb(null, backendServerId);
};

/*
exp.connector = function(session, msg, app, cb) {
    console.log("FUCKEN CONNECTOR");

    if(!session) {
        cb(new Error('fail to route to connector server for session is empty'));
        return;
    }

    if(!session.frontendId) {
        cb(new Error('fail to find frontend id in session'));
        return;
    }

    cb(null, session.frontendId);
};*/
