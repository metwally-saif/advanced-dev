import { headers } from "next/headers";
import { getHomePageMovies } from "@/lib/fetchers";

export default async function Sitemap() {
  const headersList = headers();
  const domain =
    headersList
      .get("host")
      ?.replace("localhost:3000", `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)  ?? "";

  const movies = await getHomePageMovies();

  return [
    {
      url: `https://${domain}`,
      lastModified: new Date(),
    },
    ...movies.map(({ slug }) => ({
      url: `https://${domain}/movies/${slug}`,
      lastModified: new Date(),
    })),
  ];
}
