import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import * as bcrypt from "bcrypt";
import { prisma } from "../../../utils/primsa";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        if (user) {
          if (bcrypt.compareSync(credentials.password, user.password)) {
            return user;
          } else return null;
        } else return null;
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3000,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id && user?.role) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.id = token.id;
      session.role = token.role;
      return session;
    },
  },
  secret: process.env.NEXT_SECRET,
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/",
  },
});
