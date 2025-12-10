import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Analytics from '../components/Analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spotify Stats Analyzer',
  description: 'Analiza tu historial de reproducción de Spotify',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Analytics />
        <div className="min-h-screen relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
