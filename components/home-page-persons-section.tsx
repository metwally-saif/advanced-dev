import Image from "next/image";
import Link from "next/link";

import { SelectActor, SelectDirector } from "@/lib/schema";
import { placeholderBlurhash } from "@/lib/utils";

export default async function PersonsSection({
  personData,
  type,
}: {
  personData: Partial<SelectActor>[] | Partial<SelectDirector>[];
  type: string;
}) {
  return (
    <div className="my-10 w-full px-4 py-5 md:px-8 lg:px-16">
      <h2 className="mb-6 font-title text-3xl md:text-4xl dark:text-white">
        Most Popular {type}s
      </h2>

      {personData.length > 0 ? (
        <div className="flex space-x-6 overflow-x-auto">
          {personData.map((actor: any, _: number) => (
            <Link
              key={`${actor.name}`}
              href={`/${type}s/${actor.id}`}
              className="flex w-[100px] flex-shrink-0 flex-col items-center sm:w-[120px] md:w-[200px]"
            >
              {/* Circular Image */}
              <div className="relative h-44 w-44  overflow-hidden rounded-full">
                <Image
                  alt={actor.name ?? "Actor Image"}
                  src={actor.image ?? placeholderBlurhash}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Actor Name */}
              <h3 className="mt-2 text-center font-title text-sm text-stone-800 sm:text-base dark:text-white">
                {actor.name}
              </h3>

              {/* Optional short bio or tagline */}
              <p className="text-center text-xs text-stone-600 sm:text-sm dark:text-stone-300">
                {actor.bio || "Featured in multiple films"}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
            No {type}s yet.
          </p>
        </div>
      )}
    </div>
  );
}
