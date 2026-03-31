"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PhotoLocationPanel, type PhotoLocationBodyProps } from "./PhotoLocationPanel";

export type PhotoLocationDialogPayload = Omit<PhotoLocationBodyProps, "fetchEnabled"> & {
  title: string;
  description?: string;
};

type PhotoLocationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: PhotoLocationDialogPayload | null;
};

export function PhotoLocationDialog({
  open,
  onOpenChange,
  payload,
}: PhotoLocationDialogProps) {
  if (!payload) return null;

  const { title, description, ...body } = payload;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <PhotoLocationPanel {...body} fetchEnabled={open} />
      </DialogContent>
    </Dialog>
  );
}
