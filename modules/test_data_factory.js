'use strict'; 
module.exports = TestDataFactory;
var method = TestDataFactory.prototype;

function TestDataFactory() {
}

method.readDataFromJson = function(file) {
  var fs = require('fs');
  var file = fs.readFileSync(file);
  var json = JSON.parse(file);
  return json;
}









