import Link from "next/link";
import { placeholderBlurhash } from "@/lib/utils";
import Image from "next/image"
import { SelectActor, SelectDirector } from "@/lib/schema";

export default async function PersonsSection({ personData, type} : { personData: SelectActor[] | SelectDirector[], type: string}) {
  return (
    <div className="my-10 py-5 px-4 md:px-8 lg:px-16 w-full">
      <h2 className="mb-6 font-title text-3xl md:text-4xl dark:text-white">
        Most Popular {type}s
      </h2>

      {personData.length > 0 ? (
        <div className="flex overflow-x-auto space-x-6">
          {personData.map((actor: any, index: number) => (
            <Link
              key={index}
              href={`/${type ==='actor' ? 'actors' : 'directors'}/${actor.name}`}
              className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-[200px] flex flex-col items-center"
            >
              {/* Circular Image */}
              <div className="relative w-44 h-44  rounded-full overflow-hidden">
                <Image
                  alt={actor.name ?? "Actor Image"}
                  src={actor.image ?? placeholderBlurhash}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Actor Name */}
              <h3 className="mt-2 font-title text-sm sm:text-base text-stone-800 dark:text-white text-center">
                {actor.name}
              </h3>

              {/* Optional short bio or tagline */}
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 text-center">
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
  )
}
