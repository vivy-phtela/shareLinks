"use client";

import React, { useState } from "react";
import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAppContext } from "@/context/AppContext";

const JoinGroupPage = () => {
  const { user } = useAppContext();
  const [groupName, setGroupName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleJoinGroup = async () => {
    try {
      if (!user || !user.uid) {
        setError("ユーザー情報が見つかりません");
        return;
      }

      // Firestoreからグループ情報を取得
      const q = query(
        collection(db, "groups"),
        where("groupName", "==", groupName)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("グループが見つかりません");
        return;
      }

      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();

      if (groupData.password !== password) {
        setError("パスワードが間違っています");
        return;
      }

      // グループにユーザーを追加（groupsコレクション）
      const groupRef = doc(db, "groups", groupDoc.id);
      await updateDoc(groupRef, {
        members: [...(groupData.members || []), user.uid], // 既存メンバーに追加
      });

      // ユーザーのgroupsフィールドを更新（usersコレクション）
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const userGroups = userData.groups || [];

        // すでに参加していない場合は追加
        if (!userGroups.includes(groupDoc.id)) {
          await updateDoc(userRef, {
            groups: [...userGroups, groupDoc.id],
          });
        }
      } else {
        setError("ユーザー情報が見つかりません");
        return;
      }

      setSuccess("グループに参加しました");
      setError("");
    } catch (error) {
      console.error("Error joining group:", error);
      setError("グループに参加できませんでした");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">グループ参加</h1>
      <input
        type="text"
        placeholder="グループ名を入力"
        className="p-2 border mb-4"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワードを入力"
        className="p-2 border mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={handleJoinGroup}
      >
        グループに参加
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
};

export default JoinGroupPage;
