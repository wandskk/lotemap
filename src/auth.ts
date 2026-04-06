import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function normalizeEnv(value: string | undefined) {
  return (value ?? "").trim().replace(/\r$/, "");
}

const adminEmail = normalizeEnv(process.env.ADMIN_EMAIL);
const adminPassword = normalizeEnv(process.env.ADMIN_PASSWORD);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const rawEmail = String(credentials?.email ?? "").trim();
        const rawPassword = String(credentials?.password ?? "").trim();
        const parsed = signInSchema.safeParse({
          email: rawEmail,
          password: rawPassword,
        });
        if (!parsed.success) return null;

        if (!adminEmail || !adminPassword) return null;

        const emailOk =
          parsed.data.email.toLowerCase() === adminEmail.toLowerCase();
        const passwordOk = parsed.data.password === adminPassword;

        if (emailOk && passwordOk) {
          return {
            id: "bootstrap-admin",
            email: parsed.data.email,
            name: "Admin LoteMap",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string | null | undefined;
      }
      return session;
    },
  },
};
