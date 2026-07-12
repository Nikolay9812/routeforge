import {
  shiftEndMutationSchema,
  shiftLocationMutationSchema,
  shiftStartMutationSchema,
  type Shift,
  type ShiftEndMutationInput,
  type ShiftLocation,
  type ShiftLocationMutationInput,
  type ShiftStartMutationInput,
} from "@routeforge/shared";

import { insforge } from "@/lib/insforge-client";

export const shiftSelect = `
  id,
  company_id,
  depot_id,
  courier_profile_id,
  shift_date,
  start_time,
  end_time,
  gross_minutes,
  break_minutes,
  net_minutes,
  billable_minutes,
  billable_source,
  billable_override_reason,
  billable_override_by,
  billable_override_at,
  auto_stopped_at_max_hours,
  payment_mode_snapshot,
  tour_number,
  van_plate,
  start_km,
  end_km,
  packages_delivered,
  packages_returned,
  packages_picked_up,
  total_stops,
  courier_note,
  missing_proof_explanation,
  signature_url,
  signature_storage_key,
  signed_at,
  status,
  submitted_at,
  approved_at,
  approved_by,
  rejection_reason,
  created_at,
  updated_at
`;

const shiftLocationSelect = `
  id,
  company_id,
  shift_id,
  location_type,
  latitude,
  longitude,
  accuracy_meters,
  depot_latitude_snapshot,
  depot_longitude_snapshot,
  distance_from_depot_meters,
  is_inside_depot_geofence,
  created_at
`;

export type ShiftBackendResult =
  | {
      error: null;
      shift: Shift | null;
    }
  | {
      error: string;
      shift: null;
    };

export type ShiftListBackendResult =
  | {
      error: null;
      shifts: Shift[];
    }
  | {
      error: string;
      shifts: [];
    };

export type ShiftLocationBackendResult =
  | {
      error: null;
      location: ShiftLocation | null;
    }
  | {
      error: string;
      location: null;
    };

export type ShiftLocationsBackendResult =
  | {
      error: null;
      locations: ShiftLocation[];
    }
  | {
      error: string;
      locations: [];
    };

function normalizeRpcRow(data: unknown): Shift | null {
  const row = Array.isArray(data) ? data[0] : data;

  return row ? (row as Shift) : null;
}

function normalizeLocationRpcRow(data: unknown): ShiftLocation | null {
  const row = Array.isArray(data) ? data[0] : data;

  return row ? (row as ShiftLocation) : null;
}

function getGermanDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
    year: "numeric",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));

  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

export async function loadTodayCourierShift(
  courierProfileId: string,
): Promise<ShiftBackendResult> {
  const today = getGermanDateString();
  const { data, error } = await insforge.database
    .from("shifts")
    .select(shiftSelect)
    .eq("courier_profile_id", courierProfileId)
    .eq("shift_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      error: "Die heutige Schicht konnte nicht vom Server geladen werden.",
      shift: null,
    };
  }

  return {
    error: null,
    shift: data ? (data as Shift) : null,
  };
}

export async function loadCourierShiftsForMonth({
  courierProfileId,
  monthEnd,
  monthStart,
}: {
  courierProfileId: string;
  monthEnd: string;
  monthStart: string;
}): Promise<ShiftListBackendResult> {
  const { data, error } = await insforge.database
    .from("shifts")
    .select(shiftSelect)
    .eq("courier_profile_id", courierProfileId)
    .gte("shift_date", monthStart)
    .lt("shift_date", monthEnd)
    .order("shift_date", { ascending: false });

  if (error) {
    return {
      error: "Schichthistorie konnte nicht vom Server geladen werden.",
      shifts: [],
    };
  }

  return {
    error: null,
    shifts: (data ?? []) as Shift[],
  };
}

export async function loadCourierShiftForDate({
  courierProfileId,
  shiftDate,
}: {
  courierProfileId: string;
  shiftDate: string;
}): Promise<ShiftBackendResult> {
  const { data, error } = await insforge.database
    .from("shifts")
    .select(shiftSelect)
    .eq("courier_profile_id", courierProfileId)
    .eq("shift_date", shiftDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      error: "Tagesdetails konnten nicht vom Server geladen werden.",
      shift: null,
    };
  }

  return {
    error: null,
    shift: data ? (data as Shift) : null,
  };
}

export async function startCourierShift(
  input: ShiftStartMutationInput,
): Promise<ShiftBackendResult> {
  const parsed = shiftStartMutationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Depot fuer den Schichtstart ist ungueltig.",
      shift: null,
    };
  }

  const { data, error } = await insforge.database.rpc("start_courier_shift", {
    p_depot_id: parsed.data.depotId,
  });

  if (error) {
    return {
      error: error.message || "Schicht konnte nicht gestartet werden.",
      shift: null,
    };
  }

  return {
    error: null,
    shift: normalizeRpcRow(data),
  };
}

export async function endCourierShift(
  input: ShiftEndMutationInput,
): Promise<ShiftBackendResult> {
  const parsed = shiftEndMutationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Schicht fuer das Beenden ist ungueltig.",
      shift: null,
    };
  }

  const { data, error } = await insforge.database.rpc("end_courier_shift", {
    p_shift_id: parsed.data.shiftId,
  });

  if (error) {
    return {
      error: error.message || "Schicht konnte nicht beendet werden.",
      shift: null,
    };
  }

  return {
    error: null,
    shift: normalizeRpcRow(data),
  };
}

export async function loadShiftLocations(
  shiftId: string,
): Promise<ShiftLocationsBackendResult> {
  const { data, error } = await insforge.database
    .from("shift_locations")
    .select(shiftLocationSelect)
    .eq("shift_id", shiftId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      error: "Schichtstandorte konnten nicht vom Server geladen werden.",
      locations: [],
    };
  }

  return {
    error: null,
    locations: (data ?? []) as ShiftLocation[],
  };
}

export async function saveShiftLocation(
  input: ShiftLocationMutationInput,
): Promise<ShiftLocationBackendResult> {
  const parsed = shiftLocationMutationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Schichtstandort ist ungueltig.",
      location: null,
    };
  }

  const { data, error } = await insforge.database.rpc("save_shift_location", {
    p_accuracy_meters: parsed.data.accuracyMeters ?? null,
    p_latitude: parsed.data.latitude,
    p_location_type: parsed.data.locationType,
    p_longitude: parsed.data.longitude,
    p_shift_id: parsed.data.shiftId,
  });

  if (error) {
    return {
      error: error.message || "Schichtstandort konnte nicht gespeichert werden.",
      location: null,
    };
  }

  return {
    error: null,
    location: normalizeLocationRpcRow(data),
  };
}
