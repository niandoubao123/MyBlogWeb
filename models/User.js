var mongoose = require("mongoose");
var usersSchema = require('../schemas/users');

module.exports = mongoose.model("User",usersSchema);//User是起的名字