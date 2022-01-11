const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
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

userSchema.methods.comparePassword = function (plainPassword, callback) {
  // plainPassword -> 123455
  // hashedPassword ->
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

userSchema.methods.generateToken = function (callBack) {
  var user = this;
  console.log("user._id", user._id);

  // jsonwebtoken 을 이용해서 token 을 생성하기
  var token = jwt.sign(user._id.toHexString(), "secretToken");

  // token = user._id + 'secretToken'
  user.token = token;
  user.save(function (err, user) {
    // 에러가 있으면 콜백 함수로 에러를 리턴
    if (err) return callBack(err);
    // 만약에 잘 되면 에러는 없고 유저 정보만 전달
    callBack(null, user);
  });
};

userSchema.statics.findByToken = function (token, callBack) {
  var user = this;

  // user._id + '' = token
  // 토큰은 decode 한다
  // decodedToken = user Id
  jwt.verify(token, "secretToken", function (err, decodedToken) {
    // user id 를 이용해서 유저를 찾은 다음에
    // 클라이언트에서 가져온 token과 db에 보관된 토큰이 일치하는지 확인
    user.findOne({ _id: decodedToken, token: token }, function (err, user) {
      if (err) return callBack(err);
      callBack(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
