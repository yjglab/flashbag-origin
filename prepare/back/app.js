const express = require("express");
const postRouter = require("./routes/post");
const db = require("./models");
const app = express();

db.sequelize
  .sync()
  .then(() => {
    console.log("✅ DB 연결 성공");
  })
  .catch(console.error);

app.get("/", (req, res) => {
  res.send("ff");
});
app.get("/", (req, res) => {
  res.send("api");
});
app.get("/posts", (req, res) => {
  res.json([
    { id: 1, content: "heeo" },
    { id: 2, content: "fffd" },
    { id: 3, content: "eeed" },
  ]);
});
app.use("/post", postRouter);
app.listen(3065, () => {
  console.log("🌐  서버 실행중");
});
