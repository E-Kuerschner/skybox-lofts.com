import { useEffect, useMemo, useRef, useState } from "react";
import { PlusIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { IconButton } from "~/components/IconButton";
import { contractorPhotoUrl } from "~/util/contractorPhotoUrl";
import { cn } from "~/util/ui/utils";
import type { ContractorPhoto } from "./types";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif";

const thumbClass = "size-21 shrink-0 rounded-lg border object-cover";

/**
 * The photos on a listing: the ones already saved (each can be marked for
 * removal) and new ones picked to upload, shown as previews before saving.
 *
 * The first photo is the listing's cover. Posts `photos` (the new files) and
 * a `removePhotoIds` field per saved photo marked for removal.
 */
export function PhotoField({
  existingPhotos,
  maxPhotos,
}: {
  existingPhotos: ContractorPhoto[];
  maxPhotos: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoIdsToRemove, setPhotoIdsToRemove] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const previews = useMemo(
    () => newFiles.map((file) => URL.createObjectURL(file)),
    [newFiles],
  );
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews],
  );

  const keptCount = existingPhotos.length - photoIdsToRemove.length;
  const remainingSlots = Math.max(0, maxPhotos - keptCount);
  const hasAnyPhoto = existingPhotos.length > 0 || newFiles.length > 0;

  const toggleRemoval = (photoId: number) =>
    setPhotoIdsToRemove((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId],
    );

  // One file input does the posting. Picking again replaces the new photos
  // rather than adding to them, which is how a plain file input behaves.
  const fileInput = (
    <input
      ref={inputRef}
      id="photos"
      name="photos"
      type="file"
      multiple
      accept={ACCEPTED_TYPES}
      disabled={remainingSlots === 0}
      onChange={(event) => setNewFiles([...(event.target.files ?? [])])}
      className="sr-only"
    />
  );

  // The input stays in one place in the tree whichever view shows, so React
  // never swaps it out and loses the files someone just picked.
  if (!hasAnyPhoto) {
    return (
      <div className="flex flex-col gap-2">
        {fileInput}
        <label
          htmlFor="photos"
          className="flex h-36 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed bg-muted/40 text-center transition-colors hover:border-ring"
        >
          <UploadIcon className="size-5 text-emerald-700" />
        <span className="text-sm font-semibold">Add photos of their work</span>
        <span className="text-xs text-muted-foreground">
          Optional · up to {maxPhotos} · 5MB each
          </span>
        </label>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {fileInput}
      <div className="flex flex-wrap gap-2 pt-1.5">
        {existingPhotos.map((photo, index) => {
          const markedForRemoval = photoIdsToRemove.includes(photo.id);

          return (
            <div key={photo.id} className="relative">
              <img
                src={contractorPhotoUrl(photo.id)}
                alt=""
                className={cn(
                  thumbClass,
                  "transition-opacity",
                  markedForRemoval && "opacity-30",
                )}
              />
              {index === 0 && !markedForRemoval && (
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-foreground/70 px-1.5 py-0.5 text-[11px] text-background">
                  Cover
                </span>
              )}
              {markedForRemoval && (
                <input type="hidden" name="removePhotoIds" value={photo.id} />
              )}
              <IconButton
                icon={Trash2Icon}
                tone="destructive"
                label={markedForRemoval ? "Keep this photo" : "Remove this photo"}
                onClick={() => toggleRemoval(photo.id)}
                className="absolute -top-2 -right-2 size-7 md:size-7 rounded-full border bg-card shadow-sm"
              />
            </div>
          );
        })}

        {previews.map((url, index) => (
          <img
            key={url}
            src={url}
            alt={`New photo ${index + 1}`}
            className={cn(thumbClass, "border-ring")}
          />
        ))}

        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-21 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed text-xs font-semibold text-emerald-700 hover:border-ring"
          >
            <PlusIcon className="size-4" />
            {newFiles.length > 0 ? "Change" : "Add"}
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {remainingSlots === 0
          ? `This listing already has ${maxPhotos} photos. Remove one to add another.`
          : newFiles.length > 0
            ? `${newFiles.length} new photo${newFiles.length === 1 ? "" : "s"} will be added when you save${newFiles.length > remainingSlots ? `, only the first ${remainingSlots}` : ""}.`
            : `The first photo is the cover. Up to ${remainingSlots} more, 5MB each.`}
        {photoIdsToRemove.length > 0 &&
          ` ${photoIdsToRemove.length} photo${photoIdsToRemove.length === 1 ? "" : "s"} will be deleted when you save.`}
      </p>
    </div>
  );
}
