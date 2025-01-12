"use client";

import { useEffect, useState } from "react";
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

  const fetchDocuments = async () => {
    try {
      setIsLoading(true); // Start loading spinner

      // Validate and prepare query parameters
      const params = new URLSearchParams();
      if (search?.trim()) params.append("q", search.trim());

      // Fetch data from the API
      const response = await fetch(`/api/documents?${params}`);
      if (!response.ok) throw new Error("Failed to fetch documents");

      // Parse and set the data
      const data = await response.json();
      setDocuments(data || []); // Fallback to an empty array if `data` is null
    } catch (error) {
      console.error("Fetch error:", error);
      // Optionally display an error message to the user
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  useEffect(() => {
    fetchDocuments();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchDocuments, 30000);
    return () => clearInterval(interval);
  }, [search]);

  return (
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
                <TableCell>{format(new Date(doc.createdAt), "PPp")}</TableCell>
                <TableCell className="max-w-md truncate">
                  {doc.status === "completed"
                    ? doc.content?.slice(0, 100) + "..."
                    : doc.status === "failed"
                    ? doc.error
                    : "-"}
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
  );
}
