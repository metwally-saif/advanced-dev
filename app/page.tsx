import { notFound } from "next/navigation";
import MoviesSection from "@/components/home-page-movies-section"
import PersonsSection from "@/components/home-page-persons-section"
import { getHomePageMovies, getHomePageActors, getHomePageDirectors } from "@/lib/fetchers";

export default async function HomePage() {
  const movieData = await getHomePageMovies()
  const actorData = await getHomePageActors()
  const directorData = await getHomePageDirectors()

  if (!movieData && !actorData && !directorData) {
    notFound();
  }

  return (
    <>
      <MoviesSection movieData={movieData} />
      <PersonsSection personData={actorData} type="actor" />
      <PersonsSection personData={directorData} type="director" />
    </>
  );
}
