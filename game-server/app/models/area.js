//var EventEmitter = require('events').EventEmitter;
var dataApi = require('../util/dataApi');
var pomelo = require('pomelo');
var ActionManager = require('./action/actionManager');
var timer = require('./timer');
var EntityType = require('../consts/consts').EntityType;
var Treasure = require('./treasure');
var consts = require('../consts/consts');
var utils = require('../util/utils');

var exp = module.exports;

var id = 0;
var width = 0;
var height = 0;

var actionManager = null;

var allAreaPlayers = {};
var allAreaPlayersAmount=0;

//var entities = {};

//var channel = null;

//var treasureCount = 0;

//var usersSettings = {}; // save score hear

var channels = {};

var MAXChannelAmount=1;//3

var MAXPlayersPerChannelAmount=50;//35

var playerTrackers = {};

/**
 * Init areas
 * @param {Object} opts
 * @api public
 */
exp.init = function(opts) {
    //logger.error("AREA CREATED %j", opts.id);
    id = opts.id;
    width = opts.width;
    height = opts.height;

    // misha [begin] to JSON CHANGE
    this.config = { // Border - Right: X increases, Down: Y increases (as of 2015-05-20)
        serverMaxConnections: 64, // Maximum amount of connections to the server.
        serverPort: 443, // Server port
        serverGamemode: 0, // Gamemode, 0 = FFA, 1 = Teams
        serverBots: 0, // Amount of player bots to spawn
        serverBotsIgnoreViruses: false,
        serverViewBaseX: 1024, // Base view distance of players. Warning: high values may cause lag
        serverViewBaseY: 592,
        borderLeft: 0, // Left border of map (Vanilla value: 0)
        borderRight: 6000, // Right border of map (Vanilla value: 11180.3398875)
        borderTop: 0, // Top border of map (Vanilla value: 0)
        borderBottom: 6000, // Bottom border of map (Vanilla value: 11180.3398875)
        spawnInterval: 20, // The interval between each food cell spawn in ticks (1 tick = 50 ms)
        foodSpawnAmount: 10, // The amount of food to spawn per interval
        foodStartAmount: 100, // The starting amount of food in the map
        foodMaxAmount: 500, // Maximum food cells on the map
        foodMass: 1, // Starting food size (In mass)
        virusMinAmount: 10, // Minimum amount of viruses on the map.
        virusMaxAmount: 50, // Maximum amount of viruses on the map. If this amount is reached, then ejected cells will pass through viruses.
        virusStartMass: 100, // Starting virus size (In mass)
        virusFeedAmount: 7, // Amount of times you need to feed a virus to shoot it
        ejectMass: 12, // Mass of ejected cells
        ejectMassLoss: 16, // Mass lost when ejecting cells
        ejectSpeed: 160, // Base speed of ejected cells
        ejectSpawnPlayer: 50, // Chance for a player to spawn from ejected mass
        playerStartMass: 10, // Starting mass of the player cell.
        playerMaxMass: 22500, // Maximum mass a player can have
        playerMinMassEject: 32, // Mass required to eject a cell
        playerMinMassSplit: 36, // Mass required to split
        playerMaxCells: 16, // Max cells the player is allowed to have
        playerRecombineTime: 30, // Base amount of seconds before a cell is allowed to recombine
        playerMassDecayRate: .002, // Amount of mass lost per second
        playerMinMassDecay: 9, // Minimum mass for decay to occur
        playerMaxNickLength: 15, // Maximum nick length
        playerDisconnectTime: 60, // The amount of seconds it takes for a player cell to be removed after disconnection (If set to -1, cells are never removed)
        tourneyMaxPlayers: 12, // Maximum amount of participants for tournament style game modes
        tourneyPrepTime: 10, // Amount of ticks to wait after all players are ready (1 tick = 1000 ms)
        tourneyEndTime: 30, // Amount of ticks to wait after a player wins (1 tick = 1000 ms)
        tourneyAutoFill: 0, // If set to a value higher than 0, the tournament match will automatically fill up with bots after this amount of seconds
        tourneyAutoFillPlayers: 1 // The timer for filling the server with bots will not count down unless there is this amount of real players
    };
    // misha [end]

    actionManager = new ActionManager();

    exp.createChannels();

    //area run
    timer.run();
};

