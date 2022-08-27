var express = require("express");
var router = express.Router();
var multer = require("multer");
const { populate } = require("../models/Post");
var upload = multer({ dest: "public/images/uploads/" }); // where the images saved location
var Post = require("../models/Post");
var Comment = require("../models/Comment");
var User = require("../models/User"); // this is step 34 /routes for follow features
var fs = require("fs");

var auth = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}; // creating auth to filter the situation whether comsumer is already login or not

/* GET users listing. */
router.get("/", auth, function (req, res, next) {
  Post.countDocuments({ author: req.session.user.id }, function (err, rtn) {
    if (err) throw err;
    Comment.countDocuments(
      { commenter: req.session.user.id },
      function (err2, rtn2) {
        if (err2) throw err2;

        Comment.countDocuments(
          { author: req.session.user.id },
          function (err3, rtn3) {
            if (err3) throw err3;
            User.findById(req.session.user.id)
              .select("favoriteB")
              .exec(function (err4, rtn4) {
                if (err4) throw err4;
                res.render("user/profile", {
                  postCount: rtn,
                  givecomment: rtn2,
                  getcomment: rtn3,
                  favBlogger: rtn4.favoriteB.length,
                });
              });
          }
        );
      }
    );
  });
});

router.get("/postadd", auth, function (req, res, next) {
  res.render("user/postadd"); // part of step 9
});

router.post("/postadd", auth, upload.single("photo"), function (req, res) {
  var post = new Post();
  post.title = req.body.title;
  post.content = req.body.content;
  post.author = req.session.user.id;
  post.created = Date.now();
  post.updated = Date.now();
  if (req.file) post.image = "/images/uploads/" + req.file.filename;
  post.save(function (err, rtn) {
    if (err) throw err;
    res.redirect("/"); // part of step 10
  });

  // console.log(req.body);
  // res.end("done done done mf wyne htet aung "); // this is part of step 10
});

router.get("/mypostlist", auth, function (req, res) {
  Post.find({ author: req.session.user.id })
    .populate("author")
    .exec(function (err, rtn) {
      if (err) throw err;
      res.render("user/postlist", { posts: rtn });
    });
}); // this is step 11   >>>>>> reedit the route file by step 12

// routes file for postdetail button
router.get("/postdetail/:id", auth, function (req, res) {
  Post.findById(req.params.id)
    .populate("author")
    .exec(function (err, rtn) {
      if (err) throw err;
      Comment.find({ post: req.params.id })
        .populate("commenter", "name")
        .select("commenter comment reply updated created")
        .exec(function (err2, rtn2) {
          if (err2) throw err2;
          res.render("user/postdetail", { post: rtn, comments: rtn2 });
        });
    });
}); // this is is step 12 about more detail button
// on clicking the more detail button, we can reach
// the editable post detail page that is written in the views/user/postdetail ;)

router.get("/postupdate/:id", auth, function (req, res) {
  Post.findById(req.params.id, function (err, rtn) {
    if (err) throw err;
    res.render("user/postupdate", { post: rtn });
  });
}); // creating postupdate page by step 13

router.post("/postupdate", auth, upload.single("photo"), function (req, res) {
  var update = {
    title: req.body.title,
    content: req.body.content,
    updated: Date.now(),
  };
  if (req.file) {
    Post.findById(req.body.id)
      .select("image")
      .exec(function (err2, rtn2) {
        if (err2) throw err2;
        fs.unlink("public" + rtn2.image, function (err) {
          if (err) throw err;
        });
      });
    update.image = "/images/uploads/" + req.file.filename;
  }
  Post.findByIdAndUpdate(req.body.id, { $set: update }, function (err, rtn) {
    if (err) throw err;
    res.redirect("/users/mypostlist");
  });
});

router.get("/postdelete/:id", auth, function (req, res) {
  Post.findByIdAndDelete(req.params.id, function (err, rtn) {
    if (err) throw err;
    Comment.deleteMany({ post: req.params.id }, function (err2, rtn2) {
      if (err2) throw err2;
      fs.unlink("public" + rtn.image, function (err) {
        if (err) throw err;
        res.redirect("/users/mypostlist");
      });
    });
  });
}); // this is step 14 >> more about delete buttoon

router.post("/givecomment", auth, function (req, res) {
  var comment = new Comment();
  comment.post = req.body.post;
  comment.author = req.body.author;
  comment.comment = req.body.comment;
  comment.commenter = req.session.user.id;
  comment.created = Date.now();
  comment.updated = Date.now();
  comment.save(function (err, rtn) {
    if (err) {
      res.json({
        status: "error",
      });
    } else {
      console.log(rtn);
      res.json({
        status: true,
      });
    }
  });
}); // this is step 24 ?// adding comment data to the database

router.post("/givereply", auth, function (req, res) {
  var update = {
    reply: req.body.reply,
    updated: Date.now(),
  };
  Comment.findByIdAndUpdate(
    req.body.cid,
    { $set: update },
    function (err, rtn) {
      if (err) {
        res.json({
          status: "error",
        });
      } else {
        res.json({
          status: true,
        });
      }
    }
  );
});

// route file for givelike features > this is step 31
router.post("/givelike", auth, function (req, res) {
  if (req.body.type === "like") {
    Post.findByIdAndUpdate(
      req.body.post,
      { $push: { like: { user: req.session.user.id } } },
      function (err, rtn) {
        if (err) {
          res.json({
            status: "error",
          });
        } else {
          res.json({
            status: true,
          });
        }
      }
    );
  } else {
    // this includes in step 32
    Post.findById(req.body.post, function (err, rtn) {
      if (err) {
        res.json({
          status: "error",
        });
      } else {
        var likelist = rtn.like.filter(function (data) {
          return data.user != req.session.user.id;
        });
        Post.findByIdAndUpdate(
          req.body.post,
          { $set: { like: likelist } },
          function (err2, rtn2) {
            if (err2) {
              res.json({
                status: "error",
              });
            } else {
              res.json({
                status: true,
              });
            }
          }
        );
      }
    });
  }
});

// now this is step 34
router.post("/followauthor", auth, function (req, res) {
  if (req.body.type == "follow") {
    User.findByIdAndUpdate(
      req.session.user.id,
      { $push: { favoriteB: { blogger: req.body.author } } },
      function (err, rtn) {
        if (err) {
          res.json({
            status: "error",
          });
        } else {
          console.log(rtn);
          res.json({
            status: true,
          });
        }
      }
    );
  } else {
    User.findById(req.session.user.id, function (err, rtn) {
      if (err) {
        res.json({
          status: "error",
        });
      } else {
        var bloggerlist = rtn.favoriteB.filter(function (data) {
          return data.blogger != req.body.author;
        });
        User.findByIdAndUpdate(
          req.session.user.id,
          { $set: { favoriteB: bloggerlist } },
          function (err2, rtn2) {
            if (err2) {
              res.json({
                status: "error",
              });
            } else {
              res.json({
                status: true,
              });
            }
          }
        );
      }
    });
  }
}); // this is step 34

router.get("/myfavbloglist", auth, function (req, res) {
  User.findById(req.session.user.id, function (err, rtn) {
    if (err) throw err;
    var favlist = [];
    rtn.favoriteB.forEach(function (element) {
      favlist.push(element.blogger);
    });
    Post.find({ author: { $in: favlist } })
      .populate("author", "name")
      .exec(function (err2, rtn2) {
        if (err2) throw err2;
        console.log(rtn2);
        res.render("user/myfavbloglist", { posts: rtn2 });
      });
  });
});

module.exports = router;
