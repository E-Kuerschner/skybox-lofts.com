import { isAuthenticated } from "~/util/authHelpers.server";
import type { Route } from "./+types/documents";
import type { AppLoadContext } from "react-router";
import { Suspense } from "react";
import { Await } from "react-router";
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

  return files.objects.map((file) => ({
    key: file.key,
    name: decodeURIComponent(file.key.replace(`${prefix}/`, "")),
  }));
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
          <a
            href={`/resident/documents/download?key=${encodeURIComponent(file.key)}`}
            className="text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            {file.name}
          </a>
        </li>
      ))}
    </ul>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-emerald-600" />
    </div>
  );
}

const defaultAccordionValue = ["building-info"];

export default function DocumentsHomePage({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      <p className="text-muted-foreground mb-6">
        Building documents, meeting notes and financials are available to all
        residents for download. Expand the sections below to see more.
      </p>
      <Accordion type="multiple" defaultValue={defaultAccordionValue}>
        <AccordionItem value="building-info">
          <AccordionTrigger>Building Information</AccordionTrigger>
          <AccordionContent>
            <FileList files={loaderData.files} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="meeting-notes">
          <AccordionTrigger>Meeting Notes</AccordionTrigger>
          <AccordionContent>
            <Suspense fallback={<LoadingSpinner />}>
              <Await resolve={loaderData.meetingNotesFiles}>
                {(files) => <FileList files={files} />}
              </Await>
            </Suspense>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="budget">
          <AccordionTrigger>Budget</AccordionTrigger>
          <AccordionContent>
            <Suspense fallback={<LoadingSpinner />}>
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
