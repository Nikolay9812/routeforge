import type { Shift } from "@routeforge/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { HistoryCalendar } from "@/components/history/HistoryCalendar";
import { HistoryShiftRow } from "@/components/history/HistoryShiftRow";
import { HistorySummaryTile } from "@/components/history/HistorySummaryTile";
import { SelectedDaySummary } from "@/components/history/SelectedDaySummary";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { MobileSkeletonList, MobileStateCard } from "@/components/ui/MobileState";
import { useMobileAuth } from "@/features/auth/AuthProvider";
import {
  createHydratedHistoryMonth,
  getCurrentGermanMonthRange,
} from "@/features/history/historyHydration";
import { downloadMonthlyShiftPdf } from "@/features/history/dailyPdfDownload";
import type { HistoryShiftViewModel } from "@/features/history/historyTypes";
import { useMobileProfileHydration } from "@/features/profile/mobileProfileHydration";
import { createHistoryShiftFromSubmittedReport } from "@/features/report/dailyReportHistory";
import { getStoredSubmittedDailyReports } from "@/features/report/dailyReportDraftStorage";
import { loadCourierShiftsForMonth } from "@/features/shifts/shiftBackend";

export default function HistoryScreen() {
  const { profile } = useMobileAuth();
  const hydratedProfile = useMobileProfileHydration();
  const currentMonthRange = useMemo(() => getCurrentGermanMonthRange(), []);
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [serverHistoryError, setServerHistoryError] = useState<string | null>(null);
  const [serverHistoryLoaded, setServerHistoryLoaded] = useState(false);
  const [serverHistoryLoading, setServerHistoryLoading] = useState(false);
  const [serverHistoryReloadKey, setServerHistoryReloadKey] = useState(0);
  const [serverShifts, setServerShifts] = useState<Shift[]>([]);
  const [isMonthlyPdfDownloading, setIsMonthlyPdfDownloading] = useState(false);
  const [monthlyPdfStatus, setMonthlyPdfStatus] = useState<{
    message: string;
    tone: "error" | "success";
  } | null>(null);
  const [localSubmittedShifts, setLocalSubmittedShifts] = useState<HistoryShiftViewModel[]>([]);
  const serverHistoryMonth = useMemo(
    () =>
      serverHistoryLoaded
        ? createHydratedHistoryMonth({
            depotLabel: hydratedProfile.depotName,
            monthRange: currentMonthRange,
            shifts: serverShifts,
          })
        : null,
    [currentMonthRange, hydratedProfile.depotName, serverHistoryLoaded, serverShifts],
  );
  const emptyHistoryMonth = useMemo(
    () =>
      createHydratedHistoryMonth({
        depotLabel: hydratedProfile.depotName,
        monthRange: currentMonthRange,
        shifts: [],
      }),
    [currentMonthRange, hydratedProfile.depotName],
  );
  const activeHistoryMonth = serverHistoryMonth ?? emptyHistoryMonth;
  const fallbackSubmittedShifts = useMemo(
    () => localSubmittedShifts,
    [localSubmittedShifts],
  );
  const shiftDetails = useMemo(
    () => mergeHistoryShifts(fallbackSubmittedShifts, activeHistoryMonth.shiftDetails),
    [activeHistoryMonth.shiftDetails, fallbackSubmittedShifts],
  );
  const recentShifts = useMemo(
    () => mergeHistoryShifts(fallbackSubmittedShifts, activeHistoryMonth.recentShifts),
    [activeHistoryMonth.recentShifts, fallbackSubmittedShifts],
  );
  const selectedShift = useMemo(
    () => shiftDetails.find((shift) => shift.id === selectedShiftId) ?? recentShifts[0] ?? null,
    [recentShifts, selectedShiftId, shiftDetails],
  );
  const canDownloadMonthlyPdf =
    Boolean(profile?.id) &&
    serverHistoryLoaded &&
    !serverHistoryError &&
    !isMonthlyPdfDownloading;
  const handleDownloadMonthlyPdf = useCallback(async () => {
    if (!profile?.id) {
      setMonthlyPdfStatus({
        message: "Bitte erneut anmelden, bevor du das Monats-PDF laedst.",
        tone: "error",
      });
      return;
    }

    if (!serverHistoryLoaded) {
      setMonthlyPdfStatus({
        message: "Monats-PDF ist verfuegbar, sobald die Backend-Historie geladen ist.",
        tone: "error",
      });
      return;
    }

    setIsMonthlyPdfDownloading(true);
    setMonthlyPdfStatus(null);

    const result = await downloadMonthlyShiftPdf({
      courierId: profile.id,
      month: currentMonthRange.monthStart.slice(0, 7),
    });

    setIsMonthlyPdfDownloading(false);

    if (result.error || !result.data) {
      setMonthlyPdfStatus({
        message: result.error ?? "Monats-PDF konnte nicht geladen werden.",
        tone: "error",
      });
      return;
    }

    setMonthlyPdfStatus({
      message: `${result.data.fileName} geladen (${formatFileSize(result.data.sizeBytes)}).`,
      tone: "success",
    });
  }, [currentMonthRange.monthStart, profile?.id, serverHistoryLoaded]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadLocalSubmittedReports(): Promise<void> {
        const reports = await getStoredSubmittedDailyReports();

        if (!isActive) {
          return;
        }

        setLocalSubmittedShifts(
          reports
            .map(createHistoryShiftFromSubmittedReport)
            .sort((leftShift, rightShift) => rightShift.dateIso.localeCompare(leftShift.dateIso)),
        );
      }

      async function loadServerHistory(): Promise<void> {
        if (!profile?.id) {
          setServerShifts([]);
          setServerHistoryLoaded(false);
          setServerHistoryError(null);
          setServerHistoryLoading(false);
          return;
        }

        setServerHistoryLoading(true);
        setServerHistoryError(null);
        if (serverHistoryReloadKey > 0) {
          setMonthlyPdfStatus(null);
        }

        const result = await loadCourierShiftsForMonth({
          companyId: profile.company_id,
          courierProfileId: profile.id,
          monthEnd: currentMonthRange.monthEnd,
          monthStart: currentMonthRange.monthStart,
        });

        if (!isActive) {
          return;
        }

        setServerHistoryLoading(false);

        if (result.error) {
          setServerShifts([]);
          setServerHistoryLoaded(false);
          setServerHistoryError(result.error);
          return;
        }

        setServerShifts(result.shifts);
        setServerHistoryLoaded(true);
      }

      void loadLocalSubmittedReports();
      void loadServerHistory();

      return () => {
        isActive = false;
      };
    }, [
      currentMonthRange.monthEnd,
      currentMonthRange.monthStart,
      profile?.company_id,
      profile?.id,
      serverHistoryReloadKey,
    ]),
  );

  useEffect(() => {
    if (shiftDetails.length === 0) {
      setSelectedShiftId("");
      return;
    }

    if (!shiftDetails.some((shift) => shift.id === selectedShiftId)) {
      setSelectedShiftId(shiftDetails[0].id);
    }
  }, [selectedShiftId, shiftDetails]);

  return (
    <MobileScreen>
      <MobileHeader />

      <View className="gap-3">
        <View className="flex-row items-end justify-between gap-3">
          <View className="gap-1">
            <Text className="text-[30px] font-extrabold leading-9 text-rfTextPrimary">
              Historie
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              Monatsuebersicht deiner Schichten
            </Text>
          </View>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full border border-rfBorder bg-rfSurface">
            <RfIcon className="text-rfTextSecondary" name="tune-variant" size={22} />
          </Pressable>
        </View>

        <HistoryCalendar
          days={activeHistoryMonth.calendarDays}
          monthLabel={activeHistoryMonth.monthLabel}
          onSelectDay={setSelectedShiftId}
          selectedShiftId={selectedShiftId}
        />
      </View>

      <View className="flex-row gap-2.5">
        <FilterChip iconName="calendar-month-outline" label={activeHistoryMonth.monthLabel} selected />
        {activeHistoryMonth.filters.map((filter) => (
          <FilterChip iconName={filter.startsWith("Status") ? "filter-outline" : "warehouse"} key={filter} label={filter} />
        ))}
      </View>

      {serverHistoryLoading && recentShifts.length === 0 ? (
        <MobileStateCard
          compact
          message="Serverdaten fuer den aktuellen Monat werden geprueft."
          title="Historie wird geladen"
          tone="loading"
        />
      ) : null}

      {serverHistoryError ? (
        <MobileStateCard
          actionLabel="Erneut versuchen"
          compact
          message={`${serverHistoryError} Lokale Berichte bleiben erhalten.`}
          onAction={() => setServerHistoryReloadKey((key) => key + 1)}
          title="Historie konnte nicht geladen werden"
          tone="offline"
        />
      ) : null}

      <View className="overflow-hidden rounded-rf3xl border border-rfBorder bg-rfSurface">
        <View className="flex-row">
          {activeHistoryMonth.summary.map((metric, index) => (
            <HistorySummaryTile
              helper={metric.helper}
              iconName={metric.iconName}
              key={metric.label}
              label={metric.label}
              showDivider={index < activeHistoryMonth.summary.length - 1}
              value={metric.value}
            />
          ))}
        </View>
      </View>

      {serverHistoryLoading && recentShifts.length === 0 ? (
        <RouteForgeCard compact>
          <MobileSkeletonList rows={1} />
        </RouteForgeCard>
      ) : selectedShift ? (
        <SelectedDaySummary
          helper={activeHistoryMonth.selectedDayHelper}
          onOpenDetails={() => router.push(`../history/${selectedShift.dateIso}`)}
          shift={selectedShift}
        />
      ) : (
        <RouteForgeCard compact>
          <View className="items-center gap-2 py-3">
            <RfIcon className="text-rfTextMuted" name="calendar-blank-outline" size={28} />
            <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
              Keine Schichten in diesem Monat
            </Text>
            <Text className="text-center text-[12px] font-semibold leading-4 text-rfTextSecondary">
              Sobald eine eigene Schicht im Backend existiert, erscheint sie hier.
            </Text>
          </View>
        </RouteForgeCard>
      )}

      <Pressable
        className={`min-h-[56px] flex-row items-center justify-center gap-2.5 rounded-rfXl px-4 py-3 ${
          canDownloadMonthlyPdf ? "bg-rfPrimary" : "border border-rfBorder bg-rfNeutralLight"
        }`}
        disabled={!canDownloadMonthlyPdf}
        onPress={handleDownloadMonthlyPdf}>
        <RfIcon
          className={canDownloadMonthlyPdf ? "text-rfTextInverse" : "text-rfTextMuted"}
          name={isMonthlyPdfDownloading ? "file-clock-outline" : "download-outline"}
          size={22}
        />
        <Text
          className={`text-[14px] font-extrabold leading-5 ${
            canDownloadMonthlyPdf ? "text-rfTextInverse" : "text-rfTextMuted"
          }`}>
          {isMonthlyPdfDownloading ? "Monats-PDF wird erstellt" : "Monats-PDF herunterladen"}
        </Text>
      </Pressable>
      {monthlyPdfStatus ? (
        <Text
          className={`text-center text-[12px] font-semibold leading-4 ${
            monthlyPdfStatus.tone === "success"
              ? "text-rfPrimary"
              : "text-rfWarningForeground"
          }`}>
          {monthlyPdfStatus.message}
        </Text>
      ) : null}

      <RouteForgeCard className="overflow-hidden p-0">
        <View className="flex-row items-center justify-between gap-3 px-4 pt-4">
          <View className="gap-0.5">
            <Text className="text-[17px] font-extrabold leading-6 text-rfTextPrimary">
              Letzte Schichten
            </Text>
            <Text className="text-[12px] font-medium leading-4 text-rfTextSecondary">
              {serverHistoryMonth
                ? `Serverdaten fuer ${activeHistoryMonth.monthLabel}`
                : serverHistoryLoading
                  ? "Serverdaten werden geprueft"
                  : `Keine Serverdaten fuer ${activeHistoryMonth.monthLabel}`}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-[13px] font-extrabold leading-[18px] text-rfPrimary">
              Alle anzeigen
            </Text>
            <RfIcon className="text-rfPrimary" name="chevron-right" size={18} />
          </View>
        </View>

        <View>
          {serverHistoryLoading && recentShifts.length === 0 ? (
            <View className="px-4 py-4">
              <MobileSkeletonList rows={3} />
            </View>
          ) : recentShifts.length > 0 ? (
            recentShifts.map((shift) => (
              <HistoryShiftRow
                isSelected={shift.id === selectedShiftId}
                key={shift.id}
                onPress={() => setSelectedShiftId(shift.id)}
                shift={shift}
              />
            ))
          ) : (
            <View className="px-4 py-6">
              <Text className="text-center text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
                Keine Backend-Schichten fuer diesen Monat gefunden.
              </Text>
            </View>
          )}
        </View>
      </RouteForgeCard>
    </MobileScreen>
  );
}

