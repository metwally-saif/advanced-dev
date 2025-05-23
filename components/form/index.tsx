"use client";

import va from "@vercel/analytics";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { genres } from "@/lib/schema";
import { cn } from "@/lib/utils";

import DatePicker from "./date-picker";
import SearchDropdown from "./search-dropdown";
import Uploader from "./uploader";

export default function Form({
  title,
  description,
  helpText,
  searchFunction,
  inputAttrs,
  handleSubmit,
}: {
  title: string;
  description: string;
  searchFunction?: any;
  helpText: string;
  inputAttrs: {
    name: string;
    type: React.HTMLInputTypeAttribute;
    defaultValue: string | number | any;
    placeholder?: string;
    maxLength?: number;
    pattern?: string;
  };
  handleSubmit: any;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const { update } = useSession();

  return (
    <form
      action={async (data: FormData) => {
        if (inputAttrs.name === "actorId" || inputAttrs.name === "directorId") {
          data.set(inputAttrs.name, selectedId || "");
        }
        if (inputAttrs.type === "date") {
          if (date) {
            data.set(inputAttrs.name, date.toISOString());
          } else {
            data.set(inputAttrs.name, "");
          }
        }
        handleSubmit(data, id, inputAttrs.name).then(async (res: any) => {
          if (res.error) {
            toast.error(res.error);
          } else {
            va.track(`Updated ${inputAttrs.name}`, id ? { id } : {});
            if (id) {
              router.refresh();
            } else {
              await update();
              router.refresh();
            }
            toast.success(`Successfully updated ${inputAttrs.name}!`);
          }
        });
      }}
      className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl dark:text-white">{title}</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {description}
        </p>
        {inputAttrs.type === "file" &&
        typeof inputAttrs.defaultValue === "string" ? (
          <Uploader
            defaultValue={inputAttrs.defaultValue}
            name={inputAttrs.name as "image" | "logo"}
          />
        ) : inputAttrs.name === "font" ? (
          <div className="flex max-w-sm items-center overflow-hidden rounded-lg border border-stone-600">
            <select
              title="Font"
              name="font"
              defaultValue={inputAttrs.defaultValue}
              className="w-full rounded-none border-none bg-white px-4 py-2 text-sm font-medium text-stone-700 focus:outline-none focus:ring-black dark:bg-black dark:text-stone-200 dark:focus:ring-white"
            >
              <option value="font-cal">Cal Sans</option>
              <option value="font-lora">Lora</option>
              <option value="font-work">Work Sans</option>
            </select>
          </div>
        ) : inputAttrs.type === "date" ? (
          <DatePicker
            {...inputAttrs}
            defaultValue={inputAttrs.defaultValue?.toString()}
            required={true}
            onSelect={(date: Date) => setDate(date)}
          />
        ) : inputAttrs.name === "description" ? (
          <textarea
            {...inputAttrs}
            rows={3}
            required
            className="w-full max-w-xl rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          />
        ) : inputAttrs.name === "actorId" ? (
          <SearchDropdown
            name="actorId"
            placeholder="Search actors..."
            defaultValue={inputAttrs.defaultValue.toString()}
            searchFunction={searchFunction}
            onSelect={(id) => setSelectedId(id)}
          />
        ) : inputAttrs.name === "directorId" ? (
          <SearchDropdown
            name="directorId"
            placeholder="Search directors..."
            defaultValue={inputAttrs.defaultValue.toString()}
            searchFunction={searchFunction}
            onSelect={(id) => setSelectedId(id)}
          />
        ) : inputAttrs.name === "genre" ? (
          <div className="flex max-w-sm items-center overflow-hidden rounded-lg border border-stone-600">
            <select
              {...inputAttrs}
              name="genre"
              defaultValue={inputAttrs.defaultValue}
              className="w-full rounded-none border-none bg-white px-4 py-2 text-sm font-medium text-stone-700 focus:outline-none focus:ring-black dark:bg-black dark:text-stone-200 dark:focus:ring-white"
            >
              <option value="">Select a genre</option>
              {genres.enumValues.map((genreValue) => (
                <option key={genreValue} value={genreValue}>
                  {genreValue}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input
            {...inputAttrs}
            required
            className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          />
        )}
      </div>
      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10 dark:border-stone-700 dark:bg-stone-800">
        <p className="text-sm text-stone-500 dark:text-stone-400">{helpText}</p>
        <FormButton />
      </div>
    </form>
  );
}

export function FormButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "flex h-8 w-32 items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
        pending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={pending}
    >
      {pending ? <LoadingDots color="#808080" /> : <p>Save Changes</p>}
    </button>
  );
}
