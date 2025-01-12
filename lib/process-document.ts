import { promises as fs } from 'fs';
import pdf from 'pdf-parse';
import { prisma } from './db';

export async function processDocument(documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  const dataBuffer = await fs.readFile(`uploads/${document.filename}`);
  const pdfData = await pdf(dataBuffer);
  
  return pdfData.text;
}