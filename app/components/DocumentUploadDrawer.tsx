import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
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

type DocumentUploadDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCategories: string[];
};

export function DocumentUploadDrawer({
  open,
  onOpenChange,
  existingCategories,
}: DocumentUploadDrawerProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isCustomCategory = selectedCategory === "custom";
  const categoryValue = isCustomCategory ? customCategory : selectedCategory;

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

  // Close sheet and reset form on successful upload
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      handleClose();
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Upload Document</SheetTitle>
          <SheetDescription>
            Upload a new document to the selected category.
          </SheetDescription>
        </SheetHeader>

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
                <SelectTrigger id="category-select">
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
                  <SelectItem value="custom">+ New Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Category Input */}
            {isCustomCategory && (
              <div className="space-y-2">
                <Label htmlFor="custom-category">Category Name</Label>
                <Input
                  id="custom-category"
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter category name"
                  disabled={isSubmitting}
                  required
                />
              </div>
            )}

            {/* Hidden input for category value */}
            <input type="hidden" name="category" value={categoryValue} />

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Document</Label>
              <Input
                id="file"
                name="file"
                type="file"
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

          <SheetFooter className="mt-6">
            <SheetClose asChild>
              <Button variant="outline" disabled={isSubmitting} type="button">
                Cancel
              </Button>
            </SheetClose>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedFile ||
                !categoryValue ||
                categoryValue.trim() === ""
              }
            >
              {isSubmitting ? "Uploading..." : "Upload Document"}
            </Button>
          </SheetFooter>
        </fetcher.Form>
      </SheetContent>
    </Sheet>
  );
}
