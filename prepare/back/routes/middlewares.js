exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // isAuthenticated() : passport에서 제공
    next();
  } else {
    res.status(401).send("로그인되어있지 않습니다.");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send("로그인되지않은 사용자만 접근할 수 있습니다.");
  }
};
