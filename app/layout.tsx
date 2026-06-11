import type { Metadata } from 'next'
import { Gaegu } from 'next/font/google'
import './globals.css'

const gaegu = Gaegu({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-gaegu',
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
    <html lang="ko" className={gaegu.variable}>
      <body>{children}</body>
    </html>
  )
}
