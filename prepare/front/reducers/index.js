import { HYDRATE } from "next-redux-wrapper";
import user from "./user";
import post from "./post";
import { combineReducers } from "redux";

const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE: // __NEXT_REDUX_WRAPPER
      // console.log("HYDRATE", action);
      return action.payload;
    default: {
      const combineReducer = combineReducers({
        user,
        post,
      });
      return combineReducer(state, action);
    }
  }
};

// const rootReducer = combineReducers({
//   index: (state = {}, action) => {
//     switch (
//       action.type // SSR 을 위함
//     ) {
//       case HYDRATE:
//         console.log("HYDRATE", action);
//         return { ...state, ...action.payload };

//       default:
//         return state;
//     }
//   },
//   user,
//   post,
// });

export default rootReducer;
