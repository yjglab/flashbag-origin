import axios from "axios";
import { all, delay, fork, put, takeLatest } from "redux-saga/effects";

function logInAPI(data) {
  // data인자: action.data
  return axios.post("/api/login", data);
}
function* logIn(action) {
  try {
    yield delay(1000); // fake
    // const result = yield call(logInAPI, action.data);
    yield put({
      type: "LOG_IN_SUCCESS",
      data: action.data,
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
function* watchLogIn() {
  yield takeLatest("LOG_IN_REQUEST", logIn);
}
function* watchLogOut() {
  yield takeLatest("LOG_OUT_REQUEST", logOut);
}
export default function* userSaga() {
  yield all([fork(watchLogIn), fork(watchLogOut)]);
}
