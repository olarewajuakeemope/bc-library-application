var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fee: { type: String, required: true },
  isAdmin: { type: Boolean, required: true }
});

// Virtual for this user instance URL
UserSchema
  .virtual('url')
  .get(function() {
    return '/catalog/user/' + this._id
  });

//Export model
module.exports = mongoose.model('User', UserSchema);
