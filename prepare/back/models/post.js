const DataTypes = require("sequelize");
const { Model } = DataTypes;

module.exports = class Post extends Model {
  static init(sequelize) {
    return super.init(
      {
        // id가 기본적으로 들어있다.
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        // UserId
        // RetweetId
      },
      {
        modelName: "Post",
        tableName: "posts",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci", // 이모티콘 저장
        sequelize,
      }
    );
  }
  static associate(db) {
    db.Post.belongsTo(db.User); // 어떤 게시글은 반드시 하나의 User에게 속해있다.
    db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
    db.Post.hasMany(db.Comment); // 1:다 관계
    db.Post.hasMany(db.Image);
    db.Post.belongsToMany(db.User, { through: "Like", as: "Likers" }); // 중간 테이블 명을 Like로, as는 별칭
    db.Post.belongsTo(db.Post, { as: "Retweet" });
  }
};

/*
sequelize가 생성해주는 함수들
(hasMany, belongsToMany는 복수이므로 s가 붙음)
ex) db.First.belongsTo(db.Second)

obj.addSecond
obj.removeSecond
obj.getSecond
obj.setSecond (수정)

db 조작시 항상 await 사용하기.
*/

/*
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // UserId
      // RetweetId
    },
    {
      charset: "utf8mb4", // mb4 -> 이모티콘까지
      collate: "utf8mb4_general_ci",
    }
  );
  Post.associate = (db) => {
    db.Post.belongsTo(db.User); // 어떤 게시글은 반드시 하나의 User에게 속해있다.
    db.Post.hasMany(db.Comment); // 1:다 관계
    db.Post.hasMany(db.Image);
    db.Post.belongsToMany(db.Hashtag, { through: "PostHasgtag" });
    db.Post.belongsToMany(db.User, { through: "Like", as: "Likers" }); // 중간 테이블 명을 Like로, as는 별칭
    db.Post.belongsTo(db.Post, { as: "Retweet" });
  };
  return Post;
};
*/
