"use client";
import { Inter } from "next/font/google";
import Providers from "../../redux/store/Providers";
import LeftBar from "./../components/leftBar";
import React from "react";
import AuthWrapper from "../authWrapper";

const inter = Inter({ subsets: ["latin"] });

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <AuthWrapper>
        <div className="flex">

            <Providers>
              <LeftBar />
              {children}
            </Providers>
        </div>
      </AuthWrapper>
  );
}
export default RootLayout;
