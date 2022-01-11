const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

const port = 3000;

// urlencoded -> application/x-www-form-urlencoded 이렇게 된 데이터를 분석해서 가져올수있게 해줌
app.use(bodyParser.urlencoded({ extended: true }));
// application/json  json 타입으로 된거를 분석해서 가져올수있게해줌
app.use(bodyParser.json());
app.use(cookieParser());

const config = require("./config/key");

const mongoose = require("mongoose");
const { json } = require("body-parser");
mongoose
  .connect(config.mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //   useCreateIndex: true,
    //   useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/api/users/register", (req, res) => {
  // 회원가입할때 필요한 정보들을 client 에서 가져오면
  // 그것들을 데이터 베이스에 넣어준다.

  const user = new User(req.body);
  // body 안에는 json 형식 { id: "Hello", pw:'1233'}

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err }, console.log(err));
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  // 1. 요청된 이메일을 데이터베이스에 있는지 찾는다
  User.findOne({ email: req.body.email }, (err, userInfo) => {
    if (!userInfo) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없음",
      });
    }
    // 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
    userInfo.comparePassword(req.body.password, (err, isMatch) => {
      console.log("err", err);
      console.log("isMatch", isMatch);
      // console.log('emai;')
      console.log("emai", userInfo.email);
      console.log("body -> emai", req.body.email);
      console.log("body -> password", req.body.password);
      console.log("pw", userInfo.password);
      if (!isMatch) {
        return res.json({ loginSuccess: false, message: "Wrong Password" });
      }

      // 3. 비밀번호까지 같다면 token 을 생성
      userInfo.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장 -> 어디에? 쿠키, 로컬스토리지
        // 쿠키에 저장하려면 -> npm install cookie-parser --save
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

// Auth 기능 만들기
// auth -> middleware / endpoint 에 req를 받음 다음, 콜백 함수를 하기전에 하는거
app.get("/api/users/auth", auth, (req, res) => {
  // 여기까지 미들웨어를 통과해 왔다는 얘기는 authentication 이 true
  // true 한 정보를 클라이언트에 정보를 전달

  // role 1 admin    role 2 특정 부서 admin
  // 여기서 role 0 -> 일반유저      role 0 이 아니면 관리자
  res.status(
    200,
    json({
      _id: req.user._id,
      isAdim: req.user.role === 0 ? false : true,
      isAuth: true,
      emial: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image,
    })
  );
});

// logout route 만들기
app.get("/api/users/logout", auth, (req, res) => {
  console.log("req.user", req.user);
  // 로그아웃 하려는 유저를 데이터베이스에서 찾아서
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
  // 그 유저의 토큰을 지워준다
});

app.listen(port, () => console.log(`Example app listening on ${port}!`));

// mongodb+srv://Ria:<password>@nodeexpress-jwt-test.t77kt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

// npm install express --save
// npm install mongoose --save
// npm install body-parser --save
// npm install nodemon --save-dev
// npm install bcrypt --save
