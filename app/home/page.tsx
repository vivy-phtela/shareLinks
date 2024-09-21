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
  userId: string; // userIdを格納
  username?: string; // usernameを格納するフィールド
  tags?: string[]; // タグを格納するフィールドを追加
}

interface UserDataType {
  username: string;
}

const Homepage = () => {
  const [linksByTag, setLinksByTag] = useState<{
    [tag: string]: LinksDataType[];
  }>({});

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        // linksサブコレクションのクエリ
        const linksQuery = query(collectionGroup(db, "links"));
        const querySnapshot = await getDocs(linksQuery);

        const groupedLinks: { [tag: string]: LinksDataType[] } = {};

        // linksデータを取得し、対応するusernameも取得してタグでグループ化
        await Promise.all(
          querySnapshot.docs.map(async (linkDoc) => {
            const data = linkDoc.data();
            const linkPath = linkDoc.ref.path.split("/"); // パスを取得して解析
            const userId = linkPath[1]; // userIdはパスの2番目の要素
            let username = "";

            // 親のusersコレクションからusernameを取得
            const userDoc = await getDoc(firestoreDoc(db, "users", userId));
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserDataType; // 型をキャスト
              username = userData.username || "Unknown User";
            }

            const link: LinksDataType = {
              id: linkDoc.id,
              url: data.url,
              bio: data.bio,
              date: data.date,
              userId,
              username, // 取得したusernameを含める
              tags: data.tags || [], // タグを取得。存在しない場合は空配列を設定
            };

            // タグでグループ化
            link.tags?.forEach((tag) => {
              if (!groupedLinks[tag]) {
                groupedLinks[tag] = [];
              }
              groupedLinks[tag].push(link);
            });
          })
        );

        setLinksByTag(groupedLinks);
      } catch (error) {
        console.error("Error fetching links:", error);
      }
    };

    fetchLinks();
  }, []);

  return (
    <div className="flex justify-center mt-24 h-screen">
      <div className="w-full max-w-3xl">
        {/* タグごとにグループ化されたリンクを表示 */}
        {Object.keys(linksByTag).map((tag) => (
          <div key={tag} className="mb-8">
            <h2 className="text-2xl font-bold text-blue-500 mb-4">#{tag}</h2>{" "}
            {/* タグ名を表示 */}
            {linksByTag[tag].map((link) => (
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
        ))}
      </div>
    </div>
  );
};

export default Homepage;
