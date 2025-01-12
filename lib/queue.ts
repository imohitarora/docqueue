import { Queue, Worker } from 'bullmq';
import { redis } from './redis';
import { prisma } from './db';
import { processDocument } from './process-document';

export const documentQueue = new Queue('document-processing', {
  connection: redis,
});

const worker = new Worker('document-processing', async (job) => {
  try {
    const { documentId } = job.data;
    
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'processing' },
    });

    const result = await processDocument(documentId);
    
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'completed',
        content: result,
      },
    });
  } catch (error) {
    console.error('Processing error:', error);
    await prisma.document.update({
      where: { id: job.data.documentId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}, {
  connection: redis,
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});