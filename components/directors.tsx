import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import Image from "next/image";
import { redirect } from "next/navigation";
import DirectorsCard from "./director-card";

export default async function Directors({
  limit,
}: {
  limit?: number;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/app/login");
  }

  const Directors = await db.query.director.findMany({
    orderBy: (director, { desc }) => desc(director.name),
    ...(limit ? { limit } : {}),
  });

  return Directors.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Directors.map((director) => (
        <DirectorsCard key={director.id} data={director} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center space-x-4">
      <h1 className="font-cal text-4xl">No Directors</h1>
      <Image
        alt="missing post"
        src="https://illustrations.popsy.co/gray/graphic-design.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        No directors yet.
      </p>
    </div>
  );
}
