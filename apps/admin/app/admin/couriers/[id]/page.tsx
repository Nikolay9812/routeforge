import { notFound } from "next/navigation";

import { CourierProfileApprovalView } from "@/components/couriers/CourierProfileApprovalView";
import { requireAdminSession } from "@/lib/auth";
import { loadAdminCourierProfileData } from "@/lib/couriers.server";

export default async function AdminCourierProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAdminSession();
  const courier = await loadAdminCourierProfileData({
    courierId: id,
    session,
  });

  if (!courier) {
    notFound();
  }

  return <CourierProfileApprovalView courier={courier} />;
}
