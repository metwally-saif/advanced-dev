import { Link } from "@/components/link";
import type { SelectMovie } from "@/lib/schema";
import { toDateString } from "@/lib/utils";

import BlurImage from "./blur-image";

interface MovieCardProps {
  data: Pick<
    SelectMovie,
    "slug" | "image" | "title" | "description" | "createdAt"
  >;
}

export default function MovieCard({ data }: MovieCardProps) {
  return (
    <Link href={`/movies/${data.slug}`}>
      <div className="ease overflow-hidden rounded-2xl border-2 border-stone-100 bg-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-stone-800">
        <BlurImage
          src={data.image ?? "/placeholder.png"}
          alt={data.title ?? "Blog Post"}
          width={500}
          height={400}
          className="h-64 w-full object-cover"
        />
        <div className="h-36 border-t border-stone-200 px-5 py-8 dark:border-stone-700 dark:bg-black">
          <h3 className="font-title text-xl tracking-wide dark:text-white">
            {data.title}
          </h3>
          <p className="text-md my-2 truncate italic text-stone-600 dark:text-stone-400">
            {data.description}
          </p>
          <p className="my-2 text-sm text-stone-600 dark:text-stone-400">
            Published {toDateString(data.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
