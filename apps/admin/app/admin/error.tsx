"use client";

import { useEffect } from "react";

import { AdminStateCard } from "@/components/ui/AdminState";

type AdminErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function AdminError({ error, unstable_retry }: AdminErrorProps) {
  useEffect(() => {
    console.error("[admin/error]", error);
  }, [error]);

  return (
    <AdminStateCard
      actionLabel="Erneut versuchen"
      eyebrow="Fehler"
      message="Die Admin-Seite konnte nicht geladen werden. Bitte pruefe deine Verbindung oder versuche es erneut."
      onAction={unstable_retry}
      title="Ansicht nicht verfuegbar"
      tone="error"
    />
  );
}
