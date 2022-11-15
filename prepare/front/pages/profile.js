import React from "react";
import Head from "next/head";
import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";

const Profile = () => {
  const followerList = [
    { nickname: "재경" },
    { nickname: "abc" },
    { nickname: "eee" },
  ];
  const followingList = [
    { nickname: "f1" },
    { nickname: "f2" },
    { nickname: "f3" },
  ];
  return (
    <>
      <Head>
        <title>Profile | TwitBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList header="팔로잉 목록" data={followerList} />
        <FollowList header="팔로워 목록" data={followingList} />
      </AppLayout>
    </>
  );
};
export default Profile;
