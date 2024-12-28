"use client"
import React from "react";
import Link from "next/link";

export default function FirstPage() {


  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  // return (
  //   <div className="w-full h-screen flex flex-col items-center justify-center" style={{backgroundImage: `url(/hh1.jpg)`}}>
  //     <h1 className="text-5xl pb-3 text-white font-bold text-center"> PingPong </h1>
  //     <Link href={`${url}/auth/42`}>
  //     <button
  //       className="block bg-zinc-200 px-6 py-3 rounded-lg font-bold">
  //       { "LET'S GO 🔥" }
  //     </button>
  //     </Link>
  //   </div>
  // );

  
  // return (
  //   <div
  //     className="w-full h-screen flex flex-col items-center justify-center"
  //     style={{ backgroundImage: `url(/hh1.jpg)` }}
  //   >
  //     <h1 className="text-5xl pb-3 text-white font-bold text-center">PingPong</h1>
      
  //     {/* 42 OAuth Button */}
  //     <Link href={`${url}/auth/42`}>
  //       <button className="flex items-center bg-zinc-200 px-6 py-3 rounded-lg font-bold gap-2">
  //         <img src="42_Logo.svg" alt="42 Logo" className="w-6 h-6" />
  //         {"Sign in"}
  //       </button>
  //     </Link>

      
  //   </div>
  // );
  
  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center"
      style={{ backgroundImage: `url(/hh1.jpg)` }}
    >
      <h1 className="text-5xl pb-3 text-white font-bold text-center">PingPong</h1>
      
      {/* 42 OAuth Button */}
      <Link href={`${url}/auth/42`}>
        <button className="flex items-center bg-zinc-200 px-6 py-3 rounded-lg font-bold gap-3 mb-4 text-lg">
          <img src="/42_logo.svg" alt="42 Logo" className="w-8 h-8" />
          {"Sign in"}
        </button>
      </Link>
      
      {/* Google OAuth Button */}
      <Link href={`${url}/auth/google`}>
        <button className="flex items-center bg-zinc-200 px-6 py-3 rounded-lg font-bold gap-3 text-lg">
          <img src="/google.svg" alt="Google Logo" className="w-8 h-8" />
          {"Sign in"}
        </button>
      </Link>
    </div>
  );
  
}





