import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "ShareLinks",
  description: "リンクを共有するためのアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AppProvider>
          <Header />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
