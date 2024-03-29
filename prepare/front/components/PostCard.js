import { Avatar, Button, Card, Comment, List, Popover } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import {
  EllipsisOutlined,
  HeartOutlined,
  HeartTwoTone,
  MessageOutlined,
  RetweetOutlined,
} from "@ant-design/icons";

import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import PostImages from "./PostImages";
import CommentForm from "./CommentForm";
import PostCardContent from "./PostCardContent";
import {
  LIKE_POST_REQUEST,
  REMOVE_POST_REQUEST,
  UNLIKE_POST_REQUEST,
  RETWEET_REQUEST,
  UPDATE_POST_REQUEST,
} from "../reducers/post";
import FollowButton from "./FollowButton";
import Link from "next/link";
import styled from "styled-components";

import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

const Postcard = styled(Card)`
  .ant-card-meta {
    width: 100%;
  }
`;
const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { removePostLoading } = useSelector((state) => state.post);
  const id = useSelector((state) => state.user.me?.id);

  const [commentFormOpened, setCommentFormOpened] = useState(false);

  const onLike = useCallback(() => {
    if (!id) {
      return alert("로그인이 필요합니다.");
    }
    return dispatch({
      type: LIKE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);
  const onUnlike = useCallback(() => {
    if (!id) {
      return alert("로그인이 필요합니다.");
    }
    return dispatch({
      type: UNLIKE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);
  const onToggleComment = useCallback(() => {
    setCommentFormOpened((prev) => !prev);
  });
  const onRemovePost = useCallback(() => {
    if (!id) {
      return alert("로그인이 필요합니다.");
    }
    return dispatch({
      type: REMOVE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);

  const liked = post.Likers.find((v) => v.id === id);

  const onRetweet = useCallback(() => {
    if (!id) {
      return alert("로그인이 필요합니다.");
    }
    return dispatch({
      type: RETWEET_REQUEST,
      data: post.id,
    });
  }, [id]);

  const [updatePostMode, setUpdatePostMode] = useState(false);
  const onUpdatePostMode = useCallback(() => {
    setUpdatePostMode(true);
  }, []);
  const onCloseUpdatePostMode = useCallback(() => {
    setUpdatePostMode(false);
  }, []);
  const onUpdatePost = useCallback(
    (editText) => () => {
      if (!editText) {
        alert("빈 게시글로 수정할 수 없습니다.");
        return;
      } else {
        dispatch({
          type: UPDATE_POST_REQUEST,
          data: {
            PostId: post.id,
            content: editText,
          },
        });
      }
    },
    [post]
  );

  const onReport = useCallback(
    (nickname, postId) => () => {
      if (id) {
        alert(`${nickname}님의 ${postId}번 게시글이 신고되었습니다.`);
      } else {
        alert("로그인이 필요합니다.");
      }
    },
    [id]
  );
  return (
    <div style={{ marginBottom: 20 }}>
      <Postcard
        cover={post.Images[0] && <PostImages images={post.Images} />}
        actions={[
          <RetweetOutlined key="retweet" onClick={onRetweet} />,
          liked ? (
            <HeartTwoTone
              twoToneColor="tomato"
              key="heart"
              onClick={onUnlike}
            />
          ) : (
            <HeartOutlined key="heart" onClick={onLike} />
          ),

          <MessageOutlined key="comment" onClick={onToggleComment} />,
          <Popover
            key="more"
            content={
              <Button.Group>
                {id && post.User.id === id ? (
                  <>
                    {!post.RetweetId && (
                      <Button onClick={onUpdatePostMode}>수정</Button>
                    )}
                    <Button
                      type="danger"
                      onClick={onRemovePost}
                      loading={removePostLoading}
                    >
                      삭제
                    </Button>{" "}
                  </>
                ) : (
                  <Button onClick={onReport(post.User.nickname, post.id)}>
                    신고
                  </Button>
                )}
              </Button.Group>
            }
          >
            <EllipsisOutlined />
          </Popover>,
        ]}
        title={
          post.RetweetId
            ? `${post.User.nickname}님에 의해 ${post.Retweet.User.nickname}님의 글이 비쳤습니다!`
            : null
        }
        extra={id && <FollowButton post={post} />}
      >
        {post.RetweetId && post.Retweet ? (
          <Postcard
            cover={
              post.Retweet.Images[0] && (
                <PostImages images={post.Retweet.Images} />
              )
            }
          >
            <div style={{ float: "right" }}>
              {dayjs(post.createdAt).format("YYYY.MM.DD | H:mm:ss")}
            </div>
            <Card.Meta
              avatar={
                <Link href={`/user/${post.Retweet.User.id}`} prefetch={false}>
                  <a>
                    <Avatar>{post.Retweet.User.nickname[0]}</Avatar>
                  </a>
                </Link>
              }
              title={post.Retweet.User.nickname}
              description={
                <PostCardContent
                  onUpdatePost={onUpdatePost}
                  onCloseUpdatePostMode={onCloseUpdatePostMode}
                  postData={post.Retweet.content}
                />
              }
            />
          </Postcard>
        ) : (
          <>
            <div style={{ float: "right" }}>
              {dayjs(post.createdAt).format("YYYY.MM.DD | H:mm:ss")}
            </div>

            <Card.Meta
              avatar={
                <Link href={`/user/${post.User.id}`} prefetch={false}>
                  <a>
                    <Avatar>{post.User.nickname[0]}</Avatar>
                  </a>
                </Link>
              }
              title={post.User.nickname}
              description={
                <PostCardContent
                  updatePostMode={updatePostMode}
                  onUpdatePost={onUpdatePost}
                  onCloseUpdatePostMode={onCloseUpdatePostMode}
                  postData={post.content}
                />
              }
            />
          </>
        )}
      </Postcard>
      {commentFormOpened && (
        <div>
          <CommentForm post={post} />
          <List
            header={`${post.Comments.length}개의 댓글`}
            itemLayout="horizontal"
            dataSource={post.Comments}
            renderItem={(item) => (
              <li>
                <Comment
                  author={item.User.nickname}
                  avatar={
                    <Link href={`/user/${item.User.id}`} prefetch={false}>
                      <a>
                        <Avatar>{item.User.nickname[0]}</Avatar>
                      </a>
                    </Link>
                  }
                  content={item.content}
                />
              </li>
            )}
          />
        </div>
      )}

      {/* <Comments /> */}
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number,
    User: PropTypes.object,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    Comments: PropTypes.arrayOf(PropTypes.object),
    Images: PropTypes.arrayOf(PropTypes.object),
    Likers: PropTypes.arrayOf(PropTypes.object),
    RetweetId: PropTypes.number,
    Retweet: PropTypes.objectOf(PropTypes.any),
  }).isRequired,
};
export default PostCard;
