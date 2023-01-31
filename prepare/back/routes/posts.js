const express = require("express");
const { Op } = require("sequelize");
const { Post, User, Image, Comment } = require("../models");
const router = express.Router();

router.get("/", async (req, res, next) => {
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

router.get("/related", async (req, res, next) => {
  try {
    const followings = await User.findAll({
      attributes: ["id"],
      include: [
        {
          model: User,
          as: "Followers",
          where: {
            id: req.user.id, // 누군가에게 내가 팔로워라는 것 == 내가 팔로잉중인 사람들
          },
        },
      ],
    });
    const where = {
      UserId: {
        [Op.in]: followings.map((v) => v.id), // Op.in: 조건에 부합하는. Op.notIn: 조건에 부합하지 않는.
      },
    };
    if (parseInt(req.query.lastId, 10)) {
      // 초기 로딩이 아닐 때(스크롤 내려서 포스트를 더 불러올 때)
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) }; // sql 서브 쿼리를 안다면 사용해도 됨. Sequelize.literal("sql 구문")
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
