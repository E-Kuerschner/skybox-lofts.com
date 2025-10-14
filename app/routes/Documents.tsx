import { Suspense } from "react";
import { Await, type AppLoadContext } from "react-router";
import { FileIcon } from "lucide-react";
import type { Route } from "./+types/Documents";
import { isAuthenticated } from "~/util/authHelpers.server";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

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
  await isAuthenticated(request, context);

  const files = await fetchDocuments("building-info", context);

  return {
    files,
    meetingNotesFiles: fetchDocuments("meeting-notes", context),
    budgetFiles: fetchDocuments("budget", context),
  };
}

function FileList({ files }: { files: { key: string; name: string }[] }) {
  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li key={file.key}>
          <div className="flex items-center space-x-2 link">
            <FileIcon className="size-4 stroke-current shrink-0" />
            <a
              href={`/resident/documents/download?key=${encodeURIComponent(file.key)}`}
              className="text-current hover:underline"
            >
              {file.name}
            </a>
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
  return (
    <div>
      <p className="text-muted-foreground mb-6">
        Building documents, meeting notes and financials are available to all
        residents for download. Expand the sections below to see more.
      </p>
      <Accordion
        type="multiple"
        defaultValue={defaultAccordionValue}
        className="bg-white px-4 rounded-md border-2 border-slate-200"
      >
        <AccordionItem value="building-info">
          <AccordionTrigger>Building Information</AccordionTrigger>
          <AccordionContent>
            <FileList files={loaderData.files} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="meeting-notes">
          <AccordionTrigger>Meeting Notes</AccordionTrigger>
          <AccordionContent>
            <Suspense fallback={Fallback}>
              <Await resolve={loaderData.meetingNotesFiles}>
                {(files) => <FileList files={files} />}
              </Await>
            </Suspense>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="budget">
          <AccordionTrigger>Budget</AccordionTrigger>
          <AccordionContent>
            <Suspense fallback={Fallback}>
              <Await resolve={loaderData.budgetFiles}>
                {(files) => <FileList files={files} />}
              </Await>
            </Suspense>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
