import { notFound } from "next/navigation";

import { CourierProfileApprovalView } from "@/components/couriers/CourierProfileApprovalView";
import { getAdminCourierProfile } from "@/lib/mock/adminCourierProfiles";

export default async function AdminCourierProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courier = getAdminCourierProfile(id);

  if (!courier) {
    notFound();
  }

  return <CourierProfileApprovalView courier={courier} />;
}
