"use client"
import React from "react";
import Link from "next/link";

export default function FirstPage() {


  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center" style={{backgroundImage: `url(/hh1.jpg)`}}>
      <h1 className="text-5xl pb-3 text-white font-bold text-center"> PingPong </h1>
      <Link href={`${url}/auth/42`}>
      <button
        className="block bg-zinc-200 px-6 py-3 rounded-lg font-bold">
        { "LET'S GO 🔥" }
      </button>
      </Link>
    </div>
  );
}





