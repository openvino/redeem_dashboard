import NextAuth from "next-auth";
import { utils } from "ethers";
import CredentialsProvider from "next-auth/providers/credentials";
import { checkAuth, isAdmin } from "../controllers/authContoller";
import { getAdmin } from "../controllers/adminController";

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
        const isValid = await checkAuth(credentials?.address);
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
    algorithm: "HS256",
  },
  callbacks: {
    async session({ session, token }) {
      try {
        // Aquí puedes realizar validaciones personalizadas o manejar errores
        session.address = token.sub;
        const isValid = await checkAuth(token.sub);

        const admin = await getAdmin(token.sub);

        if (isValid) {
          const isAdminCheck = await isAdmin(token.sub);
          if (isAdminCheck) {
            session.is_admin = true;
            session.winery_id = admin.winery_id
          } else {
            session.is_admin = false;
            session.winery_id = admin.winery_id
          }
        } else {
          // Manejo de error personalizado si la autenticación falla
          throw new Error("Autenticación fallida");
        }

        return session;
      } catch (error) {
        // Manejo de errores
        console.error("Error de autenticación:", error);
        return null; // Puedes retornar null o tomar otra acción adecuada en caso de error
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
