/* eslint-disable react/no-array-index-key */
import { redirect } from "next/navigation";
import { Suspense } from "react";

import MovieGallery from "@/components/movies";
import OverviewStats from "@/components/overview-stats";
import PlaceholderCard from "@/components/placeholder-card";
import { getSession } from "@/lib/auth";

export default async function Overview() {
  const session = await getSession();
  if (!session?.user || !session.user.isAdmin) {
    redirect("/app/login");
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Overview
        </h1>
        <OverviewStats />
      </div>

      <div className="flex flex-col space-y-6">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PlaceholderCard key={`${i}th`} />
              ))}
            </div>
          }
        />
      </div>

      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Recent Posts
        </h1>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <MovieGallery limit={8} />
        </Suspense>
      </div>
    </div>
  );
}
