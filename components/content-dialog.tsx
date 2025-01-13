import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export function ContentDialog({
  isOpen,
  onClose,
  content,
}: ContentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Content</DialogTitle>
        </DialogHeader>
        <div className="whitespace-pre-wrap">{content}</div>
      </DialogContent>
    </Dialog>
  );
}
