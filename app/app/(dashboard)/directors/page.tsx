import { redirect } from "next/navigation";

import CreateButton from "@/components/create-button";
import Directors from "@/components/directors";
import { getSession } from "@/lib/auth";

export default async function DirectorsList({}: {}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <h1 className="w-60 truncate font-cal text-xl font-bold sm:w-auto sm:text-3xl dark:text-white">
            All Directors
          </h1>
        </div>
        <CreateButton type="DIRECTOR" />
      </div>
      <Directors />
    </>
  );
}
