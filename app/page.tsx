import { DocumentList } from '@/components/document-list';
import { UploadForm } from '@/components/upload-form';

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">PDF Processing Queue</h1>
      <div className="grid gap-8">
        <UploadForm />
        <DocumentList />
      </div>
    </div>
  );
}