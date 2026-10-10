import type { Route } from "./+types/index";
import { useMemo, useState } from "react";
import type { AppLoadContext } from "react-router";
import { Trash2Icon, UploadIcon } from "lucide-react";
import { isAuthenticated } from "~/util/authHelpers.server";
import { Button } from "~/components/ui/button";
import { fuzzyMatch } from "~/util/fuzzySearch";
import { SearchInput } from "~/components/SearchInput";
import { IconButton } from "~/components/IconButton";
import { NoContent } from "~/components/NoContent";
import { ConfirmActionDialog } from "~/components/crud/ConfirmActionDialog";
import { useStatusBanner } from "~/components/crud/ActionStatusBanner";
import {
  SectionAccordion,
  SectionAccordionItem,
  SectionAccordionMoreButton,
} from "~/components/SectionAccordion";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { FileTypeIcon } from "./FileTypeIcon";
import {
  DOCUMENT_CATEGORIES,
  fileType,
  splitExtension,
  type DocumentCategory,
  type DocumentFile,
} from "./documents";

async function fetchDocuments(
  category: DocumentCategory,
  context: AppLoadContext,
): Promise<DocumentFile[]> {
  const prefix = `${category}/`;
  const files = await context.cloudflare.env.DOCUMENTS.list({ prefix });

  const documents = files.objects
    .filter((file) => file.key !== prefix) // the object that represents the folder
    .map((file) => {
      const filename = decodeURIComponent(file.key.slice(prefix.length));
      const type = fileType(filename);
      return {
        key: file.key,
        name: splitExtension(filename).base,
        typeLabel: type.label,
        kind: type.kind,
        uploaded: file.uploaded.toISOString(),
      };
    });

  // Rules and forms are looked up by name; notes and budgets by how recent
  return category === "building-info"
    ? documents.sort((a, b) => a.name.localeCompare(b.name))
    : documents.sort((a, b) => b.uploaded.localeCompare(a.uploaded));
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await isAuthenticated(request, context);

  const groups = await Promise.all(
    DOCUMENT_CATEGORIES.map(async (category) => ({
      category: category.value,
      label: category.label,
      files: await fetchDocuments(category.value, context),
    })),
  );

  return {
    groups,
    isAdmin: session.user.role === "admin",
  };
}

type DocumentGroupData = Route.ComponentProps["loaderData"]["groups"][number];

// Longer groups show this many until "Show all" is pressed
const PREVIEW_COUNT = 5;

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function DocumentRow({
  file,
  isAdmin,
  onRemove,
}: {
  file: DocumentFile;
  isAdmin: boolean;
  onRemove: (file: DocumentFile) => void;
}) {
  return (
    <li className="flex items-center gap-3.5 border-t py-3 pr-3 pl-5 first:border-t-0">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
        <FileTypeIcon kind={file.kind} className="size-4.5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <a
          href={`/resident/documents/download?key=${encodeURIComponent(file.key)}`}
          className="w-fit max-w-full truncate text-[0.9375rem] font-medium hover:text-emerald-700 hover:underline"
        >
          {file.name}
        </a>
        <span className="text-[0.8125rem] text-muted-foreground">
          {file.typeLabel} · Added {dateFormat.format(new Date(file.uploaded))}
        </span>
      </div>
      {isAdmin && (
        <IconButton
          type="button"
          icon={Trash2Icon}
          label={`Remove ${file.name}`}
          tone="destructive"
          onClick={() => onRemove(file)}
        />
      )}
    </li>
  );
}

