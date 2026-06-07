const isStaticExport = process.env.STATIC_EXPORT === 'true'
const basePath = process.env.NEXT_BASE_PATH || ''

/** @type {import('next').NextConfig} */
const nextConfig = {
    ...(isStaticExport
        ? {
              output: 'export',
              trailingSlash: true,
              images: {
                  unoptimized: true
              }
          }
        : {
              async headers() {
                  return [
                      {
                          source: '/api/gdpr/audit',
                          headers: [
                              {
                                  key: 'Access-Control-Allow-Origin',
                                  value: '*'
                              },
                              {
                                  key: 'Access-Control-Allow-Methods',
                                  value: 'GET, POST, OPTIONS'
                              },
                              {
                                  key: 'Access-Control-Allow-Headers',
                                  value: 'Content-Type, x-gdpr-user-id, x-client-ip'
                              }
                          ]
                      }
                  ]
              }
          }),
    ...(basePath
        ? {
              basePath,
              assetPrefix: `${basePath}/`
          }
        : {})
}

module.exports = nextConfig
