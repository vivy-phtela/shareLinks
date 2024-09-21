"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { auth } from "../../../firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Inputs = {
  email: string;
  password: string;
};

const Login = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onsubmit: SubmitHandler<Inputs> = async (data) => {
    await signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        router.push("/home");
      })
      .catch((error) => {
        if (error.code === "auth/invalid-credential") {
          alert("無効なメールアドレスまたはパスワードです．");
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
        <h1 className="mb-4 text-2xl font-bold">ログイン</h1>
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
            ログイン
          </button>
        </div>
        <div className="mt-4">
          <span className="text-gray-600 text-sm">
            初めてご利用の方ですか？
          </span>
          <Link
            href="/auth/register"
            className="text-blue-500 text-sm font-bold hover:text-blue-700"
          >
            新規登録
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
