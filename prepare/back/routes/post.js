const express = require("express");
const multer = require("multer");
const path = require("path");
const { Post, Comment, Image, User } = require("../models");
const { isLoggedIn } = require("./middlewares");
const fs = require("fs");

const router = express.Router();

try {
  fs.accessSync("uploads");
} catch (error) {
  console.log("uploads 폴더가 없으므로 새로 생성합니다");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    // 임시로 하드웨어에 저장
    destination(req, file, done) {
      done(null, "uploads");
    },
    filename(req, file, done) {
      // abc.png
      const ext = path.extname(file.originalname); // .png
      const basename = path.basename(file.originalname, ext); // abc

      done(null, basename + "_" + new Date().getTime() + ext); // abc120948123.png (덮어쓰기 방지)
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20mb
});

router.post("/", isLoggedIn, upload.none(), async (req, res) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    if (req.body.image) {
      if (Array.isArray(req.body.image)) {
        // 이미지 여러개 올리면 -> image: [abc.png, def.png]
        const images = await Promise.all(
          req.body.image.map((image) => Image.create({ src: image }))
        );
        await post.addImages(images);
      } else {
        // 이미지를 1개만 올리면 -> image: abc.png
        const image = await Image.create({ src: req.body.image });
        await post.addImages(image);
      }
    }
    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User, // 댓글 작성자
              attributes: ["id", "nickname"],
            },
          ],
        },
        {
          model: User, // 작성자
          attributes: ["id", "nickname"],
        },
        {
          model: User, // 좋아요 누른사람
          as: "Likers", // as 를 넣어줘야 위와 구분됨.
          attributes: ["id"],
        },
      ],
    });
    res.status(201).json(fullPost); // 프론트로 전달
  } catch (error) {
    console.error(error);
    next(error);
  }
});
router.post("/:postId/comment", isLoggedIn, async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId } });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    const comment = await Comment.create({
      content: req.body.content,
      PostId: parseInt(req.params.postId, 10),
      UserId: req.user.id,
    });
    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
      ],
    });
    res.status(201).json(fullComment); // 프론트로 전달
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post(
  "/images",
  isLoggedIn,
  upload.array("image"), // array - 다중이미지 업로드, single - 1개 이미지 업로드, fills - 다중이미지 여러개의 Input 태그로 업로드
  async (req, res, next) => {
    res.json(req.files.map((v) => v.filename));
  }
);
router.patch("/:postId/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId } });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    await post.addLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
  }
});
router.delete("/:postId/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId } });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    await post.removeLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
router.delete("/:postId", isLoggedIn, async (req, res, next) => {
  try {
    await Post.destroy({
      where: { id: req.params.postId, UserId: req.user.id },
    });
    res.status(200).json({ PostId: parseInt(req.params.postId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
