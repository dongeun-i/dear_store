import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DearStore',
  description: '구매대행 올인원 허브',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
