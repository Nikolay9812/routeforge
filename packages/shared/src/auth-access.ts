import type { Profile, ProfileStatus, UserRole } from "./types";

export type AuthAccessProfile = Pick<Profile, "role" | "status">;

export function isAdminPanelRole(role: UserRole): role is "admin" | "dispatcher" {
  return role === "admin" || role === "dispatcher";
}

export function canUseAdminPanel(profile: AuthAccessProfile): boolean {
  return profile.status === "active" && isAdminPanelRole(profile.role);
}

export function canUseMobileOperationalApp(profile: AuthAccessProfile): boolean {
  return profile.role === "courier" && profile.status === "active";
}

export function isPendingCourierProfile(profile: AuthAccessProfile): boolean {
  return profile.role === "courier" && profile.status === "pending_approval";
}

export function getMobileAccessDeniedMessage(profile: AuthAccessProfile | null): string {
  if (!profile) {
    return "Kein Kurierprofil fuer diesen Zugang gefunden.";
  }

  if (profile.role !== "courier") {
    return "Dieser Zugang ist nicht fuer die mobile Kurier-App freigegeben.";
  }

  if (profile.status === "pending_approval") {
    return "Dein Kurierprofil wartet noch auf Freigabe.";
  }

  return getInactiveProfileMessage(profile.status);
}

export function getInactiveProfileMessage(status: ProfileStatus): string {
  if (status === "suspended") {
    return "Dein Zugang ist gesperrt. Bitte wende dich an dein Buero.";
  }

  if (status === "inactive") {
    return "Dein Zugang ist inaktiv. Bitte wende dich an dein Buero.";
  }

  return "Dieser Zugang ist aktuell nicht freigegeben.";
}
