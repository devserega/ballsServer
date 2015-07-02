var pomelo = require('pomelo');
var area = require('./app/models/area');
var dataApi = require('./app/util/dataApi');
var routeUtil = require('./app/util/routeUtil');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'balls');

// configure for global
app.configure('production|development', 'gate', function(){
    //app.disable('rpcDebugLog');

    app.set('connectorConfig', {
        connector : pomelo.connectors.hybridconnector,
        useProtobuf : true
    });
});

app.configure('production|development', 'connector', function(){
    //app.disable('rpcDebugLog');

    app.set('connectorConfig', {
        connector : pomelo.connectors.hybridconnector,
        heartbeat : 30,
        useDict : true,
        useProtobuf : true
  });
});

app.configure('production|development', 'area', function(){
    //app.disable('rpcDebugLog');

    var areaId = app.get('curServer').areaId;

    //console.warn('AREA ServerID = ' + areaId);
    if (!areaId || areaId < 0) {
        throw new Error('load area config failed');
    }
    area.init(dataApi.areaData.findById(areaId));
});

app.configure('production|development', function() {
    app.before(pomelo.filters.toobusy());

    // disbale debug log [https://github.com/NetEase/pomelo/wiki/Application-configuration]
    app.disable('rpcDebugLog');
    /*
     app.enable('systemMonitor');
     require('./app/util/httpServer');

     //var sceneInfo = require('./app/modules/sceneInfo');
     var onlineUser = require('./app/modules/onlineUser');
     if(typeof app.registerAdmin === 'function'){
     //app.registerAdmin(sceneInfo, {app: app});
     app.registerAdmin(onlineUser, {app: app});
     }*/

    /*
     //Set areasIdMap, a map from area id to serverId.
     if (app.serverType !== 'master') {
     var areas = app.get('servers').area;
     var areaIdMap = {};
     for(var id in areas){
     areaIdMap[areas[id].area] = areas[id].id;
     //console.log("sreega "+areas[id].area+" "+areas[id].id);
     }
     app.set('areaIdMap', areaIdMap);
     }

     // proxy configures
     app.set('proxyConfig', {
     cacheMsg: true,
     interval: 30,
     lazyConnection: true
     // enableRpcLog: true
     });

     // remote configures
     app.set('remoteConfig', {
     cacheMsg: true,
     interval: 30
     });*/

    /*
    app.set('connectorConfig',
        {
            connector : pomelo.connectors.hybridconnector,
            heartbeat : 3,
            useDict : true,
            useProtobuf : true
        });*/

    // route configures
    app.route('area', routeUtil.area);
    //app.route('connector', routeUtil.connector);

    // filter configures
    app.filter(pomelo.filters.timeout());
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
