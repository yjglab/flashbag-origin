const express = require("express");
const multer = require("multer");
const path = require("path");
const { Post, Comment, Image, User, Hashtag } = require("../models");
const { isLoggedIn } = require("./middlewares");
const fs = require("fs");
const multerS3 = require("multer-s3"); // multer -> s3 스토리지 연결용
const AWS = require("aws-sdk"); // node -> aws 접근권한 부여용

const router = express.Router();

try {
  fs.accessSync("uploads");
} catch (error) {
  console.log("uploads 폴더가 없으므로 새로 생성합니다");
  fs.mkdirSync("uploads");
}

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});
const upload = multer({
  storage:
    process.env.NODE_ENV === "production"
      ? multerS3({
          s3: new AWS.S3(),
          bucket: "flashbag-origin",
          key(req, file, cb) {
            cb(
              null,
              `original/${Date.now()}_${encodeURIComponent(
                path.basename(file.originalname)
              )}`
            );
          },
        })
      : multer.diskStorage({
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

router.post("/", isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    const hashtags = req.body.content.match(/#[^/\s]+/g);
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) =>
          Hashtag.findOrCreate({ where: { name: tag.slice(1).toLowerCase() } })
        ) // 있으면 가져오고 없으면 만드는 함수. find는 여기서 사용안함
      );
      await post.addHashtags(result.map((v) => v[0]));
      // findOrCreate의 결과는 [[#abc, true], [#dbc, true]] 형식이므로 앞의 것만 저장
    }
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

router.get("/:postId", async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (!post) {
      return res.status(404).send("존재하지 않는 게시글입니다.");
    }

    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: Post,
          as: "Retweet",
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
            {
              model: Image,
            },
          ],
        },
        {
          model: User,
          attributes: ["id", "nickname"],
        },
        {
          model: User,
          as: "Likers",
          attributes: ["id"],
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
          ],
        },
      ],
    });
    res.status(200).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/:postId/retweet", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
      include: [
        {
          model: Post,
          as: "Retweet",
        },
      ],
    });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    if (
      req.user.id === post.UserId ||
      (post.Retweet && post.Retweet.UserId === req.user.id)
    ) {
      // 자신의 글을 리트윗 하는 경우 || 남이 내글을 리트윗한것을 내가 다시 리트윗하는 경우
      return res.status(403).send("자신의 글을 리플래시할 수 없습니다.");
    }
    const retweetTargetId = post.RetweetId || post.id;
    const exPost = await Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      },
    });
    if (exPost) {
      return res.status(403).send("이미 리플래시된 글입니다.");
    }
    const retweet = await Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId,
      content: "retweet",
    });
    const retweetWithPrevPost = await Post.findOne({
      where: { id: retweet.id },
      include: [
        {
          model: Post,
          as: "Retweet",
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
            {
              model: Image,
            },
          ],
        },
        {
          model: User,
          attributes: ["id", "nickname"],
        },
        {
          model: User,
          as: "Likers",
          attributes: ["id"],
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
          ],
        },
      ],
    });
    res.status(201).json(retweetWithPrevPost); // 프론트로 전달
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
    res.json(
      req.files.map((v) =>
        process.env.NODE_ENV === "production"
          ? v.location.replace(/\/original\//, "/thumb/")
          : v.filename
      )
    );
    // S3에서는 v.location으로 사용. 원래는 v.filename.
    // v.location에 S3 스토리지 주소가 들어있음.
    // 이미지 받는 라우터에서 우선 lambda 함수로 압축된 이미지가 들어있는 thumb폴더로 변경
  }
);
router.patch("/:postId/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId } });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    await post.addLikers(req.user.id); // db 조작시 항상 await 사용하기.
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
    await post.removeLikers(req.user.id); // db 조작시 항상 await 사용하기.
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch("/:postId", isLoggedIn, async (req, res, next) => {
  const hashtags = req.body.content.match(/#[^/\s]+/g); // 해시태그가 수정되었을 수 있으므로
  try {
    await Post.update(
      {
        content: req.body.content,
      },
      {
        where: {
          id: req.params.postId,
          UserId: req.user.id,
        },
      }
    ); // update는 수행 후 객체를 돌려주지 않음.
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
      },
    });
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) =>
          Hashtag.findOrCreate({ where: { name: tag.slice(1).toLowerCase() } })
        )
      );
      await post.setHashtags(result.map((v) => v[0])); // setHashtags로 기존에 저장된 해시태그 제거하고 새로 배치.
    }
    res.status(200).json({
      PostId: parseInt(req.params.postId, 10),
      content: req.body.content,
    });
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
