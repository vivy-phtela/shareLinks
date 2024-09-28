"use client";

import React from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { auth } from "@/firebaseConfig";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
  const { user } = useAppContext();

  // ログアウト
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <header className="flex bg-white fixed top-0 left-0 w-full h-20 z-50 border-b-2 border-gray-200">
      <div className="flex items-center">
        <div className="flex items-center justify-center px-5">
          <Link href={user ? "/home" : "/"}>
            <h1 className="font-bold">ShareLinks</h1>
          </Link>
        </div>
        <nav>
          <ul className="flex gap-10 text-lg items-center">
            {user && (
              <>
                <li>
                  <Link
                    href="/home"
                    className="text-gray-700 hover:bg-blue-100 duration-300"
                  >
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link
                    href="/upload"
                    className="text-gray-700 hover:bg-blue-100 duration-300"
                  >
                    登録
                  </Link>
                </li>
                <li>
                  <Link
                    href="/group/create"
                    className="text-gray-700 hover:bg-blue-100 duration-300"
                  >
                    グループ作成
                  </Link>
                </li>
                <li>
                  <Link
                    href="/group/join"
                    className="text-gray-700 hover:bg-blue-100 duration-300"
                  >
                    グループ参加
                  </Link>
                </li>
                <li>
                  <Link
                    href="/group/list"
                    className="text-gray-700 hover:bg-blue-100 duration-300"
                  >
                    参加中のグループ
                  </Link>
                </li>
                <div className="flex gap-2 items-center">
                  <li>
                    <FaUserCircle className="text-3xl" />
                  </li>
                  <div className="flex-col items-center">
                    <li className="flex flex-col items-center">
                      <div>
                        <span className="text-blue-600">{user.email}</span>
                      </div>
                      <div
                        onClick={handleLogout}
                        className="cursor-pointer text-gray-700 hover:bg-blue-100 duration-300 mt-2"
                      >
                        <span>ログアウト</span>
                      </div>
                    </li>
                  </div>
                </div>
              </>
            )}
            {!user && (
              <>
                <li>
                  <Link
                    href="/auth/register"
                    className="text-gray-700 hover:bg-blue-100 duration-300"
                  >
                    新規登録
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:bg-blue-100 duration-300"
                  >
                    ログイン
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
