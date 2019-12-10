var mongoose = require("mongoose");
var categoriesSchema = require('../schemas/categories');

module.exports = mongoose.model("Category", categoriesSchema); //User是起的名字