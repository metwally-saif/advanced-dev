import { notFound, redirect } from "next/navigation";

import Form from "@/components/form";
import DeleteForm from "@/components/form/delete-form";
import { updateActorMetadata } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";

export default async function ActorPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const data = await db.query.actor.findFirst({
    where: (actor, { eq }) => eq(actor.id, decodeURIComponent(params.id)),
  });
  if (!data) {
    notFound();
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-6">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Create/Edit Actor
        </h1>
        <Form
          title="Actor Name"
          description="The name of the Actor"
          helpText="Please use the full name of the Actor."
          inputAttrs={{
            name: "name",
            type: "text",
            defaultValue: data?.name!,
            placeholder: "Name",
          }}
          handleSubmit={updateActorMetadata}
        />
        <Form
          title="Actor age"
          description="The age of the Actor"
          helpText="Please use the age of the Actor."
          inputAttrs={{
            name: "age",
            type: "text",
            defaultValue: data?.age!,
            placeholder: "Age",
          }}
          handleSubmit={updateActorMetadata}
        />

        <Form
          title="Actor Image"
          description="The image for the Actor"
          helpText="Please use a high-quality image url."
          inputAttrs={{
            name: "image",
            type: "text",
            defaultValue: data?.image!,
          }}
          handleSubmit={updateActorMetadata}
        />

        <DeleteForm Title={data?.name!} type="ACTOR" />
      </div>
    </div>
  );
}
