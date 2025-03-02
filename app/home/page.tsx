import Link from "next/link";
import { notFound } from "next/navigation";
import BlurImage from "@/components/blur-image";
import { placeholderBlurhash, toDateString } from "@/lib/utils";
import BlogCard from "@/components/blog-card";
import { getHomePageMovies, getSiteData } from "@/lib/fetchers";
import Image from "next/image";
import db from "@/lib/db";

export async function generateStaticParams() {
  const allSites = await db.query.sites.findMany({
    // feel free to remove this filter if you want to generate paths for all sites
    where: (sites, { eq }) => eq(sites.subdomain, "demo"),
    columns: {
      subdomain: true,
      customDomain: true,
    },
  });

  const mainDomain = {
    domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
  };
  const allPaths = allSites
    .flatMap(({ subdomain, customDomain }) => [
      subdomain && {
        domain: `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
      },
      customDomain && {
        domain: customDomain,
      },
    ])
    .filter(Boolean);

  return [mainDomain, ...allPaths];
}

export default async function SiteHomePage() {
  const movieData = await getHomePageMovies()

  if (!movieData) {
    notFound();
  }

  return (
    <>
      <div className="mb-20 w-full">
        {movieData.length > 0 ? (
          <div className="mx-auto w-full max-w-screen-xl md:mb-28 lg:w-5/6">
            <Link href={`/app/${movieData[0].slug}`}>
              <div className="group relative mx-auto h-80 w-full overflow-hidden sm:h-150 lg:rounded-xl">
                <BlurImage
                  alt={movieData[0].title ?? ""}
                  blurDataURL={movieData[0].imageBlurhash ?? placeholderBlurhash}
                  className="h-full w-full object-cover group-hover:scale-105 group-hover:duration-300"
                  width={1300}
                  height={630}
                  placeholder="blur"
                  src={movieData[0].image ?? "/placeholder.png"}
                />
              </div>
              <div className="mx-auto mt-10 w-5/6 lg:w-full">
                <h2 className="my-10 font-title text-4xl md:text-6xl dark:text-white">
                  {movieData[0].title}
                </h2>
                <p className="w-full text-base md:text-lg lg:w-2/3 dark:text-white">
                  {movieData[0].description}
                </p>
                <div className="flex w-full items-center justify-start space-x-4">
                  <div className="relative h-8 w-8 flex-none overflow-hidden rounded-full">
                    {movieData.user?.image ? (
                      <BlurImage
                        alt={movieData.user?.name ?? "User Avatar"}
                        width={100}
                        height={100}
                        className="h-full w-full object-cover"
                        src={movieData.user?.image}
                      />
                    ) : (
                      <div className="absolute flex h-full w-full select-none items-center justify-center bg-stone-100 text-4xl text-stone-500">
                        ?
                      </div>
                    )}
                  </div>
                  <p className="ml-3 inline-block whitespace-nowrap align-middle text-sm font-semibold md:text-base dark:text-white">
                    {movieData.user?.name}
                  </p>
                  <div className="h-6 border-l border-stone-600 dark:border-stone-400" />
                  <p className="m-auto my-5 w-10/12 text-sm font-light text-stone-500 md:text-base dark:text-stone-400">
                    {toDateString(movieData[0].createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Image
              alt="missing post"
              src="https://illustrations.popsy.co/gray/success.svg"
              width={400}
              height={400}
              className="dark:hidden"
            />
            <Image
              alt="missing post"
              src="https://illustrations.popsy.co/white/success.svg"
              width={400}
              height={400}
              className="hidden dark:block"
            />
            <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
              No posts yet.
            </p>
          </div>
        )}
      </div>

      {movieData.length > 1 && (
        <div className="mx-5 mb-20 max-w-screen-xl lg:mx-24 2xl:mx-auto">
          <h2 className="mb-10 font-title text-4xl md:text-5xl dark:text-white">
            More stories
          </h2>
          <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
            {movieData.slice(1).map((metadata: any, index: number) => (
              <BlogCard key={index} data={metadata} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
