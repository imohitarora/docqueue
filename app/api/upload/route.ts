import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/db";
import { documentQueue } from "@/lib/queue";

export async function POST(req: Request) {
  try {
    console.log("Uploading file...");
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "uploads");

    console.log("Creating uploads directory...", uploadDir);

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create uploads directory:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    // Generate unique filename
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    const filename =
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("") + ".pdf";

    try {
      // Save file to the uploads directory
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(join(uploadDir, filename), buffer);
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error: ", error.stack);
      }
      console.error("Failed to save file:", error);
      return NextResponse.json(
        { error: "File upload failed" },
        { status: 500 }
      );
    }

    let document;
    try {
      // Create document record in the database
      document = await prisma.document.create({
        data: {
          filename,
          originalName: file.name,
          status: "pending",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error: ", error.stack);
      }
      console.error("Failed to create document record:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    try {
      // Add document to the processing queue
      await documentQueue.add("process-document", {
        documentId: document.id,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error: ", error.stack);
      }
      console.error("Failed to add document to the queue:", error);
      return NextResponse.json({ error: "Queue error" }, { status: 500 });
    }

    return NextResponse.json({ documentId: document.id });
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error: ", error.stack);
    }
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
