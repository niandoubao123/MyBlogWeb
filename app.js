var express = require("express");
var swig = require("swig");
//加载数据库
var mongoose = require("mongoose");
var bodyparser = require('body-parser');
var app = express();
var Cookies = require("cookies");
var User = require("./models/User");
//配置bodyparser中间件,用于获取表单
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
//设置cookie
app.use(function (req, res, next) {
    req.cookies = new Cookies(req, res);
    //解析登录用户的cookie信息
    req.userInfo = {};
    if (req.cookies.get('userInfo')) {//得到的userinfo是字符串，需要转成json
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            //获取当前登录用户的类型，是否是管理员
            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();//传到index主界面进行显示已登录用户名字
            })
        } catch (e) {
            next();
        }

    } else {
        next();
    }
});
//静态文件托管
// app.use(express.static('public'))
app.use(express.static('public'))
//配置模板
app.engine('html',swig.renderFile);
app.set('views','./views');
app.set('view engine','html');
//取消模板缓存限制
swig.setDefaults({cache:false});

app.use('/admin',require('./routers/admin'))
app.use('/api',require('./routers/api'))
app.use('/',require('./routers/main'))

mongoose.connect('mongodb://localhost:27017/blog',function(err){
    if(err){
        console.log("数据库链接失败")
    }else{
        console.log("数据库连接成功")
        app.listen(3003, '127.0.0.1', function () {
            console.log("server ok");
        })
    }
})
