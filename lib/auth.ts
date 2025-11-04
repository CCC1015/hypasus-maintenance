import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      const allowed = (process.env.ALLOWED_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)

      // Als er geen whitelist is, laat iedereen toe
      if (!allowed.length) return true

      const email = (user?.email || "").toLowerCase()
      const allowedUser = allowed.includes(email)

      console.log("Login attempt:", email, "=>", allowedUser)
      return allowedUser
    },
    async redirect({ url, baseUrl }) {
      // Forceer altijd terug naar home na login
      return baseUrl
    },
    async jwt({ token, account, user }) {
      if (account) token.accessToken = account.access_token
      if (user) token.email = user.email
      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        email: token.email,
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

export default authOptions
