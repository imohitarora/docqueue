// lib/queue.ts
import { Queue, Worker } from "bullmq";
import { redis } from "./redis";
import { prisma } from "./db";
import { processDocument } from "./process-document";

export const documentQueue = new Queue("document-processing", {
  connection: redis,
});

const worker = new Worker(
  "document-processing",
  async (job) => {
    const { documentId } = job.data;

    try {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "processing" },
      });

      // Publish processing status
      await redis.publish(
        "document-updates",
        JSON.stringify({
          documentId,
          status: "processing",
        })
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const result = await processDocument(documentId);

      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "completed",
          content: result,
        },
      });

      // Publish completion status
      await redis.publish(
        "document-updates",
        JSON.stringify({
          documentId,
          status: "completed",
        })
      );
    } catch (error) {
      console.error("Processing error:", error);
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      // Publish error status
      await redis.publish(
        "document-updates",
        JSON.stringify({
          documentId,
          status: "failed",
        })
      );
    }
  },
  {
    connection: redis,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});
