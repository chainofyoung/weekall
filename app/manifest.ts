import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '냉장고 구조대',
    short_name: '냉장고구조대',
    description: '냉장고 재료로 일주일 식단을 만들어드려요',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F0E4',
    theme_color: '#F5F0E4',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/weekall.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
