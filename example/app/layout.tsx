import './globals.css'
import { LangAttribute } from '@/components/LangAttribute'
import { getRootRedirectScript } from '@/lib/i18n/root-redirect-script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: getRootRedirectScript()
                    }}
                />
            </head>
            <body>
                <LangAttribute />
                {children}
            </body>
        </html>
    )
}
