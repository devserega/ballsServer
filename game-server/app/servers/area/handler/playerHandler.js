// Module dependencies
var area = require('../../../models/area');
var Player = require('../../../models/player');
var logger = require('pomelo-logger').getLogger(__filename);
var consts = require('../../../consts/consts');
var PlayerTracker = require('../../../models/PlayerTracker');

var handler = module.exports;

/**
 * Player enter scene, and response the related information such as
 * playerInfo, areaInfo and mapData to client.
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.enterScene = function(msg, session, next) {
   // var role = dataApi.role.random();
    // misha [begin]
    var playerTracker = new PlayerTracker({id: msg.playerId, name: "aaaa"});//msg.name});
    area.addPlayerTracker(msg.playerId, playerTracker);
    // misha [end]

    var player = new Player({id: msg.playerId, name: msg.name, kindId: 1, mass: 10, owner: playerTracker});
    player.serverId = session.frontendId; // frontend server id
    player.score=10;

    playerTracker.addCell(player.entityId, player);

    // find channel with free space
    var playerRoom = area.findRoomWithFreePlace();
    player.cid=playerRoom.cid;

    if (!area.addEntity(playerRoom, player)) {
        logger.error("Add player to area faild! areaId : " + player.areaId);
        next(new Error('fail to add user into area'), {
            route: msg.route,
            code: consts.MESSAGE.ERR
         });
        return;
    }

    area.enterRoom(playerRoom, player);

    // prepare data for client
    var data = {
        area: area.getAreaInfo(playerRoom.cid),
        playerId: player.id,
        roomId: player.cid,
        areaServerId: session.get("backendServerId")
    }

    next(null, {code: consts.MESSAGE.RES, data: data});
};

/**
 * Player moves. Player requests move with the given movePath.
 * Handle the request from client, and response result to client
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.moveTo = function(msg, session, next) {
    var endPos = msg.targetPos;
    var playerId = session.get('playerId');
    //var entityId = msg.target;

    area.getPlayerTracker(playerId).setMousePos(endPos);
    //playerTrackers[playerId].setMousePos(endPos);

    next(null, {route: msg.route});
    return;

    var endPos = msg.targetPos;
    var playerId = session.get('playerId');
    var entityId = msg.target;
    var speed = msg.speed;
    var playerRoom = area.getPlayerRoom(playerId);

    //var playersEntities = area.getPlayer(playerId);
    //if (!playersEntities) {
    //    logger.error('Move without a valid player ! playerId : %j', playerId);
    //    next(new Error('invalid player:' + playerId), {code: consts.MESSAGE.ERR});
    //    return;
    //}

    var targetEntity = area.getEntity(playerRoom.cid, entityId);
    if(!targetEntity){ // || targetEntity.id != playerId
        logger.warn('Wrong entity');
        next(new Error('fail to move for wrong entity'), {code: consts.MESSAGE.ERR});

        return;
    }


    //logger.warn('player_id = %j entity.player_id = %j', playerId, targetEntity.id);

    //targetEntity.target = targetEntity ? targetEntity.entityId : null;

    //if (endPos.x > area.width() || endPos.y > area.height()) {
        //logger.warn('The path is illigle!! The path is: %j', msg.path);
    //    next(new Error('fail to move for illegal path'), {code: consts.MESSAGE.ERR});
    //
    //    return;
    //}

    targetEntity.setPos(endPos.x, endPos.y);
    area.getChannel(playerRoom.cid).pushMessage({route: 'onMove', entityId: targetEntity.entityId, endPos: endPos, speed: speed});

    next(null, {route: msg.route});
};

handler.moveToAll = function(msg, session, next) {
    var playerId = session.get('playerId');
    var playerRoom = area.getPlayerRoom(playerId);
    var playersEntitiesArr= msg.targets;

    var playersEntitiesArrLength = playersEntitiesArr.length;
    for (var i = 0; i < playersEntitiesArrLength; i++) {
        var targetEntityJSON = playersEntitiesArr[i];
        var targetEntity = area.getEntity(playerRoom.cid, targetEntityJSON.entityId);
        targetEntity.setPos(targetEntityJSON.x, targetEntityJSON.y);
    }

    area.getChannel(playerRoom.cid).pushMessage({route: 'onMoveAll', targets: playersEntitiesArr});

    next(null, {route: msg.route});
};

// one eat many, not tested
/*
handler.pickUpAll = function(msg, session, next) {
    var playerId = session.get('playerId');
    var playerRoom = area.getPlayerRoom(playerId);
    var pickUpsEntities= msg.targets;
    var entityForGrow = area.getEntity(playerRoom.cid, msg.entityIdForGrow);

    var pickUpEntitiesLength = pickUpsEntities.length;
    for (var i = 0; i < pickUpEntitiesLength; i++) {
        var targetEntityJSON = pickUpsEntities[i];
        var targetEntity = area.getEntity(playerRoom.cid, targetEntityJSON.entityId);
        targetEntity.setPos(targetEntityJSON.x, targetEntityJSON.y);
    }

    area.getChannel(playerRoom.cid).pushMessage({route: 'onMoveAll', targets: playersEntitiesArr});

    next(null, {route: msg.route});
};*/

