import { Button, Form, Input } from "antd";
import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../hooks/useInput";
import { addPost } from "../reducers/post";

const PostForm = () => {
  const dispatch = useDispatch();
  const { imagePaths, addPostDone, addPostLoading } = useSelector(
    (state) => state.post
  );

  const [text, onChangeText, setText] = useInput("");

  useEffect(() => {
    if (addPostDone) {
      setText("");
    }
  }, [addPostDone]);

  const onSubmit = useCallback(() => {
    dispatch(addPost(text));
  }, [text]);
  const imageInput = useRef();
  const onClickImageUpload = useCallback(() => {
    imageInput.current.click();
  }, [imageInput.current]);
  return (
    <Form
      style={{ marin: "10px 0 20px" }}
      encType="multipart/form-data"
      onFinish={onSubmit}
    >
      <Input.TextArea
        value={text}
        onChange={onChangeText}
        maxLength={140}
        placeholder="작성해주세요"
      />
      <div>
        <input type="file" multiple hidden ref={imageInput} />
        <Button onClick={onClickImageUpload}>이미지 업로드</Button>
        <Button
          type="primary"
          style={{ float: "right" }}
          htmlType="submit"
          loading={addPostLoading}
        >
          TWIT
        </Button>
      </div>
      <div>
        {imagePaths.map((v) => (
          <div key={v} style={{ display: "inline-block" }}>
            <img src={v} style={{ width: "200px" }} alt={v} />
            <div>
              <Button>제거</Button>
            </div>
          </div>
        ))}
      </div>
    </Form>
  );
};
export default PostForm;
