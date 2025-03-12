import type { SelectActor } from "@/lib/schema";;
import Link from "next/link";
import BlurImage from "./blur-image";

export default function ActorCard({
  data,
}: {
  data: SelectActor;
}) {
  const url = `/actors/${data.name}`;

  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
      <Link
        href={`/app/actor/${data.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
                        <div className="relative h-44 overflow-hidden">
                                  <BlurImage
                                    src={data.image!}
                                    alt={data.name ?? "director"}
                                    width={500}
                                    height={400}
                                    className="h-64 w-full object-cover"
                                  />
                        </div>
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
            {data.name}
          </h3>
          <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
            {data.age}
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
