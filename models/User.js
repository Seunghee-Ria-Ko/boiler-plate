const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
// salt 를 먼저  생성 ->  salt 를 이용해서 비밀번호를 암호화 해야함
// saltrouns = 10 -> 열자리 salt 를 만듬

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

// 저장하기전에
userSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified("password")) {
    // 비밀번호를 암호화 시킴
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);

        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cbFunction) {
  // plainPassword -> 123455
  // hashedPassword ->
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cbFunction(err), cbFunction(null, isMatch);
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
