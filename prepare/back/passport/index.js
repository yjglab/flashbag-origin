const passport = require("passport");
const local = require("./local");
const { User } = require("../models");

module.exports = () => {
  // 세션에 첫 저장 (id값만 저장)
  passport.serializeUser((user, done) => {
    done(null, user.id); // (서버에러, 성공여부)
  });

  // 세션에 저장한 정보 복원 (id값만 이용해서)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ where: { id } });
      done(null, user); // req.user
    } catch (error) {
      console.error(error);
      done(error);
    }
  });

  local();
};
