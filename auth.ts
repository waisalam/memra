import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { prisma } from '@/lib/prisma'
import { authConfig } from './auth.config'
import type { JWT } from 'next-auth/jwt'
import type { User } from 'next-auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // JWT strategy (set in authConfig) means sessions are JWTs, not DB rows.
  // The adapter is still used for user/account/verificationToken storage.
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: 'Memra <hello@memra.dev>',
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user }: { token: JWT; user?: User }) {
      // On first sign-in user is populated — store our DB id in the token
      if (user) {
        token.id = user.id
        token.plan = (user as any).plan ?? 'free'
      }
      return token
    },

    async session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        session.user.id = (token.id as string) ?? ''
        session.user.plan = (token.plan as string) ?? 'free'
      }
      return session
    },
  },
})