function mergeHistoryShifts(
  primaryShifts: HistoryShiftViewModel[],
  fallbackShifts: HistoryShiftViewModel[],
): HistoryShiftViewModel[] {
  const shiftIds = new Set<string>();

  return [...primaryShifts, ...fallbackShifts].filter((shift) => {
    if (shiftIds.has(shift.id)) {
      return false;
    }

    shiftIds.add(shift.id);

    return true;
  });
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  return `${Math.max(sizeBytes / 1024, 1).toFixed(0)} KB`;
}

function FilterChip({
  iconName,
  label,
  selected = false,
}: {
  iconName: "calendar-month-outline" | "filter-outline" | "warehouse";
  label: string;
  selected?: boolean;
}) {
  return (
    <Pressable
      className={`min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-rfXl border px-3 py-2 ${
        selected ? "border-rfPrimary bg-rfPrimaryLightest" : "border-rfBorder bg-rfSurface"
      }`}>
      <RfIcon
        className={selected ? "text-rfPrimary" : "text-rfTextSecondary"}
        name={iconName}
        size={19}
      />
      <Text
        className={`text-center text-[12px] font-extrabold leading-4 ${
          selected ? "text-rfPrimaryDarker" : "text-rfTextPrimary"
        }`}>
        {label}
      </Text>
      <RfIcon
        className={selected ? "text-rfPrimary" : "text-rfTextSecondary"}
        name="chevron-down"
        size={17}
      />
    </Pressable>
  );
}

