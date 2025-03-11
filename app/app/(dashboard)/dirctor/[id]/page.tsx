import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Form from "@/components/form";
import { updateDirectorMetadata } from "@/lib/actions";
import DeleteForm from "@/components/form/delete-form";
import db from "@/lib/db";

export default async function DirectorPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const data = await db.query.director.findFirst({
    where: (director, { eq }) => eq(director.id, decodeURIComponent(params.id)),
  });
  if (!data) {
    notFound();
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-6">
    <div className="flex flex-col space-y-6">
      <h1 className="font-cal text-3xl font-bold dark:text-white">
        Create/Edit Director
      </h1>
      <Form
        title="Director Name"
        description="The name of the Actor"
        helpText="Please use the full name of the Actor."
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: data?.name!,
          placeholder: "Name",
        }}
        handleSubmit={updateDirectorMetadata}
      />
            <Form
        title="Director age"
        description="The age of the Director"
        helpText="Please use the age of the Director."
        inputAttrs={{
          name: "age",
          type: "text",
          defaultValue: data?.age!,
          placeholder: "Age",
        }}
        handleSubmit={updateDirectorMetadata}
      />

      <Form
        title="Director Image"
        description="The image for the Director"
        helpText="Please use a high-quality image url."
        inputAttrs={{
          name: "image",
          type: "text",
          defaultValue: data?.image!,
        }}
        handleSubmit={updateDirectorMetadata}
      />

      <DeleteForm Title={data?.name!}  type="DIRECTOR"/>
    </div>
  </div>
  )
}


