const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const postRouter = require("./routes/post");
const postsRouter = require("./routes/posts");
const userRouter = require("./routes/user");
const hashtagRouter = require("./routes/hashtag");
const db = require("./models");
const morgan = require("morgan");
const cors = require("cors");
const passportConfig = require("./passport");
const passport = require("passport");
const path = require("path");
const hpp = require("hpp");
const helmet = require("helmet");

dotenv.config();
const app = express();
db.sequelize
  .sync()
  .then(() => {
    console.log("✅ DB 연결 성공");
  })
  .catch(console.error);

passportConfig();

let PORT;
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined")); // 자세히
  app.use(hpp()); // 보안용 패키지
  app.use(helmet()); // 보안용 패키지
  PORT = 3065;
} else {
  app.use(morgan("dev"));
  PORT = 3065;
}

app.use(
  cors({
    origin: true,
    credentials: true, // 도메인간 쿠키 공유
  })
);
app.use("/", express.static(path.join(__dirname, "uploads"))); // localhost:3065/uploads
app.use(express.json()); // req.body 사용 위함, axios 처리
app.use(express.urlencoded({ extended: true })); // req.body 사용 위함, 일반 form data 처리
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false, // https 적용시 true
      domain: process.env.NODE_ENV === "production" && ".flashbag.site", // api.flashbag.site와 flashbag.site의 cookie 공유
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/post", postRouter);
app.use("/posts", postsRouter);
app.use("/user", userRouter);
app.use("/hashtag", hashtagRouter);
app.listen(PORT, () => {
  console.log("🌐 서버 실행중");
});
