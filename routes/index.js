var express = require('express');
const Post = require('../models/Post');
var router = express.Router();
var User = require("../models/User"); //>> step3>>  using models in index to active model and use it
var Comment = require("../models/Comment"); // this is step 26
/* GET home page. */
router.get('/', function(req, res, next) {
  Post.find({})
  .sort({ like: -1})
  .limit(5)
  .populate("author", "name")
  .exec(function(err, rtn){
    if (err) throw err;
    res.render('index', { posts: rtn });
  });
});


router.get("/register", function(req,res){
  res.render("register");   // I think get method is used to show page
});

router.post("/register",function(req,res){
//  console.log(req.body);
 // res.end("Done Done Done and check the terminal again mf bro");
  var user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.save(function (err,rtn){
    if(err) throw err;
    console.log(rtn);
    res.redirect("/"); // but post method is used to data and carry to a new page
  });
});

router.get("/login", function(req,res){
  res.render('login');
});

router.post("/login", function(req,res){
  User.findOne({ email: req.body.email }, function(err, rtn){
    if (err) throw err;
    if (rtn != null && User.compare(req.body.password, rtn.password)){
      req.session.user = {//
        id: rtn._id,
        name: rtn.name,
        email : rtn.email,  //use the data value to store in the locals
      };                   // this is part of step 7
      res.redirect("/users");
    }else {
      res.redirect("/login");
    }
  });
});

router.post("/duplicateEmail", function(req,res){
  User.findOne({email: req.body.email }, function(err,rtn){
    if (err){
      res.json({
        status: "error",
        error: err,
      });
    }else {
      res.json({
        status : rtn != null ? true: false,
      });
    }
  });
});

router.get('/logout', function(req,res){
  req.session.destroy(function (err){
    if (err) throw err;
    res.redirect("/");
  });
});     // this is step 8 // from login satuation to logout page



router.get("/allpost", function(req,res){
  //res.render("allpost"); // this is step 17 // routes for all post in the index.sh
  Post.find({}).populate("author", "name").exec (function(err,rtn){
    if (err) throw err; // populate is step 19
    console.log(rtn);
    res.render("allpost", {posts : rtn});
    //this is step 18 d>> decoarting the allpost features
  });
}); 

router.get("/postdetail/:id", function(req,res){
  Post.findById(req.params.id).populate("author", "name").exec(function (err,rtn){
    if (err) throw err;
    Comment.find({ post: req.params.id})
    .populate("commenter", "name")
    .select("commenter comment reply created updated")
    .exec(function (err2,rtn2){
      if (err2) throw err2;
      console.log(rtn2);
      let reactStatus;
      let favStatus; // part of step 34
      if (req.session.user){
        reactStatus = rtn.like.filter(function (data){
          return data.user = req.session.user.id;

        });
        User.findById(req.session.user.id, function (err3,rtn3){
          if (err3) {
            res.json({
              status : 'error',
            });
          }else {
            favStatus = rtn3.favoriteB.filter(function (data){
              return data.blogger == rtn.author._id.toString();
            });
            res.render('postdetail',
             {post: rtn,
              comments : rtn2,
               reactStatus:reactStatus,
               favStatus : favStatus,
              });
          }
        });
       
      }else {
        reactStatus = [];
        favStatus = [];
        res.render('postdetail',
         {post: rtn, comments : rtn2,
           reactStatus: reactStatus,
           favStatus : favStatus,
          }); // this changes include in step 32
      }
      
    }); // this is step 26  .select features include
    
  });
});  // this is step 20


// to add data to database , use mongoose
module.exports = router;
