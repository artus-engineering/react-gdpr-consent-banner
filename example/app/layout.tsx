import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'GDPR Cookie Consent Example',
    description: 'Next.js example for GDPR-compliant cookie consent with audit trail'
}

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
