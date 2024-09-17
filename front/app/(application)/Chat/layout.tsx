'use client'
import { Inter } from 'next/font/google'
import Providers from "../../../redux/store/Providers"
import React from 'react'
import FriendsAndGroups from '@/app/components/chatComponents/friendsAndGroups'
import AuthWrapper from '@/app/authWrapper'
const inter = Inter({ subsets: ['latin'] })

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper>
      <Providers>
          <FriendsAndGroups/>
          {children}
      </Providers>
    </AuthWrapper>
  )
}
export default RootLayout