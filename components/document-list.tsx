"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContentDialog } from "./content-dialog";
import { Button } from "./ui/button";

interface Document {
  id: string;
  originalName: string;
  status: string;
  createdAt: string;
  content: string | null;
  error: string | null;
}

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  useEffect(() => {
    const setupSSE = () => {
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const params = new URLSearchParams();
      if (search?.trim()) params.append("q", search.trim());

      const eventSource = new EventSource(`/api/documents?${params}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "initial") {
          setDocuments(data.documents);
          setIsLoading(false);
        } else if (data.type === "update") {
          setDocuments((prev) => {
            const index = prev.findIndex((doc) => doc.id === data.document.id);
            if (index === -1) {
              // New document
              return [data.document, ...prev];
            } else {
              // Update existing document
              const newDocs = [...prev];
              newDocs[index] = data.document;
              return newDocs;
            }
          });
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();
        // Optionally implement reconnection logic here
      };
    };

    setupSSE();

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [search]);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Content Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.originalName}</TableCell>
                  <TableCell>
                    <span
                      className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          doc.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : doc.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : doc.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      `}
                    >
                      {doc.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(doc.createdAt), "PPp")}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {doc.status === "completed" ? (
                      <Button
                        variant="link"
                        onClick={() => setSelectedContent(doc.content || "")}
                      >
                        {doc.content?.slice(0, 100) + "..."}
                      </Button>
                    ) : doc.status === "failed" ? (
                      doc.error
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && documents.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No documents found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ContentDialog
        isOpen={!!selectedContent}
        onClose={() => setSelectedContent(null)}
        content={selectedContent || ""}
      />
    </>
  );
}
