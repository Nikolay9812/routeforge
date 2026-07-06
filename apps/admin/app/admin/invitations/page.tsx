import { InvitationLocalLogic } from "@/components/invitations/InvitationLocalLogic";
import { requireAdminSession } from "@/lib/auth";
import { loadAdminInvitationPageData } from "@/lib/invitations.server";

export default async function AdminInvitationsPage() {
  const session = await requireAdminSession();
  const data = await loadAdminInvitationPageData(session);

  return (
    <InvitationLocalLogic
      depotOptions={data.depotOptions}
      filters={data.filters}
      initialInvitations={data.initialInvitations}
      invitationDraft={data.invitationDraft}
    />
  );
}
