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
import {
  getHistoryDayDetail,
  mockHistoryMonth,
  type HistoryDayDetailMock,
  type HistoryShiftMock,
  type HistoryShiftStatus,
} from "@/features/mock/history";
import { loadShiftSignatureArtifact } from "@/features/report/dailyReportBackend";
import { createHistoryDayDetailFromSubmittedReport } from "@/features/report/dailyReportHistory";
import { getStoredSubmittedDailyReports } from "@/features/report/dailyReportDraftStorage";

const statusTone: Record<HistoryShiftStatus, "success" | "info" | "warning"> = {
  approved: "success",
  draft: "warning",
  rejected: "warning",
  submitted: "info",
};

export default function HistoryDayDetailScreen() {
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;
  const requestedDateIso = dateParam ?? mockHistoryMonth.recentShifts[0].dateIso;
  const [localDetail, setLocalDetail] = useState<HistoryDayDetailMock | null>(null);
  const detail = localDetail ?? getHistoryDayDetail(requestedDateIso);
  const shiftDetails = useMemo(
    () =>
      mergeHistoryShifts(
        localDetail ? [localDetail.headerShift] : [],
        mockHistoryMonth.shiftDetails,
      ),
    [localDetail],
  );
  const currentIndex = shiftDetails.findIndex(
    (shift) => shift.dateIso === detail.dateIso,
  );
  const previousShift = currentIndex > 0 ? shiftDetails[currentIndex - 1] : null;
  const nextShift =
    currentIndex >= 0 && currentIndex < shiftDetails.length - 1
      ? shiftDetails[currentIndex + 1]
      : null;
  const hasGeofenceWarning =
    detail.geofenceWarning.title.includes("ausserhalb") ||
    detail.geofenceWarning.title.includes("außerhalb");

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

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

      void loadLocalSubmittedReport();

      return () => {
        isActive = false;
      };
    }, [requestedDateIso]),
  );

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
                Genehmigte Tage sind fuer Kuriere schreibgeschuetzt.
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

      <DayDetailWarningCard
        helper={detail.geofenceWarning.helper}
        isWarning={hasGeofenceWarning}
        title={detail.geofenceWarning.title}
      />

      <DayDetailSummaryCard detail={detail} />

      <DayDetailPhotoGrid photos={detail.photos} />

      <DayDetailSignatureCard signature={detail.signature} />

      <DayDetailReportCard note={detail.note} rows={detail.detailRows} />

      <Pressable className="min-h-[56px] flex-row items-center justify-center gap-2.5 rounded-rfXl bg-rfPrimary px-5 py-3">
        <RfIcon className="text-rfTextInverse" name="download-outline" size={23} />
        <Text className="text-[15px] font-extrabold leading-5 text-rfTextInverse">
          {detail.pdfLabel}
        </Text>
      </Pressable>
    </MobileScreen>
  );
}

function mergeHistoryShifts(
  primaryShifts: HistoryShiftMock[],
  fallbackShifts: HistoryShiftMock[],
): HistoryShiftMock[] {
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
