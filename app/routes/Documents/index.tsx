import type { Route } from "./+types/index";
import { useId, useMemo, useState } from "react";
import type { AppLoadContext } from "react-router";
import {
  ChevronDownIcon,
  FileTextIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { isAuthenticated } from "~/util/authHelpers.server";
import { Button } from "~/components/ui/button";
import { fuzzyMatch } from "~/util/fuzzySearch";
import { SearchInput } from "~/components/SearchInput";
import { IconButton } from "~/components/IconButton";
import { NoContent } from "~/components/NoContent";
import { ConfirmActionDialog } from "~/components/crud/ConfirmActionDialog";
import { useStatusBanner } from "~/components/crud/ActionStatusBanner";
import { cn } from "~/util/ui/utils";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import {
  DOCUMENT_CATEGORIES,
  fileTypeLabel,
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
      return {
        key: file.key,
        name: splitExtension(filename).base,
        typeLabel: fileTypeLabel(filename),
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
        <FileTextIcon className="size-4.5" />
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
  isOpen,
  onToggle,
  showEverything,
  isAdmin,
  onRemove,
}: {
  group: DocumentGroupData;
  files: DocumentFile[];
  isOpen: boolean;
  onToggle: () => void;
  /** Skip the "Show all" cut-off, e.g. while searching. */
  showEverything: boolean;
  isAdmin: boolean;
  onRemove: (file: DocumentFile) => void;
}) {
  const listId = useId();
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't hide just one or two behind a button; it's quicker to show them
  const canTruncate = !showEverything && files.length > PREVIEW_COUNT + 1;
  const visibleFiles =
    canTruncate && !isExpanded ? files.slice(0, PREVIEW_COUNT) : files;

  return (
    <section className="border-t first:border-t-0">
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={onToggle}
          className={cn(
            "flex min-h-11 w-full cursor-pointer items-center gap-2 bg-subtle px-5 text-left text-muted-foreground hover:text-foreground",
            isOpen && "border-b",
          )}
        >
          <ChevronDownIcon
            className={cn(
              "size-3.5 shrink-0 transition-transform duration-150 ease-out",
              !isOpen && "-rotate-90",
            )}
          />
          <span className="text-xs font-medium tracking-[0.04em] uppercase">
            {group.label}
          </span>
          <span className="text-xs">· {files.length}</span>
        </button>
      </h3>

      {isOpen && (
        <div id={listId}>
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
              {canTruncate && (
                <li className="border-t">
                  <button
                    type="button"
                    onClick={() => setIsExpanded((value) => !value)}
                    className="h-11 w-full cursor-pointer text-sm font-medium text-emerald-700 hover:bg-subtle"
                  >
                    {isExpanded
                      ? "Show fewer"
                      : `Show all ${files.length} ${group.label.toLowerCase()}`}
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export default function Documents({ loaderData }: Route.ComponentProps) {
  const { groups, isAdmin } = loaderData;
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [closedGroups, setClosedGroups] = useState<DocumentCategory[]>([]);
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

  const toggleGroup = (category: DocumentCategory) =>
    setClosedGroups((current) =>
      current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category],
    );

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
        <p className="col-span-2 max-w-2xl text-sm text-muted-foreground md:col-span-1">
          Building rules, meeting notes and budgets, open to every resident.
          Tap a document's name to download it.
        </p>
      </div>

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name..."
        className="h-10 md:max-w-sm"
      />

      {visibleGroups.length === 0 ? (
        <NoContent message={`No documents match “${query}”`} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          {visibleGroups.map((group) => (
            <DocumentGroup
              key={group.category}
              group={group}
              files={group.files}
              // A search shows every match, even in a collapsed section
              isOpen={!!query || !closedGroups.includes(group.category)}
              onToggle={() => toggleGroup(group.category)}
              showEverything={!!query}
              isAdmin={isAdmin}
              onRemove={setFileToRemove}
            />
          ))}
        </div>
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
