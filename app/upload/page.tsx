"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { db } from "@/firebaseConfig";
import {
  collectionGroup,
  addDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";

const Uploadpage = () => {
  const { user } = useAppContext();
  const [url, setUrl] = useState("");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const router = useRouter();

  // Firestoreから既存のタグを取得
  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        const linksSnapshot = await getDocs(collectionGroup(db, "links"));
        const allTags: string[] = [];

        linksSnapshot.forEach((doc) => {
          const data = doc.data();
          if (Array.isArray(data.tags)) {
            allTags.push(...data.tags);
          }
        });

        // 重複するタグを除外
        const uniqueTags = Array.from(new Set(allTags));
        setAvailableTags(uniqueTags);
      } catch (error) {
        console.error("Error fetching available tags: ", error);
      }
    };

    fetchAvailableTags();
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleSelectTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]); // 選択された既存のタグを追加
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    try {
      if (!user) return; // ログインしているか確認
      const userId = user.uid;

      // Firestoreに保存
      await addDoc(collection(db, "users", userId, "links"), {
        url: url,
        bio: bio,
        tags: tags,
        date: Timestamp.now(),
      });

      setUrl("");
      setBio("");
      setTags([]);
      router.push("/home");
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <div className="flex justify-center h-screen items-center">
      <div className="bg-gray-200 mt-20 p-5 rounded-2xl w-full max-w-md">
        <p className="text-xl">URL</p>
        <input
          type="text"
          placeholder="URLを入力してください"
          className="w-full p-2 mt-2 border rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <p className="text-xl mt-4">説明</p>
        <textarea
          rows={3}
          placeholder="説明を入力してください"
          className="w-full p-2 mt-2 border rounded resize-none"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        {/* タグの入力フィールド */}
        <div className="mt-4">
          <p className="text-xl">タグを追加</p>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="新しいタグを入力"
              className="w-full p-2 border rounded"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
            <button
              onClick={handleAddTag}
              className="bg-blue-500 text-white w-24 p-2 rounded hover:bg-blue-700"
            >
              追加
            </button>
          </div>

          {/* 既存のタグを表示して選択 */}
          <div className="mt-4">
            <p className="text-xl">既存のタグを選択</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableTags.length === 0 ? (
                <p>タグがありません。</p> // タグがない場合
              ) : (
                availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSelectTag(tag)}
                    className={`p-2 rounded ${
                      tags.includes(tag)
                        ? "bg-green-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 追加したタグを表示 */}
          <div className="mt-4">
            <p className="text-xl">選択されたタグ</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="bg-gray-300 p-2 rounded flex items-center"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-red-500 font-bold"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white text-xl w-28 h-12 py-2 px-4 rounded hover:bg-blue-700 mt-4"
        >
          登録
        </button>
      </div>
    </div>
  );
};

export default Uploadpage;
