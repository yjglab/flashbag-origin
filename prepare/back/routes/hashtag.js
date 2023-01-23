const express = require("express");
const { Op } = require("sequelize");
const { Post, Hashtag, User, Image, Comment } = require("../models");
const router = express.Router();

// 특정 사용자의 게시글 모두 // GET /hashtag/해시태그명
router.get("/:id", async (req, res, next) => {
  try {
    const where = {};
    if (parseInt(req.query.lastId, 10)) {
      // 초기 로딩이 아닐 때(스크롤 내려서 포스트를 더 불러올 때)
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) }; // lastId보다 작은
    } // 쿼리스트링으로 받았으므로 req.query에 들어있음
    const posts = await Post.findAll({
      where,
      limit: 10,
      order: [
        ["createdAt", "DESC"],
        [Comment, "createdAt", "DESC"],
      ],
      include: [
        {
          model: Hashtag,
          where: { name: decodeURIComponent(req.params.id) },
        },
        {
          model: User,
          attributes: ["id", "nickname"],
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: [{ model: User, attributes: ["id", "nickname"] }],
        },
        {
          model: User, // 좋아요 누른사람
          as: "Likers", // as 를 넣어줘야 위와 구분됨.
          attributes: ["id"],
        },
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
      ],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
