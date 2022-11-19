// 모든 페이지 공통
import React from "react";
import PropTypes from "prop-types";
import "antd/dist/antd.css";
import Head from "next/head";
import wrapper from "../store/configureStore";

const TwitBird = ({ Component }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8"></meta>
        <title>TwitBird</title>
      </Head>
      <div>공통메뉴</div>
      <Component />
    </>
  );
};

TwitBird.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export default wrapper.withRedux(TwitBird);
