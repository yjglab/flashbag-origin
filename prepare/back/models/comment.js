const DataTypes = require("sequelize");
const { Model } = DataTypes;

module.exports = class Comment extends Model {
  static init(sequelize) {
    return super.init(
      {
        // id 기본적으로 들어있음.
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        // UserId: 1, (어떤 유저의 댓글인가)
        // PostId: 3, (어떤 글의 댓글인가)
      },
      {
        modelName: "Comment",
        tableName: "comments",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci", // 이모티콘 저장
        sequelize,
      }
    );
  }

  static associate(db) {
    db.Comment.belongsTo(db.User);
    db.Comment.belongsTo(db.Post);
  }
};
/*
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // belongsTo는 다음의 컬럼을 자동으로 생성함. 별칭을 쓸 경우 별칭+Id로 생성함.
      // UserId: 1, (어떤 유저의 댓글인가)
      // PostId: 3, (어떤 글의 댓글인가)
    },
    {
      charset: "utf8mb4", // mb4 -> 이모티콘까지
      collate: "utf8mb4_general_ci",
    }
  );
  Comment.associate = (db) => {
    db.Comment.belongsTo(db.User);
    db.Comment.belongsTo(db.Post);
  };
  return Comment;
};
*/
