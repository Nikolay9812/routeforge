import type { UserRole } from "./types";

export const USER_ROLES: readonly UserRole[] = ["admin", "dispatcher", "courier"];

export const ROLE_RANK: Record<UserRole, number> = {
  admin: 3,
  dispatcher: 2,
  courier: 1,
};

export function isAdmin(role: UserRole): role is "admin" {
  return role === "admin";
}

export function isDispatcher(role: UserRole): role is "dispatcher" {
  return role === "dispatcher";
}

export function isCourier(role: UserRole): role is "courier" {
  return role === "courier";
}

export function isStaffRole(role: UserRole): boolean {
  return isAdmin(role) || isDispatcher(role);
}

// Rank is for coarse role ordering only. Use permissions.ts for action checks.
export function hasRoleAtLeast(
  role: UserRole,
  minimumRole: UserRole,
): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimumRole];
}