handler.PickUp = function(msg, session, next) {
    var playerId = session.get('playerId');
    var playerRoom = area.getPlayerRoom(playerId);
    //var player = area.getPlayer(playerId);

    //if (!player) {
    //    logger.error('PickUp without a valid player ! playerId : %j', playerId);
    //    next(new Erkjkiror('invalid player:' + playerId), {code: consts.MESSAGE.ERR});
    //    return;
    //}

    // add anti hack check
    //  ...

    //logger.info('HQCORE entityForDestroy = %j, entityIdForGrow = %j', msg.entityIdForDestroy, msg.entityIdForGrow);
    var entityForDestroy = area.getEntity(playerRoom.cid, msg.entityIdForDestroy);
    var entityForGrow = area.getEntity(playerRoom.cid, msg.entityIdForGrow);
    if (entityForDestroy && entityForGrow) {
        var newRadius = Math.sqrt(Math.pow(entityForDestroy.score, 2)+Math.pow(entityForGrow.score, 2));
        entityForGrow.score=newRadius;

        //player.addScore(entityForDestroy.score);
        area.removeEntity(playerRoom.cid, msg.entityIdForDestroy);
        area.getChannel(playerRoom.cid).pushMessage({route: 'onPickItem', entityId: msg.entityIdForGrow, target: msg.entityIdForDestroy});//, score: 0
    }

    next(null, {route: msg.route});
};

// cactus
handler.Divide = function(msg, session, next) {
    //var role = dataApi.role.random();
    var playerId = session.get('playerId');
    var entityId = msg.entityId;
    var entity4DestroyId = msg.entity4DestroyId;
    var playerRoom = area.getPlayerRoom(playerId);
    var entity4Divide = area.getEntity(playerRoom.cid, entityId);
    var rArr = msg.r;

    //console.log("source id="+entity4Divide.entityId+" x="+entity4Divide.x+" y="+entity4Divide.y)
    var newEntities=[];
    var rArrLength = rArr.length;
    for (var i = 1; i < rArrLength; i++) {
        var player = new Player({id: entity4Divide.id, name: entity4Divide.name, kindId: entity4Divide.kindId});
        player.serverId = session.frontendId;
        player.score=rArr[i];
        player.x=entity4Divide.x;
        player.y=entity4Divide.y;
        player.color=entity4Divide.color;
        //console.log("new id="+player.entityId+"x="+player.x+" y="+player.y)

        newEntities.push(player.entityId);

        if (!area.addEntity(playerRoom, player)) {
            logger.error("Add player to area faild! areaId : " + player.areaId);
            next(new Error('fail to add user into area'), {route: msg.route, code: consts.MESSAGE.ERR});
            return;
        }
    }

    // change radius
    entity4Divide.score = rArr[0];

    // destroy entity
    area.removeEntity(playerRoom.cid, entity4DestroyId);

    area.getChannel(playerRoom.cid).pushMessage({route: 'onDivide', newEntities: newEntities, srcEntity: entity4Divide.entityId, entity4DivideScore:entity4Divide.score});

    next(null, {route: msg.route});
};