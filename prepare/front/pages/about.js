import { LOAD_USER_REQUEST } from "../reducers/user";

export const getStaticProps = wrapper.getStaticProps(async (context) => {
  context.store.dispatch({
    type: LOAD_USER_REQUEST,
    data: 1,
  });
  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
});

/*
getStaticProps(): 언제 접속해도 데이터가 바뀔일이 없을 경우 사용 (사용 용도가 제한적 ex. 블로그 게시글, 쇼핑몰 이벤트 창)
getServerSideProps() : 접속할 때마다 바뀌는 화면이 있는 경우 사용 (대부분의 경우 사용)
*/
