"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { auth, db } from "../../../firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Inputs = {
  email: string;
  password: string;
  username: string;
};

const Register = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onsubmit: SubmitHandler<Inputs> = async (data) => {
    await createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // Firestoreにユーザ情報を保存
        await setDoc(doc(db, "users", user.uid), {
          email: data.email,
          username: data.username,
          id: user.uid,
        });

        router.push("/auth/login");
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          alert("このメールアドレスは既に使用されています．");
        } else {
          alert(error.message);
        }
      });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit(onsubmit)}
        className="bg-white p-8 rounded-lg border-2 border-gray-400 w-96"
      >
        <h1 className="mb-4 text-2xl font-bold">新規登録</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium">ユーザ名</label>
          <input
            {...register("username", {
              required: "ユーザ名は必須です．",
            })}
            type="text"
            className="mt-1 border-2 border-gray-400 rounded-md w-full p-2"
          />
          {errors.username && (
            <span className="text-red-600 text-sm">
              {errors.username.message}
            </span>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">メールアドレス</label>
          <input
            {...register("email", {
              required: "メールアドレスは必須です．",
              pattern: {
                value:
                  /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/,
                message: "メールアドレスの形式が正しくありません．",
              },
            })}
            type="text"
            className="mt-1 border-2 border-gray-400 rounded-md w-full p-2"
          />
          {errors.email && (
            <span className="text-red-600 text-sm">{errors.email.message}</span>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">パスワード</label>
          <input
            {...register("password", {
              required: "パスワードは必須です．",
              minLength: {
                value: 6,
                message: "パスワードは6文字以上で入力してください．",
              },
            })}
            type="password"
            className="mt-1 border-2 border-gray-400 rounded-md w-full p-2"
          />
          {errors.password && (
            <span className="text-red-600 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            新規登録
          </button>
        </div>
        <div className="mt-4">
          <span className="text-gray-600 text-sm">
            既にアカウントをお持ちですか？
          </span>
          <Link
            href="/auth/login"
            className="text-blue-500 text-sm font-bold hover:text-blue-700"
          >
            ログイン
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
