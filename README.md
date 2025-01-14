# DocQueue - PDF Processing System

A Next.js application for processing and managing PDF documents with real-time status updates.

## Features

- **PDF Document Processing**: Upload and process PDF documents
- **Real-time Status Updates**: Track document processing status via Server-Sent Events (SSE)
- **Search Functionality**: Search through processed documents
- **Document Management**: View and manage uploaded documents
- **Content Preview**: Preview processed document content

## System Architecture

This project uses the following technology stack:

- **Frontend**: Next.js 15+ with TypeScript and TailwindCSS
- **Database**: PostgreSQL with Prisma ORM
- **Queue System**: BullMQ for processing PDFs
- **Caching**: Redis for queue management and caching
- **Real-time Updates**: Server-Sent Events (SSE) for live status updates

## Getting Started

1. Clone the repository

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
Copy .env.example to .env
Configure your database and Redis connection strings
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
