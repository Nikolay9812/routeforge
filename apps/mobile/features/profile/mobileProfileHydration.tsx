import type {
  Company,
  Depot,
  PaymentMode,
  Profile,
  ProfileStatus,
  UserRole,
} from "@routeforge/shared";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useMobileAuth } from "@/features/auth/AuthProvider";
import {
  mockMobileShellCompany,
  mockMobileShellDepots,
  mockMobileShellLanguages,
  mockMobileShellUser,
  type MobileShellDepot,
  type MobileShellLanguage,
} from "@/features/mock/mobileShell";
import { mockCourierProfile } from "@/features/mock/profile";
import { insforge } from "@/lib/insforge-client";

type HydratedCompany = Pick<Company, "id" | "name">;
type HydratedDepot = Pick<
  Depot,
  "address_line_1" | "city" | "code" | "id" | "name" | "postal_code"
>;

type StatusTone = "error" | "info" | "neutral" | "success" | "warning";

export type HydratedPaymentModeDisplay = {
  breakLabel: string;
  capLabel: string;
  detail: string;
  label: string;
};

export type MobileProfileHydration = {
  accessLabel: string;
  company: HydratedCompany | null;
  companyName: string;
  depot: HydratedDepot | null;
  depotAddressLabel: string;
  depotCode: string;
  depotName: string;
  depots: MobileShellDepot[];
  displayAddress: string;
  displayEmail: string;
  displayPhone: string;
  error: string | null;
  fullName: string;
  initials: string;
  languageCode: MobileShellLanguage["code"];
  languageLabel: string;
  loading: boolean;
  maskedIban: string;
  paymentMode: HydratedPaymentModeDisplay;
  profile: Profile | null;
  refresh: () => Promise<void>;
  roleLabel: string;
  statusLabel: string;
  statusTone: StatusTone;
};

const MobileProfileHydrationContext = createContext<MobileProfileHydration | null>(null);

type MobileProfileHydrationProviderProps = {
  children: ReactNode;
};

export function MobileProfileHydrationProvider({
  children,
}: MobileProfileHydrationProviderProps) {
  const { profile } = useMobileAuth();
  const [company, setCompany] = useState<HydratedCompany | null>(null);
  const [depot, setDepot] = useState<HydratedDepot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!profile) {
      setCompany(null);
      setDepot(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data: companyData, error: companyError } = await insforge.database
      .from("companies")
      .select("id, name")
      .eq("id", profile.company_id)
      .maybeSingle();

    if (companyError) {
      setCompany(null);
      setError("Firmendaten konnten nicht geladen werden. Mock-Anzeige bleibt aktiv.");
    } else {
      setCompany(companyData ? (companyData as HydratedCompany) : null);
    }

    if (!profile.primary_depot_id) {
      setDepot(null);
      setLoading(false);
      return;
    }

    const { data: depotData, error: depotError } = await insforge.database
      .from("depots")
      .select("id, name, code, address_line_1, postal_code, city")
      .eq("id", profile.primary_depot_id)
      .maybeSingle();

    if (depotError) {
      setDepot(null);
      setError((currentError) =>
        currentError
          ? `${currentError} Depotdaten konnten nicht geladen werden.`
          : "Depotdaten konnten nicht geladen werden. Mock-Anzeige bleibt aktiv.",
      );
    } else {
      setDepot(depotData ? (depotData as HydratedDepot) : null);
    }

    setLoading(false);
  }, [profile]);

  useEffect(() => {
    let isActive = true;

    async function hydrateProfileShell() {
      await refresh();

      if (!isActive) {
        return;
      }
    }

    void hydrateProfileShell();

    return () => {
      isActive = false;
    };
  }, [refresh]);

  const value = useMemo<MobileProfileHydration>(() => {
    const fullName = getDisplayFullName(profile);
    const primaryDepot = getPrimaryDepotDisplay(depot);

    return {
      accessLabel: getAccessLabel(profile?.status),
      company,
      companyName: company?.name ?? mockMobileShellCompany.name,
      depot,
      depotAddressLabel: primaryDepot.addressLabel,
      depotCode: primaryDepot.code,
      depotName: primaryDepot.name,
      depots: buildDepotOptions(primaryDepot),
      displayAddress: getDisplayAddress(profile),
      displayEmail: profile?.email ?? mockCourierProfile.email,
      displayPhone: profile?.phone?.trim() || mockCourierProfile.phone,
      error,
      fullName,
      initials: getInitials(fullName),
      languageCode: getLanguageCode(profile),
      languageLabel: getLanguageLabel(profile),
      loading,
      maskedIban: maskIban(profile?.iban) ?? mockCourierProfile.maskedIban,
      paymentMode: getPaymentModeDisplay(profile),
      profile,
      refresh,
      roleLabel: getRoleLabel(profile?.role),
      statusLabel: getStatusLabel(profile?.status),
      statusTone: getStatusTone(profile?.status),
    };
  }, [company, depot, error, loading, profile, refresh]);

  return (
    <MobileProfileHydrationContext.Provider value={value}>
      {children}
    </MobileProfileHydrationContext.Provider>
  );
}

