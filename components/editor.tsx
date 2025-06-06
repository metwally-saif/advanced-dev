"use client";

import { ExternalLink } from "lucide-react";
import { Editor as NovelEditor } from "novel";
import { useEffect, useState, useTransition } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";

import { updateMovie, updateMovieMetadata } from "@/lib/actions";
import type { SelectMovie } from "@/lib/schema";
import { cn } from "@/lib/utils";

import LoadingDots from "./icons/loading-dots";

export default function Editor({ movie }: { movie: SelectMovie }) {
  const [isPendingSaving, startTransitionSaving] = useTransition();
  const [isPendingPublishing, startTransitionPublishing] = useTransition();
  const [data, setData] = useState<SelectMovie>(movie);

  // listen to CMD + S and override the default behavior
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "s") {
        e.preventDefault();
        startTransitionSaving(async () => {
          await updateMovie(data);
        });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [data, startTransitionSaving]);

  return (
    <>
      <div className="relative min-h-[500px] w-full max-w-screen-lg border-stone-200 p-12 px-8 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg dark:border-stone-700">
        <div className="absolute right-5 top-5 mb-5 flex items-center space-x-3">
          {data.published && (
            <a
              href={`/movies/${movie.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm text-stone-400 hover:text-stone-500"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <div className="rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400 dark:bg-stone-800 dark:text-stone-500">
            {isPendingSaving ? "Saving..." : "Saved"}
          </div>
          <button
            type="button"
            onClick={() => {
              const formData = new FormData();
              // eslint-disable-next-line no-console
              console.log(data.published, typeof data.published);
              formData.append("published", String(!data.published));
              startTransitionPublishing(async () => {
                await updateMovieMetadata(formData, movie.id, "published").then(
                  () => {
                    toast.success(
                      `Successfully ${
                        data.published ? "unpublished" : "published"
                      } your post.`,
                    );
                    setData((prev) => ({
                      ...prev,
                      published: !prev.published,
                    }));
                  },
                );
              });
            }}
            className={cn(
              "flex h-7 w-24 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none",
              isPendingPublishing
                ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                : "border border-black bg-black text-white hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
            )}
            disabled={isPendingPublishing}
          >
            {isPendingPublishing ? (
              <LoadingDots />
            ) : (
              <p>{data.published ? "Unpublish" : "Publish"}</p>
            )}
          </button>
        </div>
        <div className="mb-5 flex flex-col space-y-3 border-b border-stone-200 pb-5 dark:border-stone-700">
          <input
            type="text"
            placeholder="Title"
            defaultValue={movie?.title || ""}
            autoFocus
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="dark:placeholder-text-600 border-none px-0 font-cal text-3xl placeholder:text-stone-400 focus:outline-none focus:ring-0 dark:bg-black dark:text-white"
          />
          <TextareaAutosize
            placeholder="Description"
            defaultValue={movie?.description || ""}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className="dark:placeholder-text-600 w-full resize-none border-none px-0 placeholder:text-stone-400 focus:outline-none focus:ring-0 dark:bg-black dark:text-white"
          />
        </div>
        <NovelEditor
          className="relative block"
          defaultValue={movie?.content || undefined}
          onUpdate={(editor) => {
            setData((prev) => ({
              ...prev,
              content: editor?.storage.markdown.getMarkdown(),
            }));
          }}
          onDebouncedUpdate={() => {
            if (
              data.title === movie.title &&
              data.description === movie.description &&
              data.content === movie.content
            ) {
              return;
            }
            startTransitionSaving(async () => {
              await updateMovie(data);
            });
          }}
        />
      </div>
    </>
  );
}
