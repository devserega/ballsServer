// require json files
var areaJSON = require('../../config/data/area');
//var role = require('../../config/data/role');
var treasureJSON = require('../../config/data/treasure');

var i = 1;
/**
 * Data model `new Data()`
 *
 * @param {Array}
 */
var Data = function(data) {
  //console.warn('\n ************ Data Created ************ %j\n',i);
  i++;
  var fields = {};
  data[0].forEach(function(i, k) {
    //console.warn(i+' ' +k); //test
    fields[i] = k;
  });
  data.splice(0, 1);

  var result = {}, ids = [], item;
  data.forEach(function(k) {
    //console.warn('>'+k+' - '); //test
    item = mapData(fields, k);
    result[item.id] = item;
    ids.push(item.id);
  });

  this.data = result;
  this.ids = ids;
};

/**
 * map the array data to object
 *
 * @param {Object}
 * @param {Array}
 * @return {Object} result
 * @api private
 */
var mapData = function(fields, item) {
  var obj = {};
  for (var k in fields) {
    obj[k] = item[fields[k]];
  }
  return obj;
};

/**
 * find items by attribute
 *
 * @param {String} attribute name
 * @param {String|Number} the value of the attribute
 * @return {Array} result
 * @api public
 */
Data.prototype.findBy = function(attr, value) {
  var result = [];
  //console.log(' findBy ' + attr + '  value:' + value + '  index: ' + index);
  var i, item;
  for (i in this.data) {
    item = this.data[i];
    if (item[attr] == value) {
      result.push(item);
    }
  }
  return result;
};

/**
 * find item by id
 *
 * @param id
 * @return {Obj}
 * @api public
 */
Data.prototype.findById = function(id) {
  return this.data[id];
};

Data.prototype.random = function() {
  var length = this.ids.length;
  var rid =  this.ids[Math.floor(Math.random() * length)];
  return this.data[rid];
};

var cactusAmount=0;
Data.prototype.randomTreasure = function() {
  var percent = Math.floor(Math.random() * 100);
  var rid=1;
  if(percent>0 && percent <= 1){ //5
    rid =  this.ids[3]; // cactus
  }
  else {
    var length = this.ids.length;
    rid = this.ids[Math.floor(Math.random() * length)];
    if (rid === 4)
      rid++;
  }

  if(rid === 4){ // cactus
    cactusAmount++;
    //console.log("cactus_amount="+cactusAmount);
  }
  return this.data[rid];
};

/**
 * find all item
 *
 * @return {array}
 * @api public
 */
Data.prototype.all = function() {
  return this.data;
};

module.exports = {
  areaData: new Data(areaJSON),
  //roleData: new Data(role),
  treasureData: new Data(treasureJSON)
};

