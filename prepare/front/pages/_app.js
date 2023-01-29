// 모든 페이지 공통
import React from "react";
import PropTypes from "prop-types";
import "antd/dist/antd.css";
import Head from "next/head";
import wrapper from "../store/configureStore";

const FlashbagOrigin = ({ Component }) => {
  // Component: index.js의 return 부분
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Flashbag</title>
      </Head>
      <Component />
    </>
  );
};

FlashbagOrigin.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export default wrapper.withRedux(FlashbagOrigin);
