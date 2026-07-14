import type { Shift } from "@routeforge/shared";
import { useCallback, useMemo, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { DayDetailMetricGrid } from "@/components/history/DayDetailMetricGrid";
import { DayDetailPhotoGrid } from "@/components/history/DayDetailPhotoGrid";
import { DayDetailReportCard } from "@/components/history/DayDetailReportCard";
import { DayDetailSignatureCard } from "@/components/history/DayDetailSignatureCard";
import { DayDetailSummaryCard } from "@/components/history/DayDetailSummaryCard";
import { DayDetailWarningCard } from "@/components/history/DayDetailWarningCard";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMobileAuth } from "@/features/auth/AuthProvider";
import {
  createHistoryDayDetailFromServerShift,
  createHistoryShiftFromServerShift,
  getGermanMonthRangeForIsoDate,
} from "@/features/history/historyHydration";
import { downloadDailyShiftPdf } from "@/features/history/dailyPdfDownload";
import {
  type HistoryDayDetailViewModel,
  type HistoryShiftViewModel,
  type HistoryShiftStatus,
} from "@/features/history/historyTypes";
import { useMobileProfileHydration } from "@/features/profile/mobileProfileHydration";
import {
  loadShiftPhotosForShift,
  loadShiftSignatureArtifact,
} from "@/features/report/dailyReportBackend";
import { createHistoryDayDetailFromSubmittedReport } from "@/features/report/dailyReportHistory";
import { getStoredSubmittedDailyReports } from "@/features/report/dailyReportDraftStorage";
import {
  loadCourierShiftForDate,
  loadCourierShiftsForMonth,
  loadShiftLocations,
} from "@/features/shifts/shiftBackend";

const statusTone: Record<HistoryShiftStatus, "success" | "info" | "warning"> = {
  approved: "success",
  draft: "warning",
  rejected: "warning",
  submitted: "info",
};

