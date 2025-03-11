import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Actors from "@/components/actors";
import CreateButton from "@/components/create-button";

export default async function ActorsOverview({
}: {
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }



  return (
    <>
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <h1 className="w-60 truncate font-cal text-xl font-bold sm:w-auto sm:text-3xl dark:text-white">
            All Actors
          </h1>
        </div>
        <CreateButton type="ACTOR"/>
      </div>
      <Actors />
    </>
  );
}