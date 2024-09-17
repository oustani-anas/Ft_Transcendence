
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from "../redux/store/Providers";
import React from "react";
import { Toaster } from 'sonner';
import SocketInitializer from './socket';

const inter = Inter({ subsets: ['latin'] })

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
          <Providers>
            <SocketInitializer/>
            {children}
            <Toaster richColors closeButton/>
          </Providers>
      </body>
    </html>
  )
}

export default RootLayout;
