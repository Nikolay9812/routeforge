export type ProfileDocumentStatus = "expired" | "missing" | "uploaded" | "valid";

export type ProfileDocumentViewModel = {
  actionLabel: string;
  dateLabel: string;
  helperText: string;
  id: string;
  kindLabel: string;
  status: ProfileDocumentStatus;
  statusLabel: string;
  title: string;
};