export function useMobileProfileHydration() {
  const context = useContext(MobileProfileHydrationContext);

  if (!context) {
    throw new Error(
      "useMobileProfileHydration must be used inside MobileProfileHydrationProvider",
    );
  }

  return context;
}

function getDisplayFullName(profile: Profile | null): string {
  return profile?.full_name?.trim() || mockMobileShellUser.fullName;
}

function getInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return mockMobileShellUser.initials;
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getRoleLabel(role: UserRole | undefined): string {
  const labels: Record<UserRole, string> = {
    admin: "Admin",
    courier: "Kurier",
    dispatcher: "Dispatcher",
  };

  return role ? labels[role] : mockCourierProfile.roleLabel;
}

function getStatusLabel(status: ProfileStatus | undefined): string {
  const labels: Record<ProfileStatus, string> = {
    active: "Aktiv",
    inactive: "Inaktiv",
    pending_approval: "Wartet auf Freigabe",
    suspended: "Gesperrt",
  };

  return status ? labels[status] : mockCourierProfile.statusLabel;
}

function getAccessLabel(status: ProfileStatus | undefined): string {
  const labels: Record<ProfileStatus, string> = {
    active: "Aktiver Zugriff",
    inactive: "Kein Zugriff",
    pending_approval: "Eingeschraenkter Zugriff",
    suspended: "Zugriff gesperrt",
  };

  return status ? labels[status] : mockCourierProfile.accessLabel;
}

function getStatusTone(status: ProfileStatus | undefined): StatusTone {
  if (status === "active") {
    return "success";
  }

  if (status === "pending_approval") {
    return "warning";
  }

  if (status === "suspended") {
    return "error";
  }

  return status ? "neutral" : "success";
}

function getLanguageCode(profile: Profile | null): MobileShellLanguage["code"] {
  return profile?.preferred_language === "bg" ? "BG" : "DE";
}

function getLanguageLabel(profile: Profile | null): string {
  const code = getLanguageCode(profile);
  const language = mockMobileShellLanguages.find((item) => item.code === code);

  return language?.label ?? mockCourierProfile.preferredLanguage;
}

function getDisplayAddress(profile: Profile | null): string {
  const street = profile?.address_line_1?.trim();
  const cityLine = [profile?.postal_code?.trim(), profile?.city?.trim()]
    .filter(Boolean)
    .join(" ");
  const address = [street, cityLine].filter(Boolean).join(", ");

  return address || mockCourierProfile.address;
}

function getPrimaryDepotDisplay(depot: HydratedDepot | null): MobileShellDepot {
  if (!depot) {
    return mockMobileShellDepots[0];
  }

  return {
    addressLabel: formatDepotAddress(depot),
    code: depot.code || mockMobileShellDepots[0].code,
    name: depot.name || mockMobileShellDepots[0].name,
  };
}

function buildDepotOptions(primaryDepot: MobileShellDepot): MobileShellDepot[] {
  const fallbackDepots = mockMobileShellDepots.filter(
    (depot) => depot.code !== primaryDepot.code,
  );

  return [primaryDepot, ...fallbackDepots];
}

function formatDepotAddress(depot: HydratedDepot): string {
  const cityLine = [depot.postal_code, depot.city].filter(Boolean).join(" ");
  const address = [depot.address_line_1, cityLine].filter(Boolean).join(", ");

  return address || mockMobileShellDepots[0].addressLabel;
}

function getPaymentModeDisplay(profile: Profile | null): HydratedPaymentModeDisplay {
  const paymentMode = profile?.payment_mode ?? mockCurrentPaymentMode();

  if (paymentMode === "daily_fixed") {
    return {
      breakLabel: "Gesetzliche Pause wird berechnet",
      capLabel: `${formatMinutesLabel(profile?.daily_fixed_minutes ?? 500)} Standard`,
      detail: "Realzeit wird erfasst",
      label: "Tagespauschale",
    };
  }

  return {
    breakLabel: "Gesetzliche Pause wird berechnet",
    capLabel: `${formatMinutesLabel(profile?.hourly_max_minutes ?? 600)} Tageslimit`,
    detail: "Realzeit wird erfasst",
    label: "Stundenbasis",
  };
}

function mockCurrentPaymentMode(): PaymentMode {
  return mockCourierProfile.paymentMode.label === "Tagespauschale" ? "daily_fixed" : "hourly";
}

function formatMinutesLabel(totalMinutes: number): string {
  const safeMinutes = Math.max(Math.floor(totalMinutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}h`;
}

function maskIban(iban: string | null | undefined): string | null {
  const normalized = iban?.replace(/\s+/g, "").toUpperCase();

  if (!normalized || normalized.length < 8) {
    return null;
  }

  const prefix = normalized.slice(0, 4);
  const suffix = normalized.slice(-6).replace(/(.{4})(.{2})$/, "$1 $2");

  return `${prefix} **** **** **** ${suffix}`;
}
