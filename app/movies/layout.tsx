import Link from "next/link";
import { ReactNode } from "react";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { domain: string };
}): Promise<Metadata | null> {
  const domain = decodeURIComponent(params.domain);

  return {
    title: "Movies Database",
    description: "A database of movies",
    openGraph: {
      title: "Movies Database",
      description: "A database of movies",
      images: [
        {
          url: "https://og-image.vercel.app/Movies%20Database.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fwww.pngkey.com%2Fpng%2Fdetail%2F12-124634_movie-icon-png-movie-icon-png.png",
          width: 1200,
          height: 630,
          alt: "Movies Database",
        },
      ],
    },
    metadataBase: new URL(`https://${domain}`),
  };
}

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {


  return (
    <div className="min-h-screen bg-white dark:bg-black dark:text-white">
      <div className="mt-20">{children}</div>
    </div>
  );
}
