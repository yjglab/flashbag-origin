import { Button, Checkbox, Form, Input } from "antd";
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import useInput from "../hooks/useInput";
import styled from "styled-components";
import Router from "next/router";
import { LOAD_MY_INFO_REQUEST, SIGN_UP_REQUEST } from "../reducers/user";
import { useDispatch, useSelector } from "react-redux";
import wrapper from "../store/configureStore";
import { LOAD_POSTS_REQUEST } from "../reducers/post";
import { END } from "redux-saga";
import axios from "axios";

const ErrorMessage = styled.div`
  color: red;
`;
const Signup = () => {
  const dispatch = useDispatch();
  const { signUpLoading, signUpDone, signUpError, me } = useSelector(
    (state) => state.user
  );
  useEffect(() => {
    if (me && me.id) {
      Router.replace("/");
    }
  }, [me && me.id]);
  useEffect(() => {
    if (signUpDone) {
      Router.push("/");
    }
  }, [signUpDone]);

  useEffect(() => {
    if (signUpError) {
      alert(signUpError);
    }
  }, [signUpError]);

  const [email, onChangeEmail] = useInput("");
  const [nickname, onChangeNickname] = useInput("");
  const [password, onChangePassword] = useInput("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const onChangePasswordCheck = useCallback(
    (e) => {
      setPasswordCheck(e.target.value);
      setPasswordError(e.target.value !== password);
    },
    [password]
  );
  const [term, setTerm] = useState("");
  const [termError, setTermError] = useState("");
  const onChangeTerm = useCallback((e) => {
    setTerm(e.target.checked);
    setTermError(false);
  }, []);
  const onSubmit = useCallback(() => {
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (!term) {
      return setTermError(true);
    }
    console.log(email, nickname, password);
    dispatch({ type: SIGN_UP_REQUEST, data: { email, password, nickname } });
  }, [email, password, passwordCheck, term]);
  return (
    <AppLayout>
      <Head>
        <title>Sign Up | flashbag-origin</title>
      </Head>
      <Form onFinish={onSubmit}>
        <div>
          <label htmlFor="user-email">이메일</label>
          <br />
          <Input
            name="user-email"
            type="email"
            value={email}
            required
            onChange={onChangeEmail}
          />
        </div>
        <div>
          <label htmlFor="user-nick">닉네임</label>
          <br />
          <Input
            name="user-nick"
            type="text"
            value={nickname}
            required
            onChange={onChangeNickname}
          />
        </div>
        <div>
          <label htmlFor="user-password">비밀번호</label>
          <br />
          <Input
            name="user-password"
            type="password"
            value={password}
            required
            onChange={onChangePassword}
          />
        </div>
        <div>
          <label htmlFor="user-password-check">비밀번호체크</label>
          <br />
          <Input
            name="user-password-check"
            type="password"
            value={passwordCheck}
            required
            onChange={onChangePasswordCheck}
          />
          {passwordError && <ErrorMessage>비밀번호 불일치</ErrorMessage>}
        </div>
        <div>
          <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>
            동의하기
          </Checkbox>
          {termError && <ErrorMessage>약관에 동의해야 합니다.</ErrorMessage>}
        </div>
        <div style={{ marginTop: 10 }}>
          <Button type="primary" htmlType="submit" loading={signUpLoading}>
            가입하기
          </Button>
        </div>
      </Form>
    </AppLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  async (context) => {
    // 프론트 -> 백엔드 서버로 쿠키 전달
    const cookie = context.req ? context.req.headers.cookie : "";
    // 쿠키 공유 문제 방지 (중요❗️)
    axios.defaults.headers.Cookie = "";
    if (context.req && cookie) {
      axios.defaults.headers.Cookie = cookie;
    }
    //
    context.store.dispatch({
      type: LOAD_MY_INFO_REQUEST,
    });
    context.store.dispatch({
      type: LOAD_POSTS_REQUEST,
    });
    context.store.dispatch(END); // END action: Request가 success 될때까지 기다림.
    await context.store.sagaTask.toPromise();
  }
);
export default Signup;
