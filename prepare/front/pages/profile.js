import React, { useEffect } from "react";
import Head from "next/head";
import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";
import Router from "next/router";
import { useSelector } from "react-redux";

const Profile = () => {
  useEffect(() => {
    if (!(me && me.id)) {
      Router.push("/");
    }
  }, [me && me.id]);
  const { me } = useSelector((state) => state.user);

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
export default Profile;
