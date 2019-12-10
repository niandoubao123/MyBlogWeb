var express = require("express");
var router = express.Router();
var User = require('../models/User')
var Category = require('../models/Category');
var Content = require('../models/Content');

router.use(function(req,res,next){
      if(!req.userInfo.isAdmin){
            res.send("对不起，您不是管理员");
            return;
      }
      next();
      // res.send("您好，管理员")
})
//渲染后台首页
router.get('/',function(req,res,next){
      res.render("admin/index",{
            userInfo:req.userInfo
      });
})
//用户列表首页
router.get('/user', function (req, res, next) {
    var page = Number(req.query.page || 1);
    var limit = 5;
    var pages = 0;
    User.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });
    })
})
// 用户删除
router.get('/user/delete', function (req, res) {
      //获取要删除的分类的id
      var id = req.query.id || '';
      User.remove({
            _id: id
      }).then(function () {
            res.render('admin/success', {
                  userInfo: req.userInfo,
                  message: '删除成功',
                  url: '/admin/user'
            });
      });

});
// 分类首页
router.get('/category',function(req,res){
       var page = Number(req.query.page || 1);
       var limit = 5;
       var pages = 0;
       Category.count().then(function (count) {

             //计算总页数
             pages = Math.ceil(count / limit);
             //取值不能超过pages
             page = Math.min(page, pages);
             //取值不能小于1
             page = Math.max(page, 1);
             var skip = (page - 1) * limit;
             Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function (categories) {
                   res.render('admin/category_index', {
                         userInfo: req.userInfo,
                         categories: categories,
                         count: count,
                         pages: pages,
                         limit: limit,
                         page: page
                   });
             });
       })
})
// 添加分类的页面
router.get('/category/add', function (req, res) {
      res.render('admin/category_add', {
            userInfo: req.userInfo
      });
})
// 添加分类并保存
router.post('/category/add',function(req,res){
      //  console.log(req.body);
       var name = req.body.name||"";
       if(name ==""){
             res.render('admin/error', {
                   userInfo: req.userInfo,
                   message: '名称不能为空'
             });
             return;
       }
       //查询是否已经存在
       Category.findOne({
             name:name
       },function(err,rs){
         if(rs){
             res.render('admin/error', {
                   userInfo: req.userInfo,
                   message: '分类已经存在'
             });
             return;
         }else{
             return new Category({
                   name:name
             }).save();
         }
       }).then(function(err,data){
             if(!err){
                   res.render('admin/success', {
                         userInfo: req.userInfo,
                         message: '分类创建成功',
                         url:'/admin/category'
                   });
             }
       })
})
//分类修改的页面
router.get('/category/edit',function(req,res){
      var id = req.query.id||"";
      Category.findOne({
            _id:id
      }).then(function(category){
            if(!category){
                   res.render('admin/error', {
                         userInfo: req.userInfo,
                         message: '分类不存在',
                   });
                  
            }else{
                   res.render('admin/category_edit', {
                         userInfo: req.userInfo,
                         category:category
                   });
            }
      })
})
//修改之后的保存
router.post('/category/edit', function (req, res) {

      //获取要修改的分类的信息，并且用表单的形式展现出来
      var id = req.query.id || '';
      //获取post提交过来的名称
      var name = req.body.name || '';

      //获取要修改的分类信息
      Category.findOne({
            _id: id
      }).then(function (category) {
            if (!category) {
                  res.render('admin/error', {
                        userInfo: req.userInfo,
                        message: '分类信息不存在'
                  });
                  return Promise.reject();
            } else {
                  //当用户没有做任何的修改提交的时候
                  if (name == category.name) {
                        res.render('admin/success', {
                              userInfo: req.userInfo,
                              message: '修改成功',
                              url: '/admin/category'
                        });
                        return Promise.reject();
                  } else {
                        //要修改的分类名称是否已经在数据库中存在
                        return Category.findOne({
                              _id: {
                                    $ne: id
                              },
                              name: name
                        });
                  }
            }
      }).then(function (sameCategory) {
            if (sameCategory) {
                  res.render('admin/error', {
                        userInfo: req.userInfo,
                        message: '数据库中已经存在同名分类'
                  });
                  return Promise.reject();
            } else {
                  return Category.update({
                        _id: id
                  }, {
                        name: name
                  });
            }
      }).then(function () {
            res.render('admin/success', {
                  userInfo: req.userInfo,
                  message: '修改成功',
                  url: '/admin/category'
            });
      })

});
// 分类删除
router.get('/category/delete', function (req, res) {
      //获取要删除的分类的id
      var id = req.query.id || '';
      Category.remove({
            _id: id
      }).then(function () {
            res.render('admin/success', {
                  userInfo: req.userInfo,
                  message: '删除成功',
                  url: '/admin/category'
            });
      });

});
//内容首页
router.get('/content', function (req, res) {

      var page = Number(req.query.page || 1);
      var limit = 5;
      var pages = 0;

      Content.count().then(function (count) {

            //计算总页数
            pages = Math.ceil(count / limit);
            //取值不能超过pages
            page = Math.min(page, pages);
            //取值不能小于1
            page = Math.max(page, 1);

            var skip = (page - 1) * limit;

            Content.find().limit(limit).skip(skip).populate(['category', 'user']).sort({
                  addTime: -1
            }).then(function (contents) {
                  res.render('admin/content_index', {
                        userInfo: req.userInfo,
                        contents: contents,
                        count: count,
                        pages: pages,
                        limit: limit,
                        page: page
                  });
            });

      });

});
//内容增加首页
router.get('/content/add', function (req, res) {
      Category.find().sort({_id:1}).then(function(categories){
           res.render('admin/content_add', {
               userInfo:req.userInfo,
               categories: categories
           })
      })
      
})
//内容保存
router.post('/content/add', function (req, res) {
      // console.log(req.body)
      if (req.body.category == "") {
            res.render('admin/error', {
                  userInfo: req.userInfo,
                  message: "内容分类不能为空"
            })
            return;
      }
      if (req.body.title == "") {
            res.render('admin/error', {
                  userInfo: req.userInfo,
                  message: "标题不能为空"
            })
            return;
      }
      new Content({
            category: req.body.category,
            title: req.body.title,
            user:req.userInfo._id.toString(),
            description: req.body.description,
            content: req.body.content,
      }).save().then(function (rs) {
            res.render('admin/success', {
                  userInfo: req.userInfo,
                  message: "内容保存成功"
            })
            return;
      })
})
//内容修改首页
router.get('/content/edit', function (req, res) {

      var id = req.query.id || '';

      var categories = [];

      Category.find().sort({
            _id: 1
      }).then(function (rs) {

            categories = rs;

            return Content.findOne({
                  _id: id
            }).populate('category');
      }).then(function (content) {

            if (!content) {
                  res.render('admin/error', {
                        userInfo: req.userInfo,
                        message: '指定内容不存在'
                  });
                  return Promise.reject();
            } else {
                  res.render('admin/content_edit', {
                        userInfo: req.userInfo,
                        categories: categories,
                        content: content
                  })
            }
      });

});
// 修改之后保存
router.post('/content/edit', function (req, res) {
      var id = req.query.id || '';

      if (req.body.category == '') {
            res.render('admin/error', {
                  userInfo: req.userInfo,
                  message: '内容分类不能为空'
            })
            return;
      }

      if (req.body.title == '') {
            res.render('admin/error', {
                  userInfo: req.userInfo,
                  message: '内容标题不能为空'
            })
            return;
      }

      Content.update({
            _id: id
      }, {
            category: req.body.category,
            title: req.body.title,
            description: req.body.description,
            content: req.body.content
      }).then(function () {
            res.render('admin/success', {
                  userInfo: req.userInfo,
                  message: '内容保存成功',
                  url: '/admin/content/edit?id=' + id
            })
      });

});
// 内容删除
router.get('/content/delete', function (req, res) {
      //获取要删除的分类的id
      var id = req.query.id || '';
      Content.remove({
            _id: id
      }).then(function () {
            res.render('admin/success', {
                  userInfo: req.userInfo,
                  message: '删除成功',
                  url: '/admin/content'
            });
      });

});
module.exports = router; 