import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    env: {

      //  NEXT_PUBLIC_BASE_URL:  "https://api.gudinatumsa.com",
       NEXT_PUBLIC_BASE_URL:  "http://localhost:3001",
        //NEXT_PUBLIC_BASE_URL: "https://api.gudinatumsa.com"

    },
};

export default nextConfig;
