import './globals.css'
import { Inter } from 'next/font/google'

export const metadata = {
  title: '肩叩き銀行',
  description: '肩叩き券を発行する機関',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  )
}
