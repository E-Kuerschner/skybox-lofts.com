import { Suspense, useState } from "react";
import { Await, type AppLoadContext, useFetcher } from "react-router";
import { FileIcon, Trash2Icon, UploadIcon } from "lucide-react";
import type { Route } from "./+types/Documents";
import { isAuthenticated } from "~/util/authHelpers.server";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { DocumentUploadDrawer } from "~/components/DocumentUploadDrawer";

async function fetchDocuments(prefix: string, context: AppLoadContext) {
  const files = await context.cloudflare.env.DOCUMENTS.list({
    prefix: `${prefix}/`,
  });

  return files.objects
    .map((file) => ({
      key: file.key,
      name: decodeURIComponent(file.key.replace(`${prefix}/`, "")),
    }))
    .filter((file) => file.key !== `${prefix}/`); // filter out object that represents the grouping
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await isAuthenticated(request, context);
  const isAdmin = session.user.role === "admin";

  // dynamically get all existing categories by listing all objects with no prefix
  // const allObjects = await context.cloudflare.env.DOCUMENTS.list();
  // const existingCategories = Array.from(
  //   new Set(
  //     allObjects.objects
  //       .map((obj) => obj.key.split("/")[0])
  //       .filter((category) => category !== ""),
  //   ),
  // );

  return {
    buildingFiles: await fetchDocuments("building-info", context),
    meetingNotesFiles: fetchDocuments("meeting-notes", context),
    budgetFiles: fetchDocuments("budget", context),
    isAdmin,
    existingCategories: ["building-info", "meeting-notes", "budget"],
  };
}

function FileList({
  files,
  isAdmin,
}: {
  files: { key: string; name: string }[];
  isAdmin: boolean;
}) {
  const fetcher = useFetcher();

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li key={file.key}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 link">
              <FileIcon className="size-4 stroke-current shrink-0" />
              <a
                href={`/resident/documents/download?key=${encodeURIComponent(file.key)}`}
                className="text-current hover:underline"
              >
                {file.name}
              </a>
            </div>
            {isAdmin && (
              <fetcher.Form
                method="post"
                action="/documentDelete"
                onSubmit={(e) => {
                  if (
                    !window.confirm(
                      `Are you sure you want to delete "${file.name}"? This action cannot be undone.`,
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="key" value={file.key} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  disabled={fetcher.state !== "idle"}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </fetcher.Form>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

const defaultAccordionValue = ["building-info"];

const Fallback = (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner />
  </div>
);

export default function Documents({ loaderData }: Route.ComponentProps) {
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <p className="text-muted-foreground">
          Building documents, meeting notes and financials are available to all
          residents for download. Expand the sections below to see more.
        </p>
        {/* Admin Upload Button */}
        {loaderData.isAdmin && (
          <Button onClick={() => setIsUploadDrawerOpen(true)}>
            <UploadIcon className="size-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={defaultAccordionValue}
        className="bg-white px-4 rounded-md border-2 border-slate-200"
      >
        <AccordionItem value="building-info">
          <AccordionTrigger>Building Information</AccordionTrigger>
          <AccordionContent>
            <FileList
              files={loaderData.buildingFiles}
              isAdmin={loaderData.isAdmin}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="meeting-notes">
          <AccordionTrigger>Meeting Notes</AccordionTrigger>
          <AccordionContent>
            <Suspense fallback={Fallback}>
              <Await resolve={loaderData.meetingNotesFiles}>
                {(files) => (
                  <FileList files={files} isAdmin={loaderData.isAdmin} />
                )}
              </Await>
            </Suspense>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="budget">
          <AccordionTrigger>Budget</AccordionTrigger>
          <AccordionContent>
            <Suspense fallback={Fallback}>
              <Await resolve={loaderData.budgetFiles}>
                {(files) => (
                  <FileList files={files} isAdmin={loaderData.isAdmin} />
                )}
              </Await>
            </Suspense>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Upload Drawer */}
      {loaderData.isAdmin && (
        <DocumentUploadDrawer
          open={isUploadDrawerOpen}
          onOpenChange={setIsUploadDrawerOpen}
          existingCategories={loaderData.existingCategories}
        />
      )}
    </div>
  );
}
