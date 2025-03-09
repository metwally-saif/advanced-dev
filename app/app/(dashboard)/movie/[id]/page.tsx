import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Editor from "@/components/editor";
import db from "@/lib/db";

export default async function PostPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const data = await db.query.Movies.findFirst({
    where: (Movies, { eq }) => eq(Movies.id, decodeURIComponent(params.id)),
  });
  if (!data || data.userId !== session.user.id) {
    notFound();
  }

  return <Editor movie={data} />;
}
