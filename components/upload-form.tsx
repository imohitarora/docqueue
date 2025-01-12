"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function UploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      console.log("Uploading file:", file);
      if (!file) return;

      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      console.log("FormData contents:", formData.get("file"));

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        console.log("Upload response:", response);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();

        toast({
          title: "Success",
          description: `File uploaded successfully. Document ID: ${data.documentId}`,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload file";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center
          cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-border"}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
        <p className="text-center text-muted-foreground">
          {isDragActive
            ? "Drop the PDF here"
            : "Drag & drop a PDF here, or click to select"}
        </p>
        <Button variant="secondary" className="mt-4" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Select File"}
        </Button>
      </div>
    </Card>
  );
}
