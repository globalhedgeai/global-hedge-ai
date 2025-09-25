import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { AuthHeader } from "@/components/AuthHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Hedge",
  description: "Global Hedge Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body>
        <AuthHeader user={user} />
        {children}
      </body>
    </html>
  );
}