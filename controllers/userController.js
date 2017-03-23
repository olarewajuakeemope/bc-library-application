var User = require('../models/user')

var Book = require('../models/book')
var async = require('async')


// Display detail page for a specific Genre
exports.user_detail = function(req, res, next) {
  var curruser = 0;
  var errors = 0;
    var user;
    if(req.user){
       user = req.user;       
    }else{
       user = 0;
    }
  res.render('user_form', { title: 'Sign Up', user: user, errors: errors, curruser: curruser });

};

// Control Page Access
exports.user_access = function(req, res, next) {

    if(req.user){
       next();       
    }else{
       res.redirect('/catalog/user/login');;
    }

};

// Control Page Access
exports.user_admin = function(req, res, next) {

    if(req.user.isAdmin){
       next();       
    }else{
       res.send("<div><h2>You are not authorized to view this page</h2><p><a href='/'>Home</a></p></div>");
    }

};


// Display Genre create form on GET
exports.user_create_get = function(req, res, next) {
  var curruser = 0;
  var errors = 0;
    var user;
    if(req.user){
       user = req.user;      
    }else{
       user = 0;
    }
  res.render('user_form', { title: 'Sign Up', user: user, errors: errors, curruser: curruser });
};

// Handle Genre create on POST
exports.user_create_post = function(req, res, next) {
    var curruser = 0;
    var user;
    if(req.user){
       user = req.user;       
    }else{
       user = 0;
    }
  //Check that the name field is not empty
  req.checkBody('email', 'Email is required').notEmpty();

  //Trim and escape the name field.
  req.sanitize('email').escape();
  req.sanitize('email').trim();

  //Run the validators
  var errors = req.validationErrors();

  if (errors) {
    //If there are errors render the form again, passing the previously entered values and errors
    res.render('user_form', { title: 'Sign Up', errors: errors, user: user, curruser: curruser });
    return;
  } else {
    //Create a user object with escaped and trimmed data.
    var user = new User({
      email: req.body.email,
      password: req.body.password,
      fee: req.body.fee
    });

    user.isAdmin = req.originalUrl === '/catalog/user/create/admin';

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      //Genre saved. Redirect to genre detail page
      res.redirect('/catalog/user/login');
    });
  }
};

// Display Genre update form on GET
exports.user_login_get = function(req, res, next) {

  var curruser = 0;
  var errors = 0;
    var user;
    if(req.user){
       user = req.user;       
    }else{
       user = 0;
    }
  res.render('user_form', { title: 'Log in', errors: errors, user: user, curruser: curruser });

};

// Display Genre update form on GET
exports.user_logout_get = function(req, res, next) {

  req.logout();
  res.redirect('/');

};

exports.user_detail = function(req, res, next) {
    var user;
    if(req.user){
       user = req.user;       
    }else{
       user = 0;
    }
    User.findById(req.params.id)
    .exec(function (err, curruser) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('user_detail', { user: user, curruser:  curruser});
    })
};

exports.user_update_get = function(req, res, next) {
    var user;
    if(req.user){
       user = req.user;       
    }else{
       user = 0;
    }
  var errors = 0;

    req.sanitize('id').escape();
    req.sanitize('id').trim();
    User.findById(req.params.id, function(err, curruser) {
        if (err) { return next(err); }
        //On success
        console.log(curruser.isAdmin);
        res.render('user_form', { title: 'Update User', errors: errors, user: user, curruser: curruser });
    });
};

exports.user_update_post = function(req, res, next) {
    var user;
    if(req.user){
       user = req.user;       
    }else{
       user = 0;
    }

    var theUser = new User(
      { email: req.body.email,
        password: req.body.password,
        fee: req.body.fee,
        isAdmin: req.body.isAdmin,
        _id: req.params.id
       });

        // Data from form is valid
        User.findByIdAndUpdate(req.params.id, theUser, {}, function (err,theNewUser) {
            if (err) { return next(err); }
               //successful - redirect to genre detail page.
               res.redirect(theNewUser.url);
       });

};
