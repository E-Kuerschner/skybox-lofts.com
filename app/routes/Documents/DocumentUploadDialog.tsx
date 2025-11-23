import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="site-bg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Choose a file to upload from your computer and the category to file
            it under. Files will be accessible to all registered residents.
          </DialogDescription>
        </DialogHeader>

        {/* Error Message */}
        {fetcher.data && !fetcher.data.success && fetcher.data.error && (
          <StatusBanner
            variant="error"
            message={fetcher.data.error}
            className="mt-4"
          />
        )}

        <fetcher.Form
          method="post"
          action="/documentUpload"
          encType="multipart/form-data"
          className="mt-4"
        >
          <div className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category-select">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={isSubmitting}
              >
                <SelectTrigger id="category-select" className="bg-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {existingCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </SelectItem>
                  ))}
                  {/*<SelectItem value="custom">+ New Category</SelectItem>*/}
                </SelectContent>
              </Select>
            </div>

            {/*/!* Custom Category Input *!/*/}
            {/*{isCustomCategory && (*/}
            {/*  <div className="space-y-2">*/}
            {/*    <Label htmlFor="custom-category">Category Name</Label>*/}
            {/*    <Input*/}
            {/*      id="custom-category"*/}
            {/*      type="text"*/}
            {/*      value={customCategory}*/}
            {/*      onChange={(e) => setCustomCategory(e.target.value)}*/}
            {/*      placeholder="Enter category name"*/}
            {/*      disabled={isSubmitting}*/}
            {/*      required*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*)}*/}

            {/* Hidden input for category value */}
            <input type="hidden" name="category" value={categoryValue} />

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Document</Label>
              <Input
                id="file"
                name="file"
                type="file"
                className={cn("bg-white", [selectedFile && "text-emerald-500"])}
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
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="cta"
              type="submit"
              className="w-full"
              disabled={
                isSubmitting ||
                !selectedFile ||
                !categoryValue ||
                categoryValue.trim() === ""
              }
            >
              {isSubmitting ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
