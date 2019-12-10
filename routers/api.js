var express = require("express");
var router = express.Router();
var User = require('../models/User')//引入模型用于数据库查询
var Content = require('../models/Content')//引入模型用于数据库查询
//验证逻辑   自定义的返回数据的格式，下面进行赋值
var responseData;
router.use(function(req,res,next){
    responseData={
        code:0,
        message:""
    }
    next();
})

//注册
router.post('/user/register', function (req, res, next) {
    // res.send("api-User");
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    //判空
    if(username==""){
        responseData.code = 1;
        responseData.message="用户名不能为空";
        res.json(responseData);//形式以json形式
        return;//终止
    }
    if (password == ""){
        responseData.code = 2;
        responseData.message = "密码不能为空";
        res.json(responseData);
        return;
    }
    //两次密码一致
    if(password!=repassword){
        responseData.code = 3;
        responseData.message = "两次输入的密码不一致";
        res.json(responseData);
        return;
    }
    //如果用户名已经存在
    User.findOne({username:username},function (err,userInfo){
        if (userInfo) { //如果存在这条信息就返回，证明数据库已经存在
            responseData.code = 4;
            responseData.message = "用户名已经注册了";
            res.json(responseData);
            return;
        }
        var user = new User({
            username: username,
            password: password
        }); //如果不存在就保存数据
         responseData.message = "注册成功";
         res.json(responseData)
         return user.save({},function(err,data){
            if(!err){
               console.log(data)
            }  
         });
    })
})
//登录
//页面数据提交到这里req.body
router.post('/user/login',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    if(username==""||password==""){
         responseData.code = 1;
         responseData.message = "用户名或密码不能为空";
         res.json(responseData);
         return;
    }
    //查询用户名和密码是否存在
    User.findOne({
        username:username,
        password:password
    },function(err,userInfo){
        if(!userInfo){
            responseData.code = 2;
            responseData.message = "用户名或密码错误";
            res.json(responseData);
            return;
        }
        //用户名密码正确
        responseData.message = "登陆成功";
        responseData.userInfo = {
            _id: userInfo._id,
             username: userInfo.username
        }
        req.cookies.set('userInfo',JSON.stringify({//userInfo是起名
           _id: userInfo._id,
            username: userInfo.username
        }));
        res.json(responseData);
        return;
    })
})

//  退出登录

router.get('/user/logout', function (req, res) {
    req.cookies.set('userInfo', null);
    res.json(responseData);
});

/*
 * 获取指定文章的所有评论
 * */
router.get('/comment', function (req, res) {
    var contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).then(function (content) {
        responseData.data = content.comments;
        res.json(responseData);
    })
});

//留言提交
router.post('/comment/post', function (req, res) {
    //内容的id  哪一条博客
    var contentId = req.body.contentid || '';
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    };

    //查询当前这篇内容的信息
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        content.comments.push(postData);
        return content.save();
    }).then(function (newContent) {
        responseData.message = '评论成功';
        responseData.data = newContent;
        res.json(responseData);
    });
});
module.exports = router;