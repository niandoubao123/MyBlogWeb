var mongoose = require("mongoose");
var contentSchema = require('../schemas/contents');

module.exports = mongoose.model("Content", contentSchema); //User是起的名字