var mongoose = require("mongoose");
module.exports = new mongoose.Schema({
    username:String,
    password:String,
    isAdmin:{//添加管理员字段
        type:Boolean,
        default:false
    }
})