"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
// import Verify2Fau from "./QRcode/page"; // Updated import statement
import { Verify } from "crypto";
import QRcode from "./components/settings/QRcode";
import { url } from "inspector";

export default function FirstPage() {


  return (
    <div className="w-full h-screen flex flex-col items-center justify-center" style={{backgroundImage: `url(/hh1.jpg)`}}>
      <h1 className="text-5xl pb-3 text-white font-bold text-center"> PingPong </h1>
      <Link href={"http://localhost:4000/auth/42"}>
      {/* <Link href="/QRcode"> */}
      <button
        className="block bg-zinc-200 px-6 py-3 rounded-lg font-bold">
        { "LET'S GO 🔥" }
      </button>
      </Link>
    </div>
  );
}





