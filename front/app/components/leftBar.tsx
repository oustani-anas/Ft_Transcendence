"use client";
import { profilePersistor } from "@/redux/store/store";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store/store";

export default function LeftBar() {
  const socket = useSelector((state: RootState) => state.socket.socket);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const router = useRouter();

  const logout = async () => {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    try {
      await axios.get(`${url}/auth/logout`, {withCredentials: true});
      socket.emit("customDisco")
      router.push("/");
      await profilePersistor.purge();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (

    <div
      className={`fixed z-[1000] h-screen sidebar  flex flex-col justify-between items-center transition-all duration-300 ${
        isSidebarOpen ? "w-full backdrop-blur-[4px]" : "-translate-x-full"
      } lg:w-20 lg:translate-x-0 lg:flex lg:relative lg
      :z-1 md:h-screen`}
    >
      <div
        className={`sidebar bg-[#6E7AAE] left-0  w-20 h-full flex flex-col  justify-between items-center ${
          isSidebarOpen ? "absolute lg:relative" : "hidden lg:flex"
        }`}
      >
        <Link href={"./../../Profile"}>
          <div>
            <Image
              src="/images/ping_pong.png"
              alt="logo"
              width={160}
              height={60}
              priority={true}
              className="md:mt-[0%] mt-[55%]"
            />
          </div>
        </Link>
        <div className="flex flex-col gap-20 items-center justify-center">
          <Link href="./../../Profile">
            <div className="w-[50px] h-[50px] overflow-hidden relative rounded-full flex items-center justify-center ">
              <Image
                src="../../../images/Profile.svg"
                alt="logo"
                width={35}
                height={35}
                property="true"
                className="absolute object-cover"
              />
            </div>
          </Link>
          <Link href="./../../Chat">
            <div className="w-[50px] h-[50px] overflow-hidden relative rounded-full flex items-center justify-center ">
              <Image
                src="../../../images/Chat.svg"
                alt="logo"
                width={32}
                height={32}
                property="true"
                className="absolute object-cover"
              />
            </div>
          </Link>
          <Link href="./../../game">
            <div className="w-[50px] h-[50px] overflow-hidden relative rounded-full flex items-center justify-center ">
              <Image
                src="../../../images/Game.svg"
                alt="logo"
                width={32}
                height={32}
                property="true"
                className="absolute object-cover"
              />
            </div>
          </Link>

          <Link href="./../../Settings">
            <div className="w-[50px] h-[50px] overflow-hidden relative rounded-full flex items-center justify-center ">
              <Image
                src="/../../../setting.svg"
                alt="logo"
                width={35}
                height={35}
                property="true"
                className="absolute object-cover"
              />
            </div>
          </Link>
        </div>
        <div className="pb-[55%] ">
          <button onClick={logout}>
            <Image
              src="../../../images/Login.svg"
              alt="logo"
              width={35}
              height={35}
            />
          </button>
        </div>
      </div>
      <button
        className={
          isSidebarOpen
            ? `lg:hidden p-3 absolute left-[20px]`
            : `lg:hidden pt-14 absolute left-[20px]`
        }
        onClick={toggleSidebar}
        style={{ zIndex: 1 }}
      >
        {isSidebarOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              fill="black"
              d="M4 4h16c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1zm0 6h16c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1zm0 6h16c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              fill="black"
              d="M4 6h16c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1zm0 4h16c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1zm0 4h16c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
