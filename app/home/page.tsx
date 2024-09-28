"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import {
  collectionGroup,
  getDocs,
  query,
  doc as firestoreDoc,
  getDoc,
} from "firebase/firestore";

interface LinksDataType {
  id: string;
  url: string;
  bio: string;
  date: any;
  userId: string;
  username?: string;
  tags?: string[];
  title: string;
  groupID: string;
}

interface UserDataType {
  username: string;
}

interface GroupDataType {
  groupName: string;
}

const Homepage = () => {
  const [linksByGroup, setLinksByGroup] = useState<{
    [groupID: string]: { groupName: string; links: LinksDataType[] };
  }>({});
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        // linksサブコレクションのデータを取得
        const linksQuery = query(collectionGroup(db, "links"));
        const querySnapshot = await getDocs(linksQuery);

        const groupedLinks: {
          [groupID: string]: { groupName: string; links: LinksDataType[] };
        } = {};

        // linksデータを取得し、対応するusernameとグループ名も取得してグループごとに分類
        await Promise.all(
          querySnapshot.docs.map(async (linkDoc) => {
            const data = linkDoc.data();
            const linkPath = linkDoc.ref.path.split("/");
            const userId = linkPath[1];
            let username = "";
            let groupName = "Unknown Group";

            // usersコレクションからusernameを取得
            const userDoc = await getDoc(firestoreDoc(db, "users", userId));
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserDataType;
              username = userData.username || "Unknown User";
            }

            // グループ名を取得
            if (data.groupID) {
              const groupDoc = await getDoc(
                firestoreDoc(db, "groups", data.groupID)
              );
              if (groupDoc.exists()) {
                const groupData = groupDoc.data() as GroupDataType;
                groupName = groupData.groupName;
              } else {
                console.error(`Group with ID ${data.groupID} not found.`);
              }
            }

            const link: LinksDataType = {
              id: linkDoc.id,
              url: data.url,
              bio: data.bio,
              date: data.date,
              userId,
              username,
              tags: data.tags || [],
              title: data.title || "No Title",
              groupID: data.groupID || "Unknown Group",
            };

            // グループIDでグループ化
            if (!groupedLinks[link.groupID]) {
              groupedLinks[link.groupID] = {
                groupName: groupName,
                links: [],
              };
            }
            groupedLinks[link.groupID].links.push(link);
          })
        );

        setLinksByGroup(groupedLinks);
        setSelectedGroup(Object.keys(groupedLinks)[0]); // 初期状態で最初のグループを選択
      } catch (error) {
        console.error("Error fetching links:", error);
      }
    };

    fetchLinks();
  }, []);

  return (
    <div className="flex h-screen mt-20">
      {/* 左側のタブ */}
      <div className="w-1/4 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">参加グループ一覧</h2>
        {Object.keys(linksByGroup).map((groupID) => (
          <div
            key={groupID}
            className={`p-2 mb-2 cursor-pointer rounded ${
              selectedGroup === groupID
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setSelectedGroup(groupID)}
          >
            {linksByGroup[groupID].groupName}
          </div>
        ))}
      </div>

      {/* 右側の投稿表示 */}
      <div className="w-3/4 p-6">
        {selectedGroup && linksByGroup[selectedGroup] && (
          <div>
            {linksByGroup[selectedGroup].links.map((link) => (
              <div key={link.id} className="bg-gray-200 p-4 mb-4 rounded">
                <p className="text-sm text-gray-500">
                  Username: {link.username}
                </p>
                <a href={link.url} className="text-xl font-bold text-blue-600">
                  {link.url}
                </a>
                <p className="text-gray-700">{link.bio}</p>
                <p className="text-sm text-gray-500">
                  {link.date?.toDate().toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
