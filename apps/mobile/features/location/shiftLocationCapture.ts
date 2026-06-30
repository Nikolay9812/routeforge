import * as Location from "expo-location";

import type { ShiftLocationType } from "@routeforge/shared";

export type LocalShiftLocationMissingReason = "permission_denied" | "unavailable";

export type LocalShiftLocationCheckpoint =
  | {
      accuracyMeters: number | null;
      capturedAt: string;
      latitude: number;
      locationType: ShiftLocationType;
      longitude: number;
      message: string;
      missingReason: null;
      status: "captured";
    }
  | {
      accuracyMeters: null;
      capturedAt: string;
      latitude: null;
      locationType: ShiftLocationType;
      longitude: null;
      message: string;
      missingReason: LocalShiftLocationMissingReason;
      status: "missing";
    }
  | {
      accuracyMeters: null;
      capturedAt: null;
      latitude: null;
      locationType: ShiftLocationType;
      longitude: null;
      message: string;
      missingReason: null;
      status: "pending";
    };

export type ShiftLocationCaptureResult = {
  checkpoint: LocalShiftLocationCheckpoint;
  success: boolean;
};

export function createPendingLocationCheckpoint(
  locationType: ShiftLocationType,
): LocalShiftLocationCheckpoint {
  return {
    accuracyMeters: null,
    capturedAt: null,
    latitude: null,
    locationType,
    longitude: null,
    message:
      locationType === "start"
        ? "Startstandort wird beim Schichtstart erfasst."
        : "Endstandort wird beim Schichtende erfasst.",
    missingReason: null,
    status: "pending",
  };
}

function createMissingLocationCheckpoint(
  locationType: ShiftLocationType,
  missingReason: LocalShiftLocationMissingReason,
  message: string,
): LocalShiftLocationCheckpoint {
  return {
    accuracyMeters: null,
    capturedAt: new Date().toISOString(),
    latitude: null,
    locationType,
    longitude: null,
    message,
    missingReason,
    status: "missing",
  };
}

function formatCapturedAt(timestamp: number): string {
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : new Date().toISOString();
}

export async function captureShiftLocation(
  locationType: ShiftLocationType,
): Promise<ShiftLocationCaptureResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== Location.PermissionStatus.GRANTED) {
      return {
        checkpoint: createMissingLocationCheckpoint(
          locationType,
          "permission_denied",
          "Standortberechtigung nicht erteilt. Schicht laeuft weiter.",
        ),
        success: false,
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: true,
    });

    return {
      checkpoint: {
        accuracyMeters: location.coords.accuracy,
        capturedAt: formatCapturedAt(location.timestamp),
        latitude: location.coords.latitude,
        locationType,
        longitude: location.coords.longitude,
        message:
          locationType === "start"
            ? "Startstandort lokal gespeichert."
            : "Endstandort lokal gespeichert.",
        missingReason: null,
        status: "captured",
      },
      success: true,
    };
  } catch (error) {
    console.error("[mobile/location/captureShiftLocation]", error);

    return {
      checkpoint: createMissingLocationCheckpoint(
        locationType,
        "unavailable",
        "Standort konnte nicht erfasst werden. Schicht laeuft weiter.",
      ),
      success: false,
    };
  }
}
