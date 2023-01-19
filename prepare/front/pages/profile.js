import React, { useEffect } from "react";
import Head from "next/head";
import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";
import Router from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  LOAD_FOLLOWERS_REQUEST,
  LOAD_FOLLOWINGS_REQUEST,
  LOAD_MY_INFO_REQUEST,
} from "../reducers/user";
import { LOAD_POSTS_REQUEST } from "../reducers/post";
import { END } from "redux-saga";
import wrapper from "../store/configureStore";
import axios from "axios";

const Profile = () => {
  const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);
  useEffect(() => {
    dispatch({
      type: LOAD_FOLLOWERS_REQUEST,
    });
    dispatch({
      type: LOAD_FOLLOWINGS_REQUEST,
    });
  }, []);
  useEffect(() => {
    if (!(me && me.id)) {
      Router.push("/");
    }
  }, [me && me.id]);

  if (!me) {
    return null;
  }
  return (
    <>
      <Head>
        <title>Profile | TwitBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList header="팔로잉" data={me.Followings} />
        <FollowList header="팔로워" data={me.Followers} />
      </AppLayout>
    </>
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
export default Profile;
