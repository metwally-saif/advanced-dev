import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import Image from "next/image";
import { redirect } from "next/navigation";
import ActorCard from "./actor-card";

export default async function Actors({
  limit,
}: {
  limit?: number;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/app/login");
  }

  const ActorList = await db.query.actor.findMany({
    orderBy: (actor, { desc }) => desc(actor.name),
    ...(limit ? { limit } : {}),
  });

  return ActorList.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ActorList.map((actor) => (
        <ActorCard key={actor.id} data={actor} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center space-x-4">
      <h1 className="font-cal text-4xl">No Actors</h1>
      <Image
        alt="missing actor"
        src="https://illustrations.popsy.co/gray/graphic-design.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        No actors yet.
      </p>
    </div>
  );
}
