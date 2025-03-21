import { notFound } from "next/navigation";
import { getMovieData } from "@/lib/fetchers";
import MovieCard from "@/components/movie-card";
import BlurImage from "@/components/blur-image";
import MDX from "@/components/mdx";
import { toDateString } from "@/lib/utils";
import db from "@/lib/db";
import { Movies } from "@/lib/schema";
import { isNotNull } from "drizzle-orm";

export async function generateMetadata({
  params,
}: {
  params: {slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug);
  const data = await getMovieData(slug)

  if (!data) {
    return null;
  }
  const { title, description } = data;

  return {
    title,
    description,
    image: data.image,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: data.user?.name,
      image: data.image,
    },
  };
}

export async function generateStaticParams() {
  try {
  const allPosts = await db
    .select({
      slug: Movies.slug
    })
    .from(Movies)
    .where(isNotNull(Movies.slug));

  const allPaths = allPosts
    .flatMap(({ slug }) => [
      slug && {
        domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
        slug: slug,
      },
    ])
    .filter(Boolean);

    return allPaths;
  }catch (error) {
      console.error("Error searching movies:", error);
      return [];
    }

}

export default async function MovieDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug);
    const data = await getMovieData(slug);

  if (!data) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="m-auto w-full text-center md:w-7/12">
          <p className="m-auto my-5 w-10/12 text-sm font-light text-stone-500 md:text-base dark:text-stone-400">
            {toDateString(data.createdAt ?? new Date())}
          </p>
          <h1 className="mb-10 font-title text-3xl font-bold text-stone-800 md:text-6xl dark:text-white">
            {data.title}
          </h1>
          <p className="mb-10 text-md m-auto w-10/12 text-stone-600 md:text-lg dark:text-stone-400">
            {data.description}
          </p>
        </div>
      </div>
      <div className="relative m-auto mb-10 h-80 w-full max-w-screen-lg overflow-hidden md:mb-20 md:h-150 md:w-5/6 md:rounded-2xl lg:w-2/3">
        <BlurImage
          alt={data.title ?? "Post image"}
          width={1200}
          height={630}
          className="h-full w-full object-cover"
          src={data.image ?? "/placeholder.png"}
        />
      </div>

      <MDX source={data.mdxSource} />

      {data.adjacentPosts.length > 0 && (
        <div className="relative mb-20 mt-10 sm:mt-20">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-stone-300 dark:border-stone-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-stone-500 dark:bg-black dark:text-stone-400">
              Continue Reading
            </span>
          </div>
        </div>
      )}
      {data.adjacentPosts && (
        <div className="mx-5 mb-20 grid max-w-screen-xl grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:mx-auto xl:grid-cols-3">
          {data.adjacentPosts.map((data: any, index: number) => (
            <MovieCard key={index} data={data} />
          ))}
        </div>
      )}
    </>
  );
}
