var Book = require('../models/book')
var Author = require('../models/author')
var Genre = require('../models/genre')
var BookInstance = require('../models/bookinstance')

var async = require('async')

exports.index = function(req, res) {

  async.parallel({
    book_count: function(callback) {
      Book.count(callback)
    },
    book_instance_count: function(callback) {
      BookInstance.count(callback)
    },
    book_instance_available_count: function(callback) {
      BookInstance.count({ status: 'Available' }, callback)
    },
    author_count: function(callback) {
      Author.count(callback)
    },
    genre_count: function(callback) {
      Genre.count(callback)
    },
    book_list: function(callback) {
      Book.find({}, 'title author summary')
        .populate('author')
        .exec(callback)
    },
  }, function(err, results) {
    var user;
    if (req.user) {
      user = req.user;
    } else {
      user = 0;
    }
    res.render('index', { title: 'Local Library Home', error: err, data: results, user: user });
  });
};


// Display list of all books
exports.book_list = function(req, res, next) {
  var user;
  if (req.user) {
    user = req.user;
  } else {
    user = 0;
  }
  Book.find({}, 'title author ')
    .populate('author')
    .exec(function(err, list_books) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('book_list', { title: 'Book List', book_list: list_books, user: user });
    })

};

// Display detail page for a specific book
exports.book_detail = function(req, res, next) {

  async.parallel({
    book: function(callback) {

      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback)
    },
    book_instance: function(callback) {

      BookInstance.find({ 'book': req.params.id })
        .populate('imprint')
        .exec(callback)
    },
  }, function(err, results) {
    var user;
    if (req.user) {
      user = req.user;
    } else {
      user = 0;
    }
    if (err) {
      return next(err);
    }
    //Successful, so render
    res.render('book_detail', { title: 'Title', user: user, book: results.book, book_instances: results.book_instance });
  });

};

// Display book create form on GET
exports.book_create_get = function(req, res, next) {

  var book = 0;
  var errors = 0;

  //Get all authors and genres, which we can use for adding to our book.
  async.parallel({
    authors: function(callback) {
      Author.find(callback)
    },
    genres: function(callback) {
      Genre.find(callback)
    },
  }, function(err, results) {
    var user;
    if (req.user) {
      user = req.user;
    } else {
      user = 0;
    }
    if (err) {
      return next(err);
    }
    res.render('book_form', { title: 'Create Book', user: user, authors: results.authors, genres: results.genres, book: book, errors: errors });
  });

};

// Handle book create on POST
exports.book_create_post = function(req, res, next) {

  req.checkBody('title', 'Title must not be empty.').notEmpty();
  req.checkBody('author', 'Author must not be empty').notEmpty();
  req.checkBody('summary', 'Summary must not be empty').notEmpty();
  req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

  req.sanitize('title').escape();
  req.sanitize('author').escape();
  req.sanitize('summary').escape();
  req.sanitize('isbn').escape();
  req.sanitize('title').trim();
  req.sanitize('author').trim();
  req.sanitize('summary').trim();
  req.sanitize('isbn').trim();
  req.sanitize('genre').escape();

  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre.split(",")
  });

  console.log('BOOK: ' + book);

  var errors = req.validationErrors();
  if (errors) {
    // Some problems so we need to re-render our book
    console.log('GENRE: ' + req.body.genre);

    console.log('ERRORS: ' + errors);
    //Get all authors and genres for form
    async.parallel({
      authors: function(callback) {
        Author.find(callback)
      },
      genres: function(callback) {
        Genre.find(callback)
      },
    }, function(err, results) {
      var user;
      if (req.user) {
        user = req.user;
      } else {
        user = 0;
      }
      if (err) {
        return next(err);
      }

      // Mark our selected genres as checked
      for (i = 0; i < results.genres.length; i++) {
        if (book.genre.indexOf(results.genres[i]._id) > -1) {
          //console.log('IS_IN_GENRES: '+results.genres[i].name);
          results.genres[i].checked = true;
          //console.log('ADDED: '+results.genres[i]);
        } else {
          results.genres[i].checked = false;
        }
      }

      res.render('book_form', { title: 'Create Book', user: user, authors: results.authors, genres: results.genres, book: book, errors: errors });
    });

  } else {
    // Data from form is valid.
    // We could check if book exists already, but lets just save.

    book.save(function(err) {
      if (err) {
        return next(err);
      }
      //successful - redirect to new book record.
      res.redirect(book.url);
    });
  }

};

// Display book delete form on GET
exports.book_delete_get = function(req, res, next) {

  async.parallel({
    book: function(callback) {
      Book.findById(req.params.id).populate('author').populate('genre').exec(callback)
    },
    book_bookinstances: function(callback) {
      BookInstance.find({ 'book': req.params.id }).exec(callback)
    },
  }, function(err, results) {
    var user;
    if (req.user) {
      user = req.user;
    } else {
      user = 0;
    }
    if (err) {
      return next(err);
    }
    //Successful, so render
    res.render('book_delete', { title: 'Delete Book', user: user, book: results.book, book_instances: results.book_bookinstances });
  });

};