var getChannel = exp.getChannel= function(cid) {
    if(channels[cid].channel) {
        return channels[cid].channel;
    }

    channels[cid].channel = pomelo.app.get('channelService').getChannel('channel_' + cid, true);
    return channels[cid].channel ;
};

exp.getPlayerRoom = function(playerId) {
    var roomId = allAreaPlayers[playerId];
    return channels[roomId];
}

function addEvent(player) {
    player.on('pickItem', function(args) {
        var player = exp.getEntity(player.cid, args.entityId);
        var treasure = exp.getEntity(player.cid, args.target);
        player.target = null;
        if (treasure) {
            player.addScore(treasure.score);
            exp.removeEntity(args.target);
            getChannel(player.cid).pushMessage({route: 'onPickItem', entityId: args.entityId, target: args.target, score: treasure.score});
        }
    });
}

exp.entityUpdate = function() {
    for(var cid=1; cid<=MAXChannelAmount; cid++){
        if (channels[cid].reduced.length > 0) {
            getChannel(cid).pushMessage({route: 'removeEntities', entities: channels[cid].reduced});
            channels[cid].reduced = [];
        }
        if (channels[cid].added.length > 0) {
            getChannel(cid).pushMessage({route: 'addEntities', entities: channels[cid].added});
            channels[cid].added = [];
        }
    }
};

/**
 * Add entity to room
 * @param {Object} room
 * @param {Object} e Entity to add to the area.
 */
exp.addEntity = function(room, e) {
    if (!e || !e.entityId) {
        return false;
    }

    room.entities[e.entityId] = e;

    if (e.type === EntityType.PLAYER) {
        addEvent(e);

        if(room.players[e.id]==undefined)
            room.players[e.id]=[];
        room.players[e.id].push(e.entityId);

        if(allAreaPlayers[e.id]==undefined){
            //console.log("playerAdd id=%j cid=%j", e.id, e.cid);
            allAreaPlayers[e.id]=e.cid;
            allAreaPlayersAmount++;
        }
        //console.log("allAreaPlayers.length="+allAreaPlayersAmount);

        // init user settings
        //if(room.usersSettings[e.id]==undefined)
        //    room.usersSettings[e.id]={};
    } else if (e.type === EntityType.TREASURE) {
        room.treasureCount++;
    }

    room.added.push(e);
    return true;
};

// player score rank (changed)
var tickCount = 0;
exp.rankUpdate = function () {
    tickCount ++;

    if (tickCount >= 10) {
        tickCount = 0;

        for(var cid=1; cid<=MAXChannelAmount; cid++){
            var entSize=0;
            var ent = exp.getAllEntities(cid);
            for (var key in ent) {
                if (ent.hasOwnProperty(key)) entSize++;
            }

            var playersEntities = exp.getAllPlayers(cid);
            //var player = exp.getAllPlayers();
            //logger.warn('PLAYERS in game = %j , AE = %j', player.length, entSize);
            //player.sort(function(a, b) {
            //    return a.score < b.score;
            //});

            // need fix
            //var ids=[];
            //for(var index in playersEntities){
            //    ids.push(playersEntities[index].entityId);
            //    console.log(">"+playersEntities[index].entityId);
            //}

            //var ids = player.slice(0, 10).map(function(a){ return a.entityId; });

            // need fix
            // bad solution make broadcast to all players in future
            //getChannel(cid).pushMessage({route: 'rankUpdate', entities: ids});
        }
    }
};

/**
 * Remove Entity form area
 * @param {Number} cid
 * @param {Number} entityId The entityId to remove
 * @return {boolean} remove result
 */
exp.removeEntity = function(cid, entityId) {
    var room = channels[cid];
	var e = room.entities[entityId];
	if (!e) {
		return true;
    }

    //console.log("SkindId="+e.kindId);
    //if(e.kindId==4){
    //    console.log("CACTUS111");
    //}

    if (e.type === EntityType.PLAYER) {
		actionManager.abortAllAction(entityId);
			
        delete room.players[e.id];
    } else if (e.type === EntityType.TREASURE) {
        room.treasureCount--;
	}

    delete room.entities[entityId];
    room.reduced.push(entityId);
    return true;
};

/**
 * Get entity from area
 * @param {Number} channelId
 * @param {Number} entityId
 */
