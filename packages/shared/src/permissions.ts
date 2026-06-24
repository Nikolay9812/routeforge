import type { DocumentType, ProfileStatus, UserRole, UUID } from "./types";
import { isAdmin, isCourier, isDispatcher } from "./roles";

export type DispatcherPermissionSet = {
  manageCouriers?: boolean;
  reviewShifts?: boolean;
  uploadDocuments?: boolean;
  downloadDocuments?: boolean;
};

export type PermissionActor = {
  profile_id: UUID;
  company_id: UUID;
  role: UserRole;
  status: ProfileStatus;
  primary_depot_id?: UUID | null;
  assigned_depot_ids?: readonly UUID[];
  has_all_depot_access?: boolean;
  dispatcher_permissions?: DispatcherPermissionSet;
};

export type DepotPermissionTarget = {
  company_id: UUID;
  depot_id: UUID;
};

export type CourierPermissionTarget = {
  company_id: UUID;
  courier_profile_id: UUID;
  courier_depot_id: UUID | null;
};

export type ShiftPermissionTarget = {
  company_id: UUID;
  courier_profile_id: UUID;
  depot_id: UUID;
};

export type DocumentPermissionTarget = {
  company_id: UUID;
  courier_profile_id: UUID | null;
  courier_depot_id?: UUID | null;
  document_type?: DocumentType;
  allow_courier_upload?: boolean;
};

export function canAccessDepot(
  actor: PermissionActor,
  target: DepotPermissionTarget,
): boolean {
  if (!isActiveInCompany(actor, target.company_id)) {
    return false;
  }

  if (isAdmin(actor.role)) {
    return true;
  }

  if (isDispatcher(actor.role)) {
    return hasDepotAccess(actor, target.depot_id);
  }

  return actor.primary_depot_id === target.depot_id;
}

export function canManageCourier(
  actor: PermissionActor,
  target: CourierPermissionTarget,
): boolean {
  if (!isActiveInCompany(actor, target.company_id)) {
    return false;
  }

  if (isAdmin(actor.role)) {
    return true;
  }

  if (isDispatcher(actor.role)) {
    return (
      actor.dispatcher_permissions?.manageCouriers === true &&
      canAccessCourierDepot(actor, target.courier_depot_id)
    );
  }

  return false;
}

export function canReviewShift(
  actor: PermissionActor,
  target: ShiftPermissionTarget,
): boolean {
  if (!isActiveInCompany(actor, target.company_id)) {
    return false;
  }

  if (isAdmin(actor.role)) {
    return true;
  }

  if (isDispatcher(actor.role)) {
    return (
      actor.dispatcher_permissions?.reviewShifts === true &&
      hasDepotAccess(actor, target.depot_id)
    );
  }

  return false;
}

export function canUploadDocument(
  actor: PermissionActor,
  target: DocumentPermissionTarget,
): boolean {
  if (!isInCompany(actor, target.company_id)) {
    return false;
  }

  if (isAdmin(actor.role) && hasActiveProfile(actor)) {
    return true;
  }

  if (isDispatcher(actor.role) && hasActiveProfile(actor)) {
    return (
      actor.dispatcher_permissions?.uploadDocuments === true &&
      canAccessCourierDepot(actor, target.courier_depot_id ?? null)
    );
  }

  return (
    isCourier(actor.role) &&
    canAccessOwnDocuments(actor) &&
    target.allow_courier_upload === true &&
    target.courier_profile_id === actor.profile_id
  );
}

export function canDownloadDocument(
  actor: PermissionActor,
  target: DocumentPermissionTarget,
): boolean {
  if (!isInCompany(actor, target.company_id)) {
    return false;
  }

  if (isAdmin(actor.role) && hasActiveProfile(actor)) {
    return true;
  }

  if (isDispatcher(actor.role) && hasActiveProfile(actor)) {
    return (
      actor.dispatcher_permissions?.downloadDocuments === true &&
      canAccessCourierDepot(actor, target.courier_depot_id ?? null)
    );
  }

  return (
    isCourier(actor.role) &&
    canAccessOwnDocuments(actor) &&
    target.courier_profile_id === actor.profile_id
  );
}

function isActiveInCompany(actor: PermissionActor, companyId: UUID): boolean {
  return isInCompany(actor, companyId) && hasActiveProfile(actor);
}

function isInCompany(actor: PermissionActor, companyId: UUID): boolean {
  return actor.company_id === companyId;
}

function hasActiveProfile(actor: PermissionActor): boolean {
  return actor.status === "active";
}

function canAccessOwnDocuments(actor: PermissionActor): boolean {
  return actor.status === "active" || actor.status === "pending_approval";
}

function canAccessCourierDepot(
  actor: PermissionActor,
  depotId: UUID | null,
): boolean {
  if (depotId == null) {
    return false;
  }

  return hasDepotAccess(actor, depotId);
}

function hasDepotAccess(actor: PermissionActor, depotId: UUID): boolean {
  if (!isDispatcher(actor.role)) {
    return false;
  }

  if (actor.has_all_depot_access === true) {
    return true;
  }

  return actor.assigned_depot_ids?.includes(depotId) ?? false;
}
