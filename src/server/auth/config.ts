import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../config/database";
import { UserRepository } from "../db/repositories/user.repository";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Received credentials:", credentials); // Debugging

        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email or password in credentials");
          return null;
        }

        // Fetch user from DB
        const foundUser = await UserRepository.findByEmail(credentials.email);
        if (!foundUser?.comparePassword) {
          // 👈 Using optional chaining
          console.error("User not found or comparePassword method missing");
          return null;
        }

        // Compare password
        const isPasswordValid = await foundUser.comparePassword(
          credentials.password,
        );
        if (!isPasswordValid) {
          console.error("Invalid password");
          return null;
        }

        console.log("User authenticated successfully:", foundUser.email);

        return {
          name: foundUser.name,
          lastName: foundUser.lastName,
          username: foundUser.username,
          email: foundUser.email,
          photo: foundUser.photo,
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
} satisfies NextAuthConfig;