exp.getEntity = function(channelId, entityId) {
    var room = channels[channelId];
    //console.log("SroomID="+room.cid);
    return room.entities[entityId];
};

/** (NOT WORK)
 * Get entities by given channelId
 * @param {Number} channelId
 */
exp.getEntities = function(channelId) {
    /*
	var result = [];
    var ids = room.players;
    console.log("length="+room.players.length);
	for (var i = 0; i < ids.length; i++) {
		var entity = room.entities[ids[i]];
		if (entity) {
			result.push(entity);
        }
	}*/

    var room = channels[channelId];
    var result = {};

    for (var id in room.entities) {
        var entity = room.entities[id];
        if(!!entity) {
            if(!result[entity.type]){
                result[entity.type] = [];
            }

            result[entity.type].push(entity);
            result.length++;
        }
    }
	
	return result;
};

// changed (maybe slow)
exp.getAllPlayers = function(cid) {
    var room = channels[cid];
	var _players = [];
    for (var id in room.players) {
        var ids = room.players[id];
        if(ids!=undefined) {
            for (var index in ids) {
                _players.push(room.entities[ids[index]]);
            }
        }
    }

	return _players;
};

exp.generateTreasures = function (n, room) {
    //console.log("generateTreasures.roomId="+room.cid);
    if (!n) {
        return;
    }
    for (var i = 0; i < n; i++) {
        var d = dataApi.treasureData.randomTreasure();
        //var score = utils.rand(d.MINScore, d.MAXScore);
        var prob = utils.rand(1, 2);
        if(prob==1){
            score=d.MINScore;
        }
        else if(prob==2){
            score=d.MAXScore;
        }
        var t = new Treasure({kindId: d.id, score: score});
        exp.addEntity(room, t);
    }
};

exp.createChannels = function() {
    for(var cid=1; cid<=MAXChannelAmount; cid++){
        if(channels[cid] === undefined)
            channels[cid]=[];
        channels[cid].cid=cid;
        channels[cid].players={};
        channels[cid].entities={};
        channels[cid].usersSettings={};
        channels[cid].treasureCount=0;
        channels[cid].width=0;//!!!!! from json
        channels[cid].height=0;//!!!!! from json
        channels[cid].playersCount=0; //

        channels[cid].added = []; // the added entities in one tick
        channels[cid].reduced = []; // the reduced entities in one tick

        channels[cid].playersIDsArr = [];

        //logger.error("channelCreated="+channels[cid].cid);

        // generate treasures in channels
        exp.generateTreasures(consts.TREASURES.MAX, channels[cid]);
    }
};

exp.initChannel = function(cid){
    if( channels[cid].channel ) {
        return channels[cid].channel;
    }

    channels[cid].channel = pomelo.app.get('channelService').getChannel('channel_' + cid, true);
    return channels[cid].channel;
};

exp.findRoomWithFreePlace = function(){
    var _channel=undefined;
    for(var cid=1; cid<=MAXChannelAmount; cid++){
        if(channels[cid].playersCount<MAXPlayersPerChannelAmount){
            getChannel(cid);

            _channel=channels[cid];
            break;
        }
    }
    return _channel;
};

// fix
exp.enterRoom = function(room, player){
    room.playersCount++;
    room.channel.add(player.id, player.serverId);

    channels[player.cid].playersIDsArr.push(player);
};

exp.getAllEntities = function(cid) {
    var room = channels[cid];
	return room.entities;
};

// changed
exp.getPlayer = function(playerId) {
    //for (var key in allAreaPlayers) {
    //    console.log("key="+key+" obj="+allAreaPlayers[key]);
   // }

    //console.log("roomId="+allAreaPlayers[playerId]+" amount="+allAreaPlayersAmount);
    var room = channels[allAreaPlayers[playerId]];
    //console.log("getPlayer="+playerId+" room="+room.cid);
    var _entities = [];
    var entitiesIds = room.players[playerId];
    for (var key in entitiesIds) {
        _entities.push(room.entities[entitiesIds[key]]);
    }

    return _entities;
};

/**
 * Remove Player from Area and Channel
 * @param {Number} cid - channel id
 * @param {Number} playerId - The playerId to remove
 * @param {Number} serverId - The serverId for witch player connected
 * @return {boolean} remove result
 */
