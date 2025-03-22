import { notFound, redirect } from "next/navigation";

import Form from "@/components/form";
import DeleteForm from "@/components/form/delete-form";
import PersonsList from "@/components/persons-list";
import {
  addActorToMovie,
  addDirectorToMovie,
  removeActorFromMovie,
  removeDirectorFromMovie,
  updateMovieMetadata,
} from "@/lib/actions";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { getMovieActors, getMovieDirectors } from "@/lib/fetchers";
import {
  searchActorsByName,
  searchDirectorsByName,
} from "@/lib/search-functions";

export default async function MovieSettingsPage({
  params,
}: {
  params: { id: string };
}) {
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
  const actors = await getMovieActors(data.id);
  const directors = await getMovieDirectors(data.id);
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-6">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Movie Settings
        </h1>
        <Form
          title="Post Slug"
          description="The slug is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens."
          helpText="Please use a slug that is unique to this Movie."
          inputAttrs={{
            name: "slug",
            type: "text",
            defaultValue: data?.slug!,
            placeholder: "slug",
          }}
          handleSubmit={updateMovieMetadata}
        />

        <Form
          title="Thumbnail image"
          description="The thumbnail image for your Movie"
          helpText="Please use a high-quality image url."
          inputAttrs={{
            name: "image",
            type: "text",
            defaultValue: data?.image!,
          }}
          handleSubmit={updateMovieMetadata}
        />

        <Form
          title="Genre"
          description="The genre of the movie"
          helpText="Choose a genre for the movie."
          inputAttrs={{
            name: "genre",
            type: "text",
            defaultValue: data?.genre!,
          }}
          handleSubmit={updateMovieMetadata}
        />

        <Form
          title="actors"
          description="The actors in the movie"
          helpText="Please use a high-quality image url."
          searchFunction={searchActorsByName}
          inputAttrs={{
            name: "actorId",
            type: "text",
            defaultValue: "",
          }}
          handleSubmit={addActorToMovie}
        />
        <PersonsList
          title="Actors"
          persons={Array.isArray(actors) ? actors : []}
          removePerson={removeActorFromMovie}
          data={data}
        />

        <Form
          title="Directors"
          description="The directors of the movie"
          helpText="Please use a high-quality image url."
          searchFunction={searchDirectorsByName}
          inputAttrs={{
            name: "directorId",
            type: "text",
            defaultValue: "",
          }}
          handleSubmit={addDirectorToMovie}
        />

        <PersonsList
          title="Directors"
          persons={Array.isArray(directors) ? directors : []}
          removePerson={removeDirectorFromMovie}
          data={data}
        />

        <DeleteForm Title={data?.title!} type="MOVIE" />
      </div>
    </div>
  );
}
