/** @type {import('next').NextConfig} */

export const nextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com"], // firebase storageからの画像表示を許可
  },
};

export default nextConfig;
