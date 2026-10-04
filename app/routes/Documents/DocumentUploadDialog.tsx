import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
  OverlayBody,
  OverlayFooter,
  ResponsiveOverlay,
} from "~/components/ResponsiveOverlay";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { StatusBanner } from "~/components/StatusBanner";
import { cn } from "~/util/ui/utils";

type DocumentUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCategories: string[];
  onUploadSuccess?: (message: string) => void;
};

export function DocumentUploadDialog({
  open,
  onOpenChange,
  existingCategories,
  onUploadSuccess,
}: DocumentUploadDialogProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // const isCustomCategory = selectedCategory === "custom";
  // const categoryValue = isCustomCategory ? customCategory : selectedCategory;
  const categoryValue = selectedCategory;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Reset form state
      setSelectedCategory("");
      setCustomCategory("");
      setSelectedFile(null);
    }
  };

  // Close dialog and reset form on successful upload
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      if (onUploadSuccess && fetcher.data.message) {
        onUploadSuccess(fetcher.data.message);
      }
      handleClose();
    }
  }, [fetcher.state, fetcher.data, onUploadSuccess]);

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={handleClose}
      title="Upload Document"
      description="Choose a file to upload from your computer and the category to file it under. Files will be accessible to all registered residents."
      bare
    >
      <fetcher.Form
        method="post"
        action="/documentUpload"
        encType="multipart/form-data"
        className="flex min-h-0 flex-1 flex-col"
      >
        <OverlayBody className="flex flex-col gap-6">
          {/* Error Message */}
          {fetcher.data && !fetcher.data.success && fetcher.data.error && (
            <StatusBanner
              variant="error"
              message={fetcher.data.error}
              className="shrink-0"
            />
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category-select">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={isSubmitting}
            >
              <SelectTrigger id="category-select" className="bg-card w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {existingCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </SelectItem>
                ))}
                {/*<SelectItem value="custom">+ New Category</SelectItem>*/}
              </SelectContent>
            </Select>
          </div>

          {/* Hidden input for category value */}
          <input type="hidden" name="category" value={categoryValue} />

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Document</Label>
            <Input
              id="file"
              name="file"
              type="file"
              className={cn("bg-card", [selectedFile && "text-emerald-500"])}
              onChange={handleFileChange}
              disabled={isSubmitting}
              required
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </OverlayBody>

        <OverlayFooter>
          <Button
            type="button"
            variant="outline"
            className="h-11 md:h-11 flex-1 rounded-xl"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="cta"
            type="submit"
            className="h-11 md:h-11 flex-1 shadow-none hover:translate-y-0 hover:shadow-none"
            disabled={
              isSubmitting ||
              !selectedFile ||
              !categoryValue ||
              categoryValue.trim() === ""
            }
          >
            {isSubmitting ? "Uploading..." : "Upload"}
          </Button>
        </OverlayFooter>
      </fetcher.Form>
    </ResponsiveOverlay>
  );
}
