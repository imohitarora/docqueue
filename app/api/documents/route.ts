// app/api/documents/status/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q")?.trim();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial documents list
      const where = search
        ? {
            OR: [
              {
                originalName: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive, // Use the QueryMode enum
                },
              },
              {
                content: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive, // Use the QueryMode enum
                },
              },
            ],
          }
        : {};

      const initialDocuments = await prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          originalName: true,
          status: true,
          createdAt: true,
          content: true,
          error: true,
        },
      });

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "initial",
            documents: initialDocuments,
          })}\n\n`
        )
      );

      // Subscribe to document updates
      const subscriber = redis.duplicate();
      await subscriber.subscribe("document-updates");

      subscriber.on("message", async (channel, message) => {
        if (channel === "document-updates") {
          try {
            const update = JSON.parse(message);

            // Fetch the updated document
            const document = await prisma.document.findUnique({
              where: { id: update.documentId },
              select: {
                id: true,
                originalName: true,
                status: true,
                createdAt: true,
                content: true,
                error: true,
              },
            });

            if (document) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "update", document })}\n\n`
                )
              );
            }
          } catch (error) {
            console.error("Error processing message:", error);
          }
        }
      });

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        subscriber.unsubscribe("document-updates");
        subscriber.quit();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