export default function HistoryDayDetailScreen() {
  const { profile } = useMobileAuth();
  const hydratedProfile = useMobileProfileHydration();
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;
  const requestedDateIso = dateParam ?? formatGermanDateString();
  const [localDetail, setLocalDetail] = useState<HistoryDayDetailViewModel | null>(null);
  const [serverDetail, setServerDetail] = useState<HistoryDayDetailViewModel | null>(null);
  const [serverHistoryError, setServerHistoryError] = useState<string | null>(null);
  const [serverShiftRows, setServerShiftRows] = useState<HistoryShiftViewModel[]>([]);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<{
    message: string;
    tone: "error" | "success";
  } | null>(null);
  const detail = serverDetail ?? localDetail;
  const downloadableShiftId = serverDetail?.headerShift.id ?? null;
  const shiftDetails = useMemo(
    () =>
      mergeHistoryShifts(
        [
          ...(serverDetail ? [serverDetail.headerShift] : []),
          ...(localDetail ? [localDetail.headerShift] : []),
          ...serverShiftRows,
        ],
        [],
      ),
    [localDetail, serverDetail, serverShiftRows],
  );
  const currentIndex = shiftDetails.findIndex(
    (shift) => shift.dateIso === (detail?.dateIso ?? requestedDateIso),
  );
  const previousShift = currentIndex > 0 ? shiftDetails[currentIndex - 1] : null;
  const nextShift =
    currentIndex >= 0 && currentIndex < shiftDetails.length - 1
      ? shiftDetails[currentIndex + 1]
      : null;
  const canDownloadPdf = Boolean(downloadableShiftId) && !isPdfDownloading;
  const handleDownloadPdf = useCallback(async () => {
    if (!downloadableShiftId) {
      setPdfStatus({
        message: "Tages-PDF ist nur fuer Backend-Schichten verfuegbar.",
        tone: "error",
      });
      return;
    }

    setIsPdfDownloading(true);
    setPdfStatus(null);

    const result = await downloadDailyShiftPdf(downloadableShiftId);

    setIsPdfDownloading(false);

    if (result.error || !result.data) {
      setPdfStatus({
        message: result.error ?? "Tages-PDF konnte nicht geladen werden.",
        tone: "error",
      });
      return;
    }

    setPdfStatus({
      message: `${result.data.fileName} geladen (${formatFileSize(result.data.sizeBytes)}).`,
      tone: "success",
    });
  }, [downloadableShiftId]);
  const hasGeofenceWarning =
    Boolean(
      detail?.geofenceWarning.title.includes("ausserhalb") ||
        detail?.geofenceWarning.title.includes("außerhalb"),
    );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadServerMonthRows(currentShift?: Shift): Promise<void> {
        if (!profile?.id) {
          return;
        }

        const monthRange = getGermanMonthRangeForIsoDate(requestedDateIso);
        const monthResult = await loadCourierShiftsForMonth({
          companyId: profile.company_id,
          courierProfileId: profile.id,
          monthEnd: monthRange.monthEnd,
          monthStart: monthRange.monthStart,
        });

        if (!isActive) {
          return;
        }

        if (monthResult.error) {
          setServerShiftRows(
            currentShift
              ? [createHistoryShiftFromServerShift(currentShift, hydratedProfile.depotName)]
              : [],
          );
          return;
        }

        setServerShiftRows(
          monthResult.shifts.map((shift) =>
            createHistoryShiftFromServerShift(shift, hydratedProfile.depotName),
          ),
        );
      }

      async function loadServerDetail(): Promise<void> {
        if (!profile?.id) {
          setServerDetail(null);
          setServerHistoryError(null);
          setServerShiftRows([]);
          return;
        }

        setServerHistoryError(null);

        const dayResult = await loadCourierShiftForDate({
          companyId: profile.company_id,
          courierProfileId: profile.id,
          shiftDate: requestedDateIso,
        });

        if (!isActive) {
          return;
        }

        if (dayResult.error) {
          setServerDetail(null);
          setServerShiftRows([]);
          setServerHistoryError(dayResult.error);
          return;
        }

        if (!dayResult.shift) {
          setServerDetail(null);
          await loadServerMonthRows();
          return;
        }

        const [locationsResult, photosResult, signatureResult] = await Promise.all([
          loadShiftLocations(dayResult.shift.id, profile.company_id),
          loadShiftPhotosForShift(dayResult.shift.id, profile.company_id),
          loadShiftSignatureArtifact(dayResult.shift.id),
        ]);

        if (!isActive) {
          return;
        }

        setServerDetail(
          createHistoryDayDetailFromServerShift({
            courierName: profile.full_name,
            depotLabel: hydratedProfile.depotName,
            locations: locationsResult.error ? [] : locationsResult.locations,
            photos: photosResult.error ? [] : photosResult.photos,
            shift: dayResult.shift,
            signatureArtifact: signatureResult.artifact,
          }),
        );

        const relatedErrors = [
          locationsResult.error,
          photosResult.error,
          signatureResult.error,
        ].filter((message): message is string => Boolean(message));

        setServerHistoryError(relatedErrors[0] ?? null);
        await loadServerMonthRows(dayResult.shift);
      }

      async function loadLocalSubmittedReport(): Promise<void> {
        const reports = await getStoredSubmittedDailyReports();
        const submittedReport = reports.find(
          (report) => report.validationDraft.shiftDate === requestedDateIso,
        );

        if (!isActive) {
          return;
        }

        if (!submittedReport) {
          setLocalDetail(null);
          return;
        }

        const nextDetail = createHistoryDayDetailFromSubmittedReport(submittedReport);
        const signatureResult = await loadShiftSignatureArtifact(submittedReport.draftId);

        if (!isActive) {
          return;
        }

        setLocalDetail({
          ...nextDetail,
          signature: signatureResult.artifact
            ? {
                helper: "Private Server-Signatur wurde fuer diese Schicht verifiziert.",
                signedAtLabel: formatSignatureArtifactDate(
                  signatureResult.artifact.signed_at,
                ),
                signedByLabel: signatureResult.artifact.signed_by_name,
                storageLabel: "Server-Nachweis verfuegbar",
              }
            : nextDetail.signature,
        });
      }

      void loadServerDetail();
      void loadLocalSubmittedReport();

      return () => {
        isActive = false;
      };
    }, [
      hydratedProfile.depotName,
      profile?.company_id,
      profile?.full_name,
      profile?.id,
      requestedDateIso,
    ]),
  );

  if (!detail) {
    return (
      <MobileScreen>
        <View className="-mx-4 -mt-4 gap-5 bg-rfPrimary px-4 pb-5 pt-4">
          <View className="min-h-[56px] flex-row items-center justify-between">
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full"
              onPress={() => router.back()}>
              <RfIcon className="text-rfTextInverse" name="chevron-left" size={34} />
            </Pressable>
            <Text className="text-[24px] font-extrabold leading-8 text-rfTextInverse">
              Tagesdetails
            </Text>
            <View className="h-11 w-11 items-center justify-center rounded-full">
              <RfIcon className="text-rfTextInverse" name="calendar-month-outline" size={28} />
            </View>
          </View>
        </View>

        <View className="gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
          <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfWarningLightest">
            <RfIcon className="text-rfWarningForeground" name="calendar-alert" size={24} />
          </View>
          <Text className="text-[20px] font-extrabold leading-7 text-rfTextPrimary">
            Keine Tagesdetails
          </Text>
          <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
            Fuer {requestedDateIso} wurde keine eigene Backend-Schicht gefunden.
          </Text>
          {serverHistoryError ? (
            <Text className="text-[12px] font-semibold leading-4 text-rfWarningForeground">
              {serverHistoryError}
            </Text>
          ) : null}
        </View>
      </MobileScreen>
    );
  }

  return (
    <MobileScreen>
      <View className="-mx-4 -mt-4 gap-5 bg-rfPrimary px-4 pb-5 pt-4">
        <View className="min-h-[56px] flex-row items-center justify-between">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full"
            onPress={() => router.back()}>
            <RfIcon className="text-rfTextInverse" name="chevron-left" size={34} />
          </Pressable>
          <Text className="text-[24px] font-extrabold leading-8 text-rfTextInverse">
            Tagesdetails
          </Text>
          <View className="h-11 w-11 items-center justify-center rounded-full">
            <RfIcon className="text-rfTextInverse" name="calendar-month-outline" size={28} />
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-center gap-4">
        <DateNavButton
          disabled={!previousShift}
          onPress={() => previousShift && router.push(`./${previousShift.dateIso}`)}
          variant="previous"
        />
        <View className="min-w-[176px] items-center gap-1">
          <View className="flex-row items-center gap-2">
            <RfIcon className="text-rfTextPrimary" name="calendar-blank-outline" size={22} />
            <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
              {detail.dateLabel}
            </Text>
          </View>
          <Text className="text-[14px] font-semibold leading-5 text-rfTextSecondary">
            {detail.dayLabel}
          </Text>
        </View>
        <DateNavButton
          disabled={!nextShift}
          onPress={() => nextShift && router.push(`./${nextShift.dateIso}`)}
          variant="next"
        />
      </View>

      <View className="rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-[70px] w-[70px] items-center justify-center rounded-rf2xl bg-rfPrimaryLight">
            <Text className="text-[22px] font-extrabold leading-7 text-rfTextInverse">
              {detail.courierInitials}
            </Text>
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-[20px] font-extrabold leading-7 text-rfTextPrimary">
              {detail.courierName}
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              {detail.courierIdLabel} - {detail.headerShift.paymentModeLabel}
            </Text>
            {detail.isReadOnly ? (
              <Text className="text-[11px] font-semibold leading-[15px] text-rfTextMuted">
                Eingereichte und genehmigte Tage sind fuer Kuriere schreibgeschuetzt.
              </Text>
            ) : null}
          </View>
          <StatusBadge
            label={detail.headerShift.statusLabel}
            tone={statusTone[detail.headerShift.status]}
          />
        </View>
      </View>

      <DayDetailMetricGrid metrics={detail.timeMetrics} />

      {serverHistoryError ? (
        <View className="rounded-rf2xl border border-rfWarningLight bg-rfWarningLightest p-4">
          <Text className="text-[14px] font-extrabold leading-5 text-rfWarningForeground">
            Backend-Hinweis
          </Text>
          <Text className="mt-1 text-[12px] font-semibold leading-4 text-rfTextSecondary">
            {serverHistoryError}
          </Text>
        </View>
      ) : null}

      <DayDetailWarningCard
        helper={detail.geofenceWarning.helper}
        isWarning={hasGeofenceWarning}
        title={detail.geofenceWarning.title}
      />

      <DayDetailSummaryCard detail={detail} />

      <DayDetailPhotoGrid photos={detail.photos} />

      <DayDetailSignatureCard signature={detail.signature} />

      <DayDetailReportCard note={detail.note} rows={detail.detailRows} />

      <Pressable
        className={`min-h-[56px] flex-row items-center justify-center gap-2.5 rounded-rfXl px-5 py-3 ${
          canDownloadPdf ? "bg-rfPrimary" : "bg-rfNeutralLight"
        }`}
        disabled={!canDownloadPdf}
        onPress={handleDownloadPdf}>
        <RfIcon
          className={canDownloadPdf ? "text-rfTextInverse" : "text-rfTextMuted"}
          name={isPdfDownloading ? "file-clock-outline" : "download-outline"}
          size={23}
        />
        <Text
          className={`text-[15px] font-extrabold leading-5 ${
            canDownloadPdf ? "text-rfTextInverse" : "text-rfTextMuted"
          }`}>
          {isPdfDownloading ? "Tages-PDF wird erstellt" : detail.pdfLabel}
        </Text>
      </Pressable>
      {pdfStatus ? (
        <Text
          className={`text-center text-[12px] font-semibold leading-4 ${
            pdfStatus.tone === "success" ? "text-rfPrimary" : "text-rfWarningForeground"
          }`}>
          {pdfStatus.message}
        </Text>
      ) : null}
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

function formatSignatureArtifactDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
    year: "numeric",
  }).format(new Date(value));
}

function formatGermanDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
    year: "numeric",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));

  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  return `${Math.max(sizeBytes / 1024, 1).toFixed(0)} KB`;
}

function DateNavButton({
  disabled,
  onPress,
  variant,
}: {
  disabled: boolean;
  onPress: () => void;
  variant: "next" | "previous";
}) {
  return (
    <Pressable
      className={`h-12 w-12 items-center justify-center rounded-full border ${
        disabled ? "border-rfBorderLight bg-rfNeutralLight" : "border-rfBorder bg-rfSurface"
      }`}
      disabled={disabled}
      onPress={onPress}>
      <RfIcon
        className={disabled ? "text-rfTextMuted" : "text-rfTextPrimary"}
        name={variant === "previous" ? "chevron-left" : "chevron-right"}
        size={26}
      />
    </Pressable>
  );
}

