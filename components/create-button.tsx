"use client";

import va from "@vercel/analytics";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import LoadingDots from "@/components/icons/loading-dots";
import { createActor, createDirector, createMovie } from "@/lib/actions";
import { cn } from "@/lib/utils";

export default function CreateButton({
  type,
}: {
  type: "ACTOR" | "MOVIE" | "DIRECTOR";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          const entity =
            type === "ACTOR"
              ? createActor
              : type === "DIRECTOR"
                ? createDirector
                : createMovie;
          const res = await entity(new FormData());
          va.track(`Create ${type}`);
          router.refresh();
          if ("id" in res) {
            router.push(`/app/${type.toLowerCase()}/${res.id}`);
          } else {
            // Handle error case
            // eslint-disable-next-line no-console
            console.error(res.error);
          }
        })
      }
      className={cn(
        "flex h-8 w-36 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none sm:h-9",
        isPending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border border-black bg-black text-white hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={isPending}
    >
      {isPending ? (
        <LoadingDots color="#808080" />
      ) : (
        <p>Create {type.charAt(0) + type.slice(1).toLowerCase()}</p>
      )}
    </button>
  );
}
