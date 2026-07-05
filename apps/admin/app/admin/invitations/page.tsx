import { InvitationLocalLogic } from "@/components/invitations/InvitationLocalLogic";
import {
  adminInvitationDraft,
  adminInvitationFilterGroups,
  adminInvitationListItems,
} from "@/lib/mock/adminInvitations";

export default function AdminInvitationsPage() {
  return (
    <InvitationLocalLogic
      filters={adminInvitationFilterGroups}
      initialInvitations={adminInvitationListItems}
      invitationDraft={adminInvitationDraft}
    />
  );
}
