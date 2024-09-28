"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { addDoc, collection, updateDoc, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

const CreateGroupPage = () => {
  const { user } = useAppContext();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [password, setPassword] = useState("");
  const [groupCreated, setGroupCreated] = useState(false);
  const router = useRouter();

  const handleCreateGroup = async () => {
    try {
      if (!user) {
        console.error("ユーザーがログインしていません");
        return;
      }

      // Firestoreにグループ情報を保存
      const groupRef = await addDoc(collection(db, "groups"), {
        groupName: groupName,
        description: groupDescription,
        members: [user.uid],
        password: password,
      });

      // Firestoreからユーザーのgroupsフィールドを取得
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const userGroups = userData.groups || [];

        // 作成者が自動的にグループに参加
        await updateDoc(userRef, {
          groups: [...userGroups, groupRef.id],
        });
      }

      setGroupCreated(true);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">グループ作成</h1>
      <input
        type="text"
        placeholder="グループ名を入力"
        className="p-2 border mb-4"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <input
        type="text"
        placeholder="グループの説明を入力"
        className="p-2 border mb-4"
        value={groupDescription}
        onChange={(e) => setGroupDescription(e.target.value)}
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
        onClick={handleCreateGroup}
      >
        グループ作成
      </button>

      {groupCreated && (
        <div className="mt-4">
          <p>グループが作成されました！</p>
        </div>
      )}
    </div>
  );
};

export default CreateGroupPage;