// Handle book delete on POST
exports.book_delete_post = function(req, res, next) {

  //Assume the post will have id (ie no checking or sanitisation).
  async.parallel({
    book: function(callback) {
      Book.findById(req.params.id).populate('author').populate('genre').exec(callback)
    },
    book_bookinstances: function(callback) {
      BookInstance.find({ 'book': req.params.id }).exec(callback)
    },
  }, function(err, results) {
    var user;
    if (req.user) {
      user = req.user;
    } else {
      user = 0;
    }
    if (err) {
      return next(err);
    }
    //Success
    if (results.book_bookinstances > 0) {
      //Book has book_instances. Render in same way as for GET route.
      res.render('book_delete', { title: 'Delete Book', user: user, book: results.book, book_instances: results.book_bookinstances });
      return;
    } else {
      //Book has no bookinstances. Delete object and redirect to the list of books.
      Book.findByIdAndRemove(req.body.id, function deleteBook(err) {
        if (err) {
          return next(err);
        }
        //Success - got to books list
        res.redirect('/catalog/books')
      })

    }
  });

};

// Display book update form on GET
exports.book_update_get = function(req, res, next) {

  var errors = 0;
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  //Get book, authors and genres for form
  async.parallel({
    book: function(callback) {
      Book.findById(req.params.id).populate('author').populate('genre').exec(callback)
    },
    authors: function(callback) {
      Author.find(callback)
    },
    genres: function(callback) {
      Genre.find(callback)
    },
  }, function(err, results) {
    var user;
    if (req.user) {
      user = req.user;
    } else {
      user = 0;
    }
    if (err) {
      return next(err);
    }

    // Mark our selected genres as checked
    for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
      for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
        if (results.genres[all_g_iter]._id.toString() == results.book.genre[book_g_iter]._id.toString()) {
          results.genres[all_g_iter].checked = true;
        } else {
          results.genres[all_g_iter].checked = false;
        }
      }
    }
    res.render('book_form', { title: 'Update Book', user: user, authors: results.authors, genres: results.genres, book: results.book, errors: errors });
  });

};

// Handle book update on POST
exports.book_update_post = function(req, res, next) {
  //Sanitize id passed in.
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  //Check other data
  req.checkBody('title', 'Title must not be empty.').notEmpty();
  req.checkBody('author', 'Author must not be empty').notEmpty();
  req.checkBody('summary', 'Summary must not be empty').notEmpty();
  req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

  req.sanitize('title').escape();
  req.sanitize('author').escape();
  req.sanitize('summary').escape();
  req.sanitize('isbn').escape();
  req.sanitize('title').trim();
  req.sanitize('author').trim();
  req.sanitize('summary').trim();
  req.sanitize('isbn').trim();
  req.sanitize('genre').escape();

  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre.split(","),
    _id: req.params.id //This is required, or a new ID will be assigned!
  });

  var errors = req.validationErrors();
  if (errors) {
    // Re-render book with error information
    // Get all authors and genres for form
    async.parallel({
      authors: function(callback) {
        Author.find(callback)
      },
      genres: function(callback) {
        Genre.find(callback)
      },
    }, function(err, results) {
      var user;
      if (req.user) {
        user = req.user;
      } else {
        user = 0;
      }
      if (err) {
        return next(err);
      }

      // Mark our selected genres as checked
      for (i = 0; i < results.genres.length; i++) {
        if (book.genre.indexOf(results.genres[i]._id) > -1) {
          results.genres[i].checked = true;
        } else {
          results.genres[i].checked = false;
        }
      }
      res.render('book_form', { title: 'Update Book', user: user, authors: results.authors, genres: results.genres, book: book, errors: errors });
    });

  } else {
    // Data from form is valid. Update the record.
    Book.findByIdAndUpdate(req.params.id, book, {}, function(err, thebook) {
      if (err) {
        return next(err);
      }
      //successful - redirect to book detail page.
      res.redirect(thebook.url);
    });
  }

};


// Display book borrow form on GET
exports.book_borrow_get = function(req, res, next) {
  var user;
  var curruser = 0;
  var errors = 0;
  var url = "/catalog/book/" + req.params.id;
  if (req.user) {
    user = req.user;
  } else {
    user = 0;
    res.redirect('/catalog/user/login');
  }

  //Book borrowed for & days object
  var bookinstance = new BookInstance({
    book: req.params.id,
    imprint: req.user._id,
    status: "Loaned",
    due_back: Date.now() + 604800000
  });

  Book.findById(req.params.id).exec(function(err, book) {
    if (book.isbn == 0) {
      var err = new Error('Not Found');
      res.send("<h2 style='text-align: center;'>There are no copies of this book in the library at the moment</h2><p style='text-align: center;'><a href='" + book.url + "'>Go Back</a></p>");
      next(err);
    }
    if (err) {
      return next(err);
    }
    var thebook = new Book({
      title: book.title,
      author: book.author,
      summary: book.summary,
      isbn: book.isbn - 1,
      genre: book.genre,
      _id: req.params.id //This is required, or a new ID will be assigned!
    });
    //Book borrowed for & days object
    bookinstance.save(function(err) {
    if (err) {
      return next(err);
    }
    console.log("created new instance")
  });

    Book.findByIdAndUpdate(req.params.id, thebook, {}, function(err, newbook) {
      if (err) {
        return next(err);
      }
      //successful - redirect to book detail page.
      res.redirect(newbook.url);
    });
  })

};
