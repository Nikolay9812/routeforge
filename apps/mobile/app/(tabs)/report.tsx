import { Pressable, Text, View } from "react-native";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { PhotoUploadCard } from "@/components/report/PhotoUploadCard";
import { ReportCounterTile } from "@/components/report/ReportCounterTile";
import { ReportField } from "@/components/report/ReportField";
import { ReportSectionCard } from "@/components/report/ReportSectionCard";
import { SignaturePlaceholderCard } from "@/components/report/SignaturePlaceholderCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockDailyReport } from "@/features/mock/dailyReport";
import {
  validateDailyReportDraft,
  type DailyReportValidationField,
} from "@/features/report/dailyReportValidation";

const reportFieldValidationKeys: Record<string, DailyReportValidationField> = {
  Depot: "depotId",
  "End-KM": "endKm",
  Fahrzeug: "vanPlate",
  "Start-KM": "startKm",
};

export default function ReportScreen() {
  const validation = validateDailyReportDraft(mockDailyReport.validationDraft);
  const submitButtonClassName = validation.isValid ? "bg-rfPrimary" : "bg-rfNeutralLight";
  const submitTextClassName = validation.isValid ? "text-rfTextInverse" : "text-rfTextMuted";

  return (
    <MobileScreen>
      <MobileHeader />

      <View className="gap-3.5 rounded-rf3xl border border-rfBorder bg-rfSurface p-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
              <RfIcon className="text-rfPrimary" name="clipboard-text-outline" size={25} />
            </View>
            <View className="gap-0.5">
              <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
                Tagesbericht
              </Text>
              <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
                {mockDailyReport.dateLabel}
              </Text>
            </View>
          </View>
          <StatusBadge label={mockDailyReport.shiftStatusLabel} tone="warning" />
        </View>

        <View className="flex-row rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary">
          <View className="flex-1 gap-1 border-r border-rfBorderLight p-3.5">
            <RfIcon className="text-rfPrimary" name="calendar-month-outline" size={22} />
            <Text className="text-[13px] font-bold leading-[18px] text-rfTextPrimary">
              Heute
            </Text>
            <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
              Berichtstag
            </Text>
          </View>
          <View className="flex-1 gap-1 border-r border-rfBorderLight p-3.5">
            <RfIcon className="text-rfPrimary" name="clock-outline" size={22} />
            <Text className="text-[13px] font-bold leading-[18px] text-rfTextPrimary">
              {mockDailyReport.timeLabel}
            </Text>
            <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
              {mockDailyReport.totalDurationLabel}
            </Text>
          </View>
          <View className="flex-1 gap-1 p-3.5">
            <RfIcon className="text-rfPrimary" name="routes" size={22} />
            <Text className="text-[13px] font-bold leading-[18px] text-rfTextPrimary">
              {mockDailyReport.routeCode}
            </Text>
            <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
              {mockDailyReport.routeLabel}
            </Text>
          </View>
        </View>

        <View
          className={`gap-2 rounded-rf2xl border p-3 ${
            validation.isValid
              ? "border-rfSuccessLight bg-rfSuccessLightest"
              : "border-rfWarningLight bg-rfWarningLightest"
          }`}>
          <View className="flex-row items-center gap-2">
            <RfIcon
              className={
                validation.isValid ? "text-rfSuccessForeground" : "text-rfWarningForeground"
              }
              name={validation.isValid ? "check-circle-outline" : "alert-circle-outline"}
              size={20}
            />
            <Text
              className={`flex-1 text-[13px] font-extrabold leading-[18px] ${
                validation.isValid ? "text-rfSuccessForeground" : "text-rfWarningForeground"
              }`}>
              {validation.isValid ? "Bericht bereit zum Einreichen" : "Bericht noch unvollstaendig"}
            </Text>
          </View>
          {!validation.isValid ? (
            <View className="gap-1 pl-7">
              {validation.summaryMessages.slice(0, 3).map((message) => (
                <Text
                  className="text-[12px] font-medium leading-4 text-rfWarningForeground"
                  key={message}>
                  {message}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      <ReportSectionCard
        helper="Depot, Fahrzeug und Kilometerwerte fuer diese Schicht."
        index={1}
        title="Schichtdaten">
        <View className="flex-row gap-2.5">
          {mockDailyReport.depotFields.slice(0, 2).map((field) => (
            <ReportField
              error={validation.fieldErrors[reportFieldValidationKeys[field.label]]}
              helper={field.helper}
              iconName={field.iconName}
              key={field.label}
              label={field.label}
              required={field.required}
              value={field.value}
            />
          ))}
        </View>
        <View className="flex-row gap-2.5">
          {mockDailyReport.depotFields.slice(2).map((field) => (
            <ReportField
              error={validation.fieldErrors[reportFieldValidationKeys[field.label]]}
              helper={field.helper}
              iconName={field.iconName}
              key={field.label}
              label={field.label}
              required={field.required}
              value={field.value}
            />
          ))}
        </View>
      </ReportSectionCard>

      <ReportSectionCard
        helper="Paketzaehler bleiben bis zur Validierung mock-only."
        index={2}
        title="Paketübersicht">
        <View className="flex-row rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary">
          {mockDailyReport.counters.map((counter, index) => (
            <ReportCounterTile
              helper={counter.helper}
              iconName={counter.iconName}
              key={counter.label}
              label={counter.label}
              showDivider={index < mockDailyReport.counters.length - 1}
              value={counter.value}
            />
          ))}
        </View>
      </ReportSectionCard>

      <ReportSectionCard
        helper={
          validation.photoError ??
          "Erforderlich: Start-KM, End-KM, Fahrtenbuch und Mentor."
        }
        index={3}
        title="Nachweisfotos">
        <View className="flex-row gap-2.5">
          {mockDailyReport.photos.slice(0, 2).map((photo) => (
            <PhotoUploadCard
              helper={photo.helper}
              iconName={photo.iconName}
              key={photo.label}
              label={photo.label}
              required={photo.required}
              state={
                validation.missingPhotoTypes.includes(photo.photoType) ? "error" : photo.state
              }
            />
          ))}
        </View>
        <View className="flex-row gap-2.5">
          {mockDailyReport.photos.slice(2).map((photo) => (
            <PhotoUploadCard
              helper={photo.helper}
              iconName={photo.iconName}
              key={photo.label}
              label={photo.label}
              required={photo.required}
              state={
                validation.missingPhotoTypes.includes(photo.photoType) ? "error" : photo.state
              }
            />
          ))}
        </View>
        <View className="flex-row items-center gap-2 rounded-rf2xl bg-rfPrimaryLightest p-3">
          <RfIcon className="text-rfPrimary" name="shield-check-outline" size={20} />
          <Text className="flex-1 text-[12px] font-medium leading-4 text-rfPrimaryDarker">
            Fotos sind private Schichtnachweise und werden spaeter nach 14 Tagen geloescht.
          </Text>
        </View>
      </ReportSectionCard>

      <ReportSectionCard index={4} title="Anmerkungen">
        <View className="min-h-[118px] justify-between rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-4">
          <Text className="text-[14px] font-medium leading-5 text-rfTextPrimary">
            {mockDailyReport.note}
          </Text>
          <Text className="self-end text-[11px] font-medium leading-[15px] text-rfTextMuted">
            {mockDailyReport.note.length} / 500
          </Text>
        </View>
      </ReportSectionCard>

      <ReportSectionCard
        helper="Die Unterschrift wird als eigene spaetere Funktion umgesetzt."
        index={5}
        title="Unterschrift">
        <SignaturePlaceholderCard
          error={validation.signatureError}
          helper={mockDailyReport.signatureHelper}
          label="Kurier-Unterschrift"
          statusLabel={mockDailyReport.signatureStatusLabel}
        />
      </ReportSectionCard>

      <View className="gap-2">
        <Pressable
          accessibilityRole="button"
          disabled={!validation.isValid}
          className={`min-h-[56px] flex-row items-center justify-center gap-3 rounded-rfXl px-5 py-3 ${submitButtonClassName}`}>
          <RfIcon className={submitTextClassName} name="send-outline" size={24} />
          <Text className={`text-[15px] font-extrabold leading-5 ${submitTextClassName}`}>
            Bericht einreichen
          </Text>
        </Pressable>
        <Text className="px-4 text-center text-xs font-medium leading-4 text-rfTextMuted">
          {validation.isValid
            ? mockDailyReport.submittedHint
            : "Fehlende Pflichtangaben blockieren das Einreichen."}
        </Text>
      </View>
    </MobileScreen>
  );
}
