import "next-auth";
declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      email?: string | null;
      role?: "USER" | "ADMIN";
    };
  }
  interface User {
    id: string;
    email: string;
    role: "USER" | "ADMIN";
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
  }
}
