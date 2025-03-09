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

export default async function SiteLayout({
  params,
  children,
}: {
  params: { domain: string };
  children: ReactNode;
}) {


  return (
    <div className="min-h-screen bg-white dark:bg-black dark:text-white">
      <div className="ease left-0 right-0 top-0 z-30 flex h-16 bg-white transition-all duration-150 dark:bg-black dark:text-white">
        <div className="mx-auto flex h-full max-w-screen-xl items-center justify-center space-x-5 px-10 sm:px-20">
          <Link href="/" className="flex items-center justify-center">
            <div className="inline-block h-8 w-8 overflow-hidden rounded-full align-middle">
              {/* <Image
                alt={data.name || ""}
                height={40}
                src={data.logo || ""}
                width={40}
              /> */}
            </div>
            <span className="ml-3 inline-block truncate font-title font-medium">
              {/* {data.name} */}
            </span>
          </Link>
        </div>
      </div>

      <div className="mt-20">{children}</div>
    </div>
  );
}
