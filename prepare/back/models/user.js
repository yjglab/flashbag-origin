module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      // mysql에서는 users로 생성됨.
      // id는 기본적으로 들어있다.
      email: {
        type: DataTypes.STRING(50),
        allowNull: false, // false: 필수
        unique: true, // 고유값(중복되지 않음)
      },
      nickname: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci", // 한글 저장
    }
  );
  User.associate = (db) => {
    db.User.hasMany(db.Post); // 1:다 관계
    db.User.hasMany(db.Comment);
    db.User.belongsToMany(db.Post, { through: "Like", as: "Liked" }); // 여기서 as: 내가 좋아요 누른 게시물들
    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followers",
      foreignKey: "FollowingId", // 반대로 생각해야
    });
    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followings",
      foreignKey: "FollowerId",
    });
  };
  return User;
};

/*
belongsToMany(다:다) 관계는 임의의 테이블이 하나 생성됨.
through: 중간 테이블명이며 넣어주어야 함.
as: 동일한 테이블의 다른 관계와 구분하기 위한 별칭. as값이 Apples라면 user.getApples로 값을 불러올 수 있음

서로 동일한 테이블로 두개의 동일한 관계가 나오는 경우 foreign key 사용

*/