exp.removePlayer = function(cid, playerId, serverId) {
    var playerRoom = channels[cid];
    for (var key in playerRoom.entities) {
        var e = playerRoom.entities[key];
        if (e.type === EntityType.PLAYER && e.id === playerId)
            this.removeEntity(cid, e.entityId);
    }

    if(playerRoom.players[playerId]!=undefined){
        //logger.warn('remove PLAYER');
        delete playerRoom.players[playerId];
    }

    // clean user settings
    delete playerRoom.usersSettings[playerId];

    var roomId1=allAreaPlayers[playerId];
    delete allAreaPlayers[playerId];
    var roomId2=allAreaPlayers[playerId];
    //console.log("removePlayer pid=%j %j", roomId1, roomId2);

    if(playerRoom.playersCount>0)
        playerRoom.playersCount--;

    // remove player from channel
    getChannel(cid).leave(playerId, serverId);
};

/**
 * Get area entities for given postion and range.
 */
exp.getAreaInfo = function(cid) {
	//var entities = this.getAllEntities(cid);
    var entities = this.getEntities(cid);
	return {id: id, entities : entities, width: width, height: height};
};

exp.width = function() {
	return width;
};

exp.height = function() {
	return height;
};

exp.entities = function (room) {
	return room.entities;
};

exp.actionManager = function() {
	return actionManager;
};

exp.timer = function() {
	return timer;
};

var treasuresTicksCounter = consts.TREASURES.Ticks4Respawn;
exp.treasuresUpdate = function() {
    if (treasuresTicksCounter <= 0) {
        treasuresTicksCounter = consts.TREASURES.Ticks4Respawn;

        for(var cid=1; cid<=MAXChannelAmount; cid++){
            var res = consts.TREASURES.MAX-channels[cid].treasureCount;
            if (res > 0)
                exp.generateTreasures(res, channels[cid]);
            //console.log("cid=%j res=%j",cid,res);
        }
    }
    else
        treasuresTicksCounter--;
};

exp.isFreeSpaceExist = function() {
    var totalPlayers=0;
    for(var cid=1; cid<=MAXChannelAmount; cid++)
        totalPlayers += channels[cid].playersCount;

    //console.log("totalPlayers="+totalPlayers);

    if(totalPlayers<MAXChannelAmount*MAXPlayersPerChannelAmount)
        return true;
    else
        return false;
};

exp.getAreaServerInfo = function() {
    var totalPlayers=0;
    for(var cid=1; cid<=MAXChannelAmount; cid++)
        totalPlayers += channels[cid].playersCount;

    //console.log("totalPlayers="+totalPlayers);

    if(totalPlayers<MAXChannelAmount*MAXPlayersPerChannelAmount)
        return {'freeSpaceExist': true, 'totalPlayers': totalPlayers};
    else
        return {'freeSpaceExist': false, 'totalPlayers': totalPlayers};
};

// misha
exp.getPlayerTrackers = function() {
    return playerTrackers;
};

exp.addPlayerTracker = function(keyVal, val) {
    //if(undefined === playerTrackers[keyVal])
    //    playerTrackers[keyVal] = [];
    playerTrackers[keyVal] = val;
};

exp.getPlayerTracker = function(keyVal) {
    return playerTrackers[keyVal];
};

exp.updateMovingUnits = function() {
    for (var key in playerTrackers) {
        var value = playerTrackers[key];
        var cells = value.cells;
        for (var keyVal in cells) {
            var cell = cells[keyVal];

            // Do not move cells that have already been eaten or have collision turned off
            if ((!cell) || (cell.ignoreCollision)) {
                continue;
            }

            var client = cell.owner;
            cell.calcMove(client.mouse.x, client.mouse.y);
        }
    }
}

exp.sendPositionsToClients = function() {
    for (var key in channels) {
        var room = channels[key];
        var posArr = [];
        var arrLen = room.playersIDsArr.length;
        for(var i = 0; i < arrLen; ++i) {
            var somePlayer = room.playersIDsArr[i];
            posArr.push({entityId: somePlayer.entityId, x: somePlayer.x, y: somePlayer.y});
        }
        //console.log("posArrLen:"+posArr.length);
        getChannel(room.cid).pushMessage({route: 'onMoveAll', targets: posArr});
    }
}