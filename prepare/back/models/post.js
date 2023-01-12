module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
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
