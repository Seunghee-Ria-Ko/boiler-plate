const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

const { User } = require("./models/User");

// urlencoded -> application/x-www-form-urlencoded 이렇게 된 데이터를 분석해서 가져올수있게 해줌
app.use(bodyParser.urlencoded({ extended: true }));
// application/json  json 타입으로 된거를 분석해서 가져올수있게해줌
app.use(bodyParser.json());
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

app.post("/register", (req, res) => {
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

app.post("/login", (req, res) => {
  // 1. 요청된 이메일을 데이터베이스에 있는지 찾는다
  User.findOne({ email: req.body.email }, (err, userInfo) => {
    if (!userInfo) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없음",
      });
    }
    // 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({ loginSuccess: false, message: "Wrong Password" });
      }

      // 3. 비밀번호까지 같다면 token 을 생성
      user.generateToken((err, user) => {});
    });
  });
});

app.listen(port, () => console.log(`Example app listening on ${port}!`));

// mongodb+srv://Ria:<password>@nodeexpress-jwt-test.t77kt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

// npm install express --save
// npm install mongoose --save
// npm install body-parser --save
// npm install nodemon --save-dev
// npm install bcrypt --save
