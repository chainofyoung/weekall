import type { Metadata } from 'next'
import { Jua } from 'next/font/google'
import './globals.css'

const jua = Jua({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jua',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '냉장고 구조대 — 일주일 식단 자동 생성',
  description: '냉장고 재료로 만드는 나만의 일주일 식단',
  icons: { icon: '/weekall.png', apple: '/weekall.png' },
  openGraph: {
    title: '냉장고 구조대',
    description: '냉장고 재료로 만드는 나만의 일주일 식단',
    images: ['/weekall.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={jua.variable}>
      <body>{children}</body>
    </html>
  )
}
