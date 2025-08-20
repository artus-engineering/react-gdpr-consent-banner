/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
    // Enable middleware
    async headers() {
        return [
            {
                source: '/api/gdpr/audit',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, x-gdpr-user-id, x-client-ip',
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig
