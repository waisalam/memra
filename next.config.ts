import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@prisma/client',
    '.prisma/client',
    '@auth/prisma-adapter',
    '@auth/core',
    // Removed @xenova/transformers — no longer used
    // Removed sharp from here — handled in webpack below
  ],
  turbopack: {},
  webpack: (
    config: {
      externals: unknown[]
      resolve: { fallback: Record<string, boolean> }
    },
    { isServer }: { isServer: boolean }
  ) => {
    // Exclude packages that cause build issues
    config.externals = [
      ...(config.externals ?? []),
      'sharp',
      '@xenova/transformers', // keep here so webpack doesn't try to bundle it
    ]

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