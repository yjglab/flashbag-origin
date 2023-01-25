import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";
import Router from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { LOAD_MY_INFO_REQUEST } from "../reducers/user";
import { LOAD_POSTS_REQUEST } from "../reducers/post";
import { END } from "redux-saga";
import wrapper from "../store/configureStore";
import axios from "axios";
import useSWR from "swr";

const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((result) => result.data);
const Profile = () => {
  const { me } = useSelector((state) => state.user);
  const [followersLimit, setFollowersLimit] = useState(3);
  const [followingsLimit, setFollowingsLimit] = useState(3);

  // SWR 사용 (load action 3총사 대체 / load 데이터 관련 액션이 반드시 SSR 되어야하는 것이 아니면 SWR사용하는 것이 편라)
  // fetcher: 해당 주소를 어떻게 가져올 지를 결정. 특정 swr을 제외히고는 module로 따로 빼서 사용하기.
  // SWR에서 로딩중임을 의미하는 것은 Data, Error 모두 없는 경우
  const { data: followersData, error: followerError } = useSWR(
    `http://localhost:3065/user/followers?limit=${followersLimit}`,
    fetcher
  );
  const { data: followingsData, error: followingError } = useSWR(
    `http://localhost:3065/user/followings?limit=${followingsLimit}`,
    fetcher
  );

  useEffect(() => {
    if (!(me && me.id)) {
      Router.push("/");
    }
  }, [me && me.id]);

  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit((prev) => prev + 3);
  }, []);
  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit((prev) => prev + 3);
  }, []);

  if (!me) {
    return "내 정보 로드 중...";
  }
  if (followerError || followingError) {
    console.error(followerError || followingError);
    return "팔로잉/팔로워 로딩 중 에러가 발생했습니다.";
    // 모든 hooks는 반드시 실행되어야 하므로 return이 hooks보다 위에 있를 수 없음
  }

  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_FOLLOWERS_REQUEST,
  //   });
  //   dispatch({
  //     type: LOAD_FOLLOWINGS_REQUEST,
  //   });
  // }, []);

  return (
    <>
      <Head>
        <title>Profile | Flashbag Origin</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList
          header="팔로잉"
          data={followingsData}
          onClickMore={loadMoreFollowings}
          loading={!followingsData && !followingError}
        />
        <FollowList
          header="팔로워"
          data={followersData}
          onClickMore={loadMoreFollowers}
          loading={!followersData && !followerError}
        />
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
    context.store.dispatch(END); // END action: Request가 success 될때까지 기다림.
    await context.store.sagaTask.toPromise();
  }
);
export default Profile;
