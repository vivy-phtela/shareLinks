"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { db } from "@/firebaseConfig";
import {
  getDoc,
  doc,
  collection,
  updateDoc,
  arrayRemove,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const GroupListPage = () => {
  const { user } = useAppContext();
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Firestoreからユーザーが参加しているグループの情報を取得
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const userGroups = userData.groups || [];

          // グループIDからグループ名を取得
          const groupPromises = userGroups.map(async (groupId: string) => {
            const groupRef = doc(db, "groups", groupId);
            const groupSnapshot = await getDoc(groupRef);
            if (groupSnapshot.exists()) {
              const groupData = groupSnapshot.data();
              return { id: groupId, name: groupData.groupName };
            }
            return null;
          });

          const resolvedGroups = await Promise.all(groupPromises);
          setGroups(
            resolvedGroups.filter((group) => group !== null) as {
              id: string;
              name: string;
            }[]
          );
        }
      } catch (error) {
        console.error("Error fetching user groups: ", error);
      }
    };

    fetchUserGroups();
  }, [user]);

  // グループ脱退処理
  const handleLeaveGroup = async (groupId: string) => {
    try {
      if (!user) return;

      // ユーザーのgroupsフィールドからグループIDを削除
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        groups: arrayRemove(groupId),
      });

      // グループのmembersフィールドからユーザーを削除
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(user.uid),
      });

      // 関連するデータを削除
      const userLinksCollection = collection(db, "users", user.uid, "links");
      const groupLinksQuery = query(
        userLinksCollection,
        where("groupID", "==", groupId)
      );
      const groupLinks = await getDocs(groupLinksQuery);
      groupLinks.forEach(async (linkDoc) => {
        await deleteDoc(doc(userLinksCollection, linkDoc.id));
      });

      // グループリストを更新
      setGroups(groups.filter((group) => group.id !== groupId));
      setSuccess(`グループ「${groupId}」から脱退しました`);
    } catch (error) {
      console.error("Error leaving group:", error);
      setError("グループ脱退に失敗しました");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">参加しているグループ</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <div className="w-full max-w-md">
        {groups.length === 0 ? (
          <p>参加しているグループはありません。</p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="bg-gray-200 p-4 mb-4 rounded">
              <h2 className="text-xl font-bold">{group.name}</h2>
              <button
                className="bg-red-500 text-white p-2 rounded mt-2"
                onClick={() => handleLeaveGroup(group.id)}
              >
                グループ脱退
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupListPage;
