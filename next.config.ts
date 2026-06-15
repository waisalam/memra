import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@prisma/client',
    '.prisma/client',
    '@xenova/transformers',
    '@auth/prisma-adapter',
    '@auth/core',
    'sharp', // moved here from webpack externals
  ],
  turbopack: {}, // silences the error, Turbopack ignores webpack config
  webpack: (
    config: {
      externals: unknown[]
      resolve: { fallback: Record<string, boolean> }
    },
    { isServer }: { isServer: boolean }
  ) => {
    config.externals = [...(config.externals ?? []), 'sharp']

    if (isServer) {
      const nodeBuiltinHandler = (
        data: { request?: string },
        callback: (err?: null, result?: string) => void
      ) => {
        if (data.request?.startsWith('node:')) {
          return callback(null, `commonjs ${data.request}`)
        }
        callback()
      }
      config.externals = [...(config.externals ?? []), nodeBuiltinHandler]
    }

    return config
  },
}

export default nextConfig