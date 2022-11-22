import { all, call, delay, fork, put, takeLatest } from "redux-saga/effects";
import axios from "axios";

// fork : (비동기 함수 호출)
// call : (동기 함수 호출). call 함수 형식 ==> call(A함수, A함수인자 ...)
// put : action객체를 dispatch
// take : 어떤 액션이 실행되기까지 기다렸다가 실행되면 2번쨰 인자의 제너레이터 f 실행.
// - 1회성 함수임. 1회성이 되지 않기 위해선 while(true)와 사용하면 되지만 비추천.
// takeEvery : 그래서 takeEvery를 사용.
// takeLatest : 가장 마지막 것만 실행 (2번을 누른 경우 앞에 것은 무시하고 뒤에 것만 실행). 대부분의 경우 추천.
// - 단, 예를 들어 2번 요청한 경우 요청을 무시하지는 않고 응답에서 하나를 무시하는 방식임. 그래서 서버쪽에서 데이터가 2번 저장되기는 하기때문에 검사가 필요함.
// throttle : 그래서 이것도 사용하는데, 시간을 정해두고 어떤 시간동안은 요청을 한번으로 제한함. 특수한 경우에만 사용.(디도스공격 방지 등)
// takeLeading : takeLatest와 반대.

function logInAPI(data) {
  // data인자: action.data
  return axios.post("/api/login", data);
}
function* logIn(action) {
  try {
    yield delay(2000); // fake
    // const result = yield call(logInAPI, action.data);
    yield put({
      type: "LOG_IN_SUCCESS",
      //   data: result.data,
    });
  } catch (err) {
    yield put({
      type: "LOG_IN_FAILURE",
      data: err.response.data,
    });
  }
}

function logOutAPI() {
  return axios.post("/api/logOut");
}
function* logOut() {
  try {
    yield delay(1000);
    // const result = yield call(logOutAPI);
    yield put({
      type: "LOG_OUT_SUCCESS",
      //   data: result.data,
    });
  } catch (err) {
    yield put({
      type: "LOG_OUT_FAILURE",
      data: err.response.data,
    });
  }
}

function addPostAPI(data) {
  return axios.post("/api/post", data);
}
function* addPost(action) {
  try {
    yield delay(1000);
    // const result = yield call(addPostAPI, action.data);
    yield put({
      type: "ADD_POST_SUCCESS",
      //   data: result.data,
    });
  } catch (err) {
    yield put({
      type: "ADD_POST_FAILURE",
      data: err.response.data,
    });
  }
}

function* watchLogin() {
  yield takeLatest("LOG_IN_REQUEST", logIn);
}
function* watchLogOut() {
  yield takeLatest("LOG_OUT_REQUEST", logOut);
}
function* watchAddPost() {
  yield takeLatest("ADD_POST_REQUEST", addPost);
}
export default function* rootSaga() {
  yield all([fork(watchLogin)]); // all() : 한번에 모두 동시 실행
}
