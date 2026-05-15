import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hot Stove · 2026 Fantasy League',
  description: '2026 Hot Stove Fantasy Baseball League Standings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
