import Link from "next/link";
import { placeholderBlurhash, toDateString } from "@/lib/utils";
import Image from "next/image";
import { SelectUser } from "@/lib/schema";

interface MoviesSectionProps {
  movieData: MovieData[]
}

interface MovieData {
  title: string | null;
  description: string | null;
  slug: string;
  image: string | null;
  createdAt: Date;
  user: SelectUser | null;
}

export default async function MoviesSection({ movieData }: MoviesSectionProps) {


  return (
    <>
      <div className="my-10 py-5 px-4 md:px-8 lg:px-16 w-full">
      {movieData.length > 0 ? (
          <div className="flex flex-col lg:flex-row w-full gap-8">
            {/* Main featured movie - left side taking 2/3 width */}
            <div className="lg:w-2/3 flex-shrink-0">
              <Link href={`/movies/${movieData[0].slug}`} className="block">
                <div className="group relative h-[32rem] w-full overflow-hidden rounded-xl">
                  <Image
                    alt={movieData[0].title ?? "Movie Image"}
                    src={movieData[0].image ?? placeholderBlurhash}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Title overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <div className="absolute bottom-0 p-6 w-full">
                      <h2 className="font-title text-3xl md:text-5xl text-white mb-3 drop-shadow-lg">
                        {movieData[0].title}
                      </h2>
                      <p className="text-sm md:text-base text-white/90 line-clamp-2 mb-3 drop-shadow-md">
                        {movieData[0].description}
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="relative h-8 w-8 flex-none overflow-hidden rounded-full bg-white/10 backdrop-blur">
                          {movieData[0].user?.image ? (
                            <Image
                              alt={movieData[0].user?.name ?? "User Avatar"}
                              width={100}
                              height={100}
                              className="h-full w-full object-cover"
                              src={movieData[0].user?.image}
                            />
                          ) : (
                            <div className="absolute flex h-full w-full select-none items-center justify-center text-white">
                              ?
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-white/90">
                          {movieData[0].user?.name}
                        </p>
                        <div className="h-4 border-l border-white/40" />
                        <p className="text-xs text-white/70">
                          {toDateString(movieData[0].createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* More movies - right side taking 1/3 width */}
            {movieData.length > 1 && (
              <div className="lg:w-1/3 flex-grow">
                <h2 className="mb-4 font-title text-2xl md:text-3xl dark:text-white">
                  More Movies
                </h2>
                <div className="grid grid-cols-1 gap-4 h-[32rem] overflow-hidden">
                  {movieData.slice(1, 4).map((metadata: any, index: number) => (
                    <Link
                      key={index}
                      href={`/movies/${metadata.slug}`}
                      className="block relative h-[10rem] overflow-hidden rounded-lg"
                    >
                      <Image
                        alt={metadata.title ?? "Movie Image"}
                        src={metadata.image ?? placeholderBlurhash}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 flex items-end">
                        <div className="p-3">
                          <h3 className="font-title text-lg text-white drop-shadow-md">
                            {metadata.title}
                          </h3>
                          <p className="text-xs text-white/80 line-clamp-1">
                            {metadata.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
              No Movies yet.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
