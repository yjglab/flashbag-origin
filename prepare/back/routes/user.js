const express = require("express");
const { User, Post } = require("../models");
const bcrypt = require("bcrypt");
const passport = require("passport");
const db = require("../models");

const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const router = express.Router();

// 새로고침 시 로그인되어있으면 사용자 정보 불러오기
router.get("/", async (req, res, next) => {
  // console.log(req.headers)
  try {
    if (req.user) {
      const fullUserWithoutPassword = await User.findOne({
        where: { id: req.user.id },
        attributes: { exclude: ["password"] }, // password컬럼 제외하고 나머지 정보는 모두 가져옴
        include: [
          {
            model: Post,
            attributes: ["id"],
          },
          { model: User, as: "Followings", attributes: ["id"] },
          { model: User, as: "Followers", attributes: ["id"] },
        ],
      });
      res.status(200).json(fullUserWithoutPassword);
    } else {
      res.status(200).json(null);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 특정 사용자 정보 가져오기 (loadUser)
router.get("/:userId", async (req, res, next) => {
  try {
    const fullUserWithoutPassword = await User.findOne({
      where: { id: parseInt(req.params.userId, 10) },
      attributes: { exclude: ["password"] }, // password컬럼 제외하고 나머지 정보는 모두 가져옴
      include: [
        {
          model: Post,
          attributes: ["id"],
        },
        { model: User, as: "Followings", attributes: ["id"] },
        { model: User, as: "Followers", attributes: ["id"] },
      ],
    });
    if (fullUserWithoutPassword) {
      // 개인 정보 보호
      const data = fullUserWithoutPassword.toJSON();
      data.Posts = data.Posts.length;
      data.followers = data.followers.length;
      data.followings = data.followings.length;
      res.status(200).json(data);
    } else {
      res.status(404).json("존재하지 않는 사용자입니다.");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    // (서버 에러, 성공여부, 클라이언트에러)
    if (err) {
      // 서버 에러
      console.error(err);
      return next(err);
    }
    if (info) {
      // 클라이언트 에러
      return res.status(401).send(info.reason);
    }
    return req.logIn(user, async (loginErr) => {
      // req.logIn() -> 이후 passport/index.js의 serializeUser 동작
      if (loginErr) {
        // 거의 가능성 없지만 혹시나 로그인 에러가 나면
        console.error(loginErr);
        return next(loginErr);
      }
      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: { exclude: ["password"] }, // password컬럼 제외하고 나머지 정보는 모두 가져옴
        include: [
          {
            model: Post, // me.Posts로 접근 가능 (hasMany관계)
            attributes: ["id"],
          },
          { model: User, as: "Followings", attributes: ["id"] },
          { model: User, as: "Followers", attributes: ["id"] },
        ],
      });
      return res.status(200).json(fullUserWithoutPassword); // user 정보 프론트로 전송
    });
  })(req, res, next);
}); // 전략 실행
router.post("/", isNotLoggedIn, async (req, res, next) => {
  try {
    const exUser = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (exUser) {
      return res.status(403).send("이미 사용중인 아이디입니다."); // saga의 err.response.data
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 11);
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });

    res.status(201).send("ok");
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

router.post("/logout", (req, res, next) => {
  req.logout(() => {
    res.redirect("/");
  });
});

router.patch("/nickname", isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      {
        nickname: req.body.nickname,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );
    res.status(200).json({ nickname: req.body.nickname });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch("/:userId/follow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send("[팔로우 실패]:존재하지 않는 사용자입니다.");
    }
    await user.addFollowers(req.user.id); // 가급적 복수로
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:userId/follow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send("[팔로우 취소 실패]:존재하지 않는 사용자입니다.");
    }
    await user.removeFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/follower/:userId", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send("[팔로우 차단 실패]:존재하지 않는 사용자입니다.");
    }
    await user.removeFollowings(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/followers", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(403).send("존재하지 않는 사용자입니다.");
    }
    const followers = await user.getFollowers();
    res.status(200).json(followers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/followings", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(403).send("존재하지 않는 사용자입니다.");
    }
    const followings = await user.getFollowings();
    res.status(200).json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
