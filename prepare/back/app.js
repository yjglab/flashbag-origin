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

dotenv.config();
const app = express();
db.sequelize
  .sync()
  .then(() => {
    console.log("✅ DB 연결 성공");
  })
  .catch(console.error);

passportConfig();

app.use(morgan("dev"));
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
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/post", postRouter);
app.use("/posts", postsRouter);
app.use("/user", userRouter);
app.use("/hashtag", hashtagRouter);
app.listen(3065, () => {
  console.log("🌐 서버 실행중");
});
