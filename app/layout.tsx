import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";

import ClientNav from "@/components/client-nav";
import { cn } from "@/lib/utils";
import { cal, inter } from "@/styles/fonts";

import { Providers } from "./providers";

const title = "Movies database with Next.js, Prisma, and PostgreSQL";
const description =
  "movies database with authentication, CRUD operations, and analytics. Built by Saif";
const image = "https://vercel.pub/thumbnail.png";

export const metadata: Metadata = {
  title,
  description,
  icons: ["https://vercel.pub/favicon.ico"],
  openGraph: {
    title,
    description,
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
    creator: "@vercel",
  },
  metadataBase: new URL("https://vercel.pub"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(cal.variable, inter.variable)}>
        <Providers>
          <ClientNav />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