function DocumentGroup({
  group,
  files,
  showEverything,
  isAdmin,
  onRemove,
}: {
  group: DocumentGroupData;
  files: DocumentFile[];
  /** Skip the "Show all" cut-off, e.g. while searching. */
  showEverything: boolean;
  isAdmin: boolean;
  onRemove: (file: DocumentFile) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't hide just one or two behind a button; it's quicker to show them
  const canTruncate = !showEverything && files.length > PREVIEW_COUNT + 1;
  const visibleFiles =
    canTruncate && !isExpanded ? files.slice(0, PREVIEW_COUNT) : files;

  return (
    <SectionAccordionItem
      value={group.category}
      title={group.label}
      count={files.length}
    >
      {files.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted-foreground">
          Nothing here yet.
        </p>
      ) : (
        <ul>
          {visibleFiles.map((file) => (
            <DocumentRow
              key={file.key}
              file={file}
              isAdmin={isAdmin}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
      {canTruncate && (
        <SectionAccordionMoreButton
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded
            ? "Show fewer"
            : `Show all ${files.length} ${group.label.toLowerCase()}`}
        </SectionAccordionMoreButton>
      )}
    </SectionAccordionItem>
  );
}

export default function Documents({ loaderData }: Route.ComponentProps) {
  const { groups, isAdmin } = loaderData;
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    groups.map((group) => group.category),
  );
  const [fileToRemove, setFileToRemove] = useState<DocumentFile | null>(null);
  const { banner, showSuccess } = useStatusBanner();

  const totalCount = groups.reduce((sum, group) => sum + group.files.length, 0);
  const query = searchQuery.trim();

  const visibleGroups = useMemo(() => {
    if (!query) return groups;
    // While searching, only the sections with a match are shown
    return groups
      .map((group) => ({
        ...group,
        files: group.files.filter((file) => fuzzyMatch(query, file.name)),
      }))
      .filter((group) => group.files.length > 0);
  }, [groups, query]);

  const handleSearchChange = (next: string) => {
    // Starting a search opens every section, so no match is hidden in a
    // folded one
    if (!query && next.trim()) {
      setOpenGroups(groups.map((group) => group.category));
    }
    setSearchQuery(next);
  };

  return (
    <div className="flex flex-col gap-5">
      {banner}

      <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1">
        <h2 className="text-xl font-semibold">
          Documents{" "}
          <span className="font-normal text-muted-foreground">
            · {totalCount}
          </span>
        </h2>
        {isAdmin && (
          <Button
            variant="secondary"
            onClick={() => setIsUploadOpen(true)}
            // Uploading is left to bigger screens, where the files usually are
            className="hidden md:row-span-2 md:flex md:h-10 md:self-end"
          >
            <UploadIcon />
            Upload document
          </Button>
        )}
        {/* Pinned to the first column, or without the admin's upload button
            it moves up into the empty spot beside the heading. */}
        <p className="col-span-2 max-w-2xl text-sm text-balance text-muted-foreground md:col-[1]">
          Building documents, meeting notes and financials are available to all
          residents for download. Expand the sections below to see more. Tap a
          document's name to download it.
        </p>
      </div>

      <SearchInput
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by name..."
        className="h-10 md:max-w-sm"
      />

      {visibleGroups.length === 0 ? (
        <NoContent message={`No documents match “${query}”`} />
      ) : (
        <SectionAccordion value={openGroups} onValueChange={setOpenGroups}>
          {visibleGroups.map((group) => (
            <DocumentGroup
              key={group.category}
              group={group}
              files={group.files}
              showEverything={!!query}
              isAdmin={isAdmin}
              onRemove={setFileToRemove}
            />
          ))}
        </SectionAccordion>
      )}

      {isAdmin && (
        <DocumentUploadDialog
          open={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onUploadSuccess={showSuccess}
        />
      )}

      {fileToRemove && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && setFileToRemove(null)}
          title="Remove this document?"
          intent="delete"
          recordId={fileToRemove.key}
          action="/documentDelete"
          confirmLabel="Remove document"
          pendingLabel="Removing..."
          cancelLabel="Keep it"
          destructive
          onSuccess={showSuccess}
        >
          <span className="font-medium text-foreground">
            {fileToRemove.name}
          </span>{" "}
          will no longer show up for residents, and the file will be deleted.
          This can't be undone.
        </ConfirmActionDialog>
      )}
    </div>
  );
}
