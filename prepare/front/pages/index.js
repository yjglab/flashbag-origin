import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppLayout from "../components/AppLayout";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import { LOAD_POSTS_REQUEST } from "../reducers/post";
import { LOAD_MY_INFO_REQUEST } from "../reducers/user";
import wrapper from "../store/configureStore";
import { END } from "redux-saga";
import axios from "axios";
const Home = () => {
  const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } =
    useSelector((state) => state.post);

  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  useEffect(() => {
    function onScroll() {
      if (
        window.scrollY + document.documentElement.clientHeight >
        document.documentElement.scrollHeight - 300
      ) {
        if (hasMorePosts && !loadPostsLoading) {
          const lastId = mainPosts[mainPosts.length - 1]?.id;
          dispatch({
            type: LOAD_POSTS_REQUEST,
            lastId,
          });
        }
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [hasMorePosts, loadPostsLoading, mainPosts]);

  return (
    <AppLayout>
      {me && <PostForm />}
      {mainPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </AppLayout>
  );
};

// 자동으로 Home 컴포넌트보다 먼저 실행됨.
// SSR, 데이터를 먼저 받아옴.
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
export default Home;

/*
getStaticProps(): 언제 접속해도 데이터가 바뀔일이 없을 경우 사용 (사용 용도가 제한적 ex. 블로그 게시글, 쇼핑몰 이벤트 창)
- dynamic routing에서 사용 시 getStaticPaths도 반드시 함께 필요
getServerSideProps() : 접속할 때마다 바뀌는 화면이 있는 경우 사용 (대부분의 경우 사용)
*/

/* about.js */
/* 예시 파일 (사용안함) */
// import { LOAD_USER_REQUEST } from "../reducers/user";

// export const getStaticProps = wrapper.getStaticProps(async (context) => {
//   context.store.dispatch({
//     type: LOAD_USER_REQUEST,
//     data: 1,
//   });
//   context.store.dispatch(END);
//   await context.store.sagaTask.toPromise();
// });
