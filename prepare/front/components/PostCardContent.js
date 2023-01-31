import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { Button, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_POST_REQUEST } from "../reducers/post";

const { TextArea } = Input;
const PostCardContent = ({
  postData,
  updatePostMode,
  onUpdatePost,
  onCloseUpdatePostMode,
}) => {
  const { updatePostLoading, updatePostDone } = useSelector(
    (state) => state.post
  );
  const [editText, setEditText] = useState(postData);
  useEffect(() => {
    if (updatePostDone) {
      onCloseUpdatePostMode();
    }
  }, [updatePostDone]);
  const onChangeText = useCallback((e) => {
    setEditText(e.target.value);
  }, []);

  return (
    <div>
      {updatePostMode ? (
        <>
          <TextArea value={editText} onChange={onChangeText} />
          <Button.Group>
            <Button
              loading={updatePostLoading}
              onClick={onUpdatePost(editText)}
            >
              수정완료
            </Button>
            <Button type="danger" onClick={onCloseUpdatePostMode}>
              취소
            </Button>
          </Button.Group>
        </>
      ) : (
        postData.split(/(#[^\s#]+)/g).map((v, i) => {
          if (v.match(/(#[^\s#]+)/)) {
            return (
              <Link href={`/hashtag/${v.slice(1)}`} prefetch={false} key={i}>
                <a>{v}</a>
              </Link>
            );
          }
          return v;
        })
      )}
    </div>
  );
};
PostCardContent.propTypes = {
  postData: PropTypes.string.isRequired,
  updatePostMode: PropTypes.bool,
  onUpdatePost: PropTypes.func.isRequired,
  onCloseUpdatePostMode: PropTypes.func.isRequired,
};

PostCardContent.propTypes = {
  updatePostMode: false,
}; // 기본값 붙이기
export default PostCardContent;
