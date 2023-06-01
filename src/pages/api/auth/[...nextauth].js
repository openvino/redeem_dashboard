import NextAuth from "next-auth";
import { utils } from "ethers";
import CredentialsProvider from "next-auth/providers/credentials";
import { checkAuth } from "../controllers/authContoller";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        address: {
          label: "Address",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        if (!Boolean(utils.getAddress(credentials?.address))) {
          return null;
        }
        const isValid = await checkAuth(utils.getAddress(credentials?.address));
        if (isValid)
          return {
            id: credentials?.address,
          };
        else return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    algorithm : 'HS256'
  },
  callbacks: {
    async session({ session, token }) {
      session.address = token.sub;
      const isValid = await checkAuth(token.sub);

      if (isValid) {
        return session;
      } else {
        return null;
      }
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
    newUser: "/",
  },
});
