import type { SelectMovie } from "@/lib/schema";;
import Link from "next/link";
import BlurImage from "./blur-image";

export default function MovieCard({
  data,
}: {
  data: SelectMovie;
}) {
  const url = `/movies/${data.slug}`;

  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
      <Link
        href={`/app/movie/${data.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <div className="relative h-44 overflow-hidden">
                  <BlurImage
                    src={data.image! ?? ""}
                    alt={data.title ?? "movie"}
                    width={500}
                    height={400}
                    className="h-64 w-full object-cover"
                  />
          {!data.published && (
            <span className="absolute bottom-2 right-2 rounded-md border border-stone-200 bg-white px-3 py-0.5 text-sm font-medium text-stone-600 shadow-md">
              Draft
            </span>
          )}
        </div>
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white dark:text-white">
            {data.title}
          </h3>
          <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
            {data.description}
          </p>
        </div>
      </Link>
      <div className="absolute bottom-4 flex w-full px-4">
        <Link
          href={url}
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          {url} ↗
        </Link>
      </div>
    </div>
  );
}
