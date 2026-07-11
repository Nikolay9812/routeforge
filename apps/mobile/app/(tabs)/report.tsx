import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import type { Shift, ShiftPhotoType } from "@routeforge/shared";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { PhotoUploadCard } from "@/components/report/PhotoUploadCard";
import { ReportCounterTile } from "@/components/report/ReportCounterTile";
import { ReportField } from "@/components/report/ReportField";
import { ReportSectionCard } from "@/components/report/ReportSectionCard";
import { SignatureCard } from "@/components/report/SignatureCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { rfColors } from "@/constants/routeforgeTheme";
import { useMobileAuth } from "@/features/auth/AuthProvider";
import { mockDailyReport } from "@/features/mock/dailyReport";
import { submitDailyReport } from "@/features/report/dailyReportBackend";
import {
  formatDraftSavedAtLabel,
  formatSubmittedAtLabel,
  getStoredDailyReportDraft,
  saveDailyReportDraft,
  type StoredDailyReportDraft,
} from "@/features/report/dailyReportDraftStorage";
import {
  validateDailyReportDraft,
  type DailyReportLifecycleStatus,
  type DailyReportValidationDraft,
} from "@/features/report/dailyReportValidation";
import {
  captureShiftPhoto,
  getShiftPhotoCompressionLabel,
  type LocalShiftPhoto,
  type PhotoCaptureSource,
} from "@/features/report/photoCapture";
import type { LocalSignature } from "@/features/report/signatureCapture";
import { loadTodayCourierShift } from "@/features/shifts/shiftBackend";

type ReportFormState = {
  courierNote: string;
  endKm: string;
  missingProofExplanation: string;
  packagesDelivered: string;
  packagesPickedUp: string;
  packagesReturned: string;
  startKm: string;
  totalStops: string;
  tourNumber: string;
  vanPlate: string;
};

const photoLabels: Record<ShiftPhotoType, string> = {
  end_km: "End-KM Foto",
  fahrtenbuch: "Fahrtenbuch",
  mentor: "Mentor Screenshot",
  start_km: "Start-KM Foto",
};

export default function ReportScreen() {
  const { profile } = useMobileAuth();
  const [formState, setFormState] = useState<ReportFormState>(() =>
    createFormState(mockDailyReport.validationDraft, mockDailyReport.note, ""),
  );
  const [capturedPhotos, setCapturedPhotos] = useState<
    Partial<Record<ShiftPhotoType, LocalShiftPhoto>>
  >({});
  const [backendShift, setBackendShift] = useState<Shift | null>(null);
  const [backendShiftError, setBackendShiftError] = useState<string | null>(null);
  const [localSignature, setLocalSignature] = useState<LocalSignature | null>(null);
  const [busyPhotoType, setBusyPhotoType] = useState<ShiftPhotoType | null>(null);
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [photoCaptureError, setPhotoCaptureError] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<DailyReportLifecycleStatus>("draft");
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [syncQueueOperationId, setSyncQueueOperationId] = useState<string | null>(null);
  const [syncStatusError, setSyncStatusError] = useState<string | null>(null);
  const isLocked = reportStatus === "submitted";
  const activeDraftId = backendShift?.id ?? mockDailyReport.draftId;

  const uploadedPhotoTypes = useMemo(
    () => mockDailyReport.validationDraft.uploadedPhotoTypes,
    [],
  );
  const validationDraft = useMemo(
    () =>
      createValidationDraftFromForm({
        backendShift,
        formState,
        localSignature,
        uploadedPhotoTypes,
      }),
    [backendShift, formState, localSignature, uploadedPhotoTypes],
  );
  const validation = validateDailyReportDraft({
    draft: validationDraft,
    missingProofExplanation: formState.missingProofExplanation,
  });
  const effectiveStatus: DailyReportLifecycleStatus = isLocked
    ? "submitted"
    : validation.isValid
      ? "ready_to_submit"
      : "draft";
  const submitBlocker =
    backendShift === null
      ? backendShiftError ?? "Heute wurde noch keine Backend-Schicht geladen."
      : backendShift.end_time === null
        ? "Schicht zuerst beenden, dann den Tagesbericht einreichen."
        : null;
  const canSubmit =
    validation.isValid && !isLocked && !isSubmittingReport && submitBlocker === null;
  const submitButtonClassName =
    canSubmit ? "bg-rfPrimary" : "bg-rfNeutralLight";
  const submitTextClassName =
    canSubmit ? "text-rfTextInverse" : "text-rfTextMuted";
  const draftSavedAtLabel = lastSavedAt ? formatDraftSavedAtLabel(lastSavedAt) : null;
  const syncStatusLabel = isSavingDraft
    ? "Speichert"
    : isSubmittingReport
      ? "Sync laeuft"
    : syncStatusError
      ? "Sync-Fehler"
      : isLocked
        ? "Synchronisiert"
        : lastSavedAt
          ? "Lokal gespeichert"
          : "Lokal offen";
  const syncStatusTone = syncStatusError
    ? "error"
    : isLocked
      ? "success"
      : isSubmittingReport
        ? "info"
        : "neutral";

  useEffect(() => {
    const profileId = profile?.id;

    if (!profileId) {
      setBackendShift(null);
      setBackendShiftError("Kurierprofil konnte nicht geladen werden.");
      return;
    }

    const courierProfileId = profileId;
    let isMounted = true;

    async function loadBackendShift(): Promise<void> {
      setBackendShiftError(null);

      try {
        const result = await loadTodayCourierShift(courierProfileId);

        if (!isMounted) {
          return;
        }

        if (result.error) {
          setBackendShift(null);
          setBackendShiftError(result.error);
          return;
        }

        setBackendShift(result.shift);

        if (!result.shift) {
          setBackendShiftError("Keine heutige Schicht im Backend gefunden.");
        }
      } catch (error) {
        console.error("[mobile/report/loadTodayCourierShift]", error);

        if (isMounted) {
          setBackendShift(null);
          setBackendShiftError("Backend-Schicht konnte nicht geladen werden.");
        }
      }
    }

    void loadBackendShift();

    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  useEffect(() => {
    if (backendShift?.status !== "submitted") {
      return;
    }

    const submittedTimestamp = backendShift.submitted_at ?? new Date().toISOString();

    setBackendShiftError(null);
    setLockedAt(submittedTimestamp);
    setReportStatus("submitted");
    setSubmittedAt(submittedTimestamp);
    setSyncStatusError(null);
  }, [backendShift?.status, backendShift?.submitted_at]);

  useEffect(() => {
    let isMounted = true;

    async function hydrateDraft(): Promise<void> {
      setHasHydratedDraft(false);
      const storedDraft = await getStoredDailyReportDraft(activeDraftId);

      if (!isMounted) {
        return;
      }

      if (storedDraft) {
        hydrateStoredDraft(storedDraft);
      } else if (backendShift) {
        hydrateBackendShiftDraft(backendShift);
      }

      setHasHydratedDraft(true);
    }

    void hydrateDraft();

    return () => {
      isMounted = false;
    };
  }, [activeDraftId, backendShift]);

  useEffect(() => {
    if (!hasHydratedDraft || isLocked || backendShift === null) {
      return;
    }

    let isCancelled = false;

    async function persistDraft(): Promise<void> {
      setIsSavingDraft(true);
      setSyncStatusError(null);

      try {
        const result = await saveDailyReportDraft({
          capturedPhotos,
          draftId: activeDraftId,
          localSignature,
          missingProofExplanation: formState.missingProofExplanation,
          reportStatus: validation.isValid ? "ready_to_submit" : "draft",
          validationDraft,
        });

        if (isCancelled) {
          return;
        }

        setLastSavedAt(result.draft.savedAt);
        setReportStatus(result.draft.reportStatus);
        setSyncQueueOperationId(result.queueEntry?.id ?? result.draft.queueOperationId);
      } catch (error) {
        console.error("[mobile/report/saveDailyReportDraft]", error);

        if (!isCancelled) {
          setSyncStatusError("Bericht konnte nicht lokal gespeichert werden.");
        }
      } finally {
        if (!isCancelled) {
          setIsSavingDraft(false);
        }
      }
    }

    void persistDraft();

    return () => {
      isCancelled = true;
    };
  }, [
    capturedPhotos,
    activeDraftId,
    backendShift,
    formState.missingProofExplanation,
    hasHydratedDraft,
    isLocked,
    localSignature,
    validation.isValid,
    validationDraft,
  ]);

  function hydrateStoredDraft(storedDraft: StoredDailyReportDraft): void {
    setCapturedPhotos(storedDraft.capturedPhotos);
    setFormState(
      createFormState(
        storedDraft.validationDraft,
        storedDraft.validationDraft.courierNote ?? "",
        storedDraft.missingProofExplanation,
      ),
    );
    setLastSavedAt(storedDraft.savedAt);
    setLocalSignature(storedDraft.localSignature);
    setLockedAt(storedDraft.lockedAt);
    setReportStatus(storedDraft.reportStatus);
    setSubmittedAt(storedDraft.submittedAt);
    setSyncQueueOperationId(storedDraft.queueOperationId);
  }

  function hydrateBackendShiftDraft(shift: Shift): void {
    const backendDraft = createValidationDraftFromShift(shift);

    setFormState(
      createFormState(
        backendDraft,
        backendDraft.courierNote ?? "",
        shift.missing_proof_explanation ?? "",
      ),
    );
    setLastSavedAt(null);
    setLockedAt(shift.submitted_at);
    setLocalSignature(null);
    setReportStatus(shift.status === "submitted" ? "submitted" : "draft");
    setSubmittedAt(shift.submitted_at);
    setSyncQueueOperationId(null);
  }

  const updateFormValue = (key: keyof ReportFormState, value: string): void => {
    if (isLocked) {
      return;
    }

    setFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  };

  const updateNumericFormValue = (key: keyof ReportFormState, value: string): void => {
    updateFormValue(key, sanitizeNumericInput(value));
  };

  const handlePhotoCapture = async (
    photoType: ShiftPhotoType,
    source: PhotoCaptureSource,
  ): Promise<void> => {
    if (isLocked) {
      return;
    }

    setBusyPhotoType(photoType);
    setPhotoCaptureError(null);

    const result = await captureShiftPhoto(photoType, source);

    setBusyPhotoType(null);

    if (result.success) {
      setCapturedPhotos((currentPhotos) => ({
        ...currentPhotos,
        [photoType]: result.photo,
      }));
      return;
    }

    if (!result.canceled) {
      setPhotoCaptureError(result.error);
    }
  };

  const handlePhotoRemove = (photoType: ShiftPhotoType): void => {
    if (isLocked) {
      return;
    }

    setPhotoCaptureError(null);
    setCapturedPhotos((currentPhotos) => {
      const nextPhotos = { ...currentPhotos };

      delete nextPhotos[photoType];

      return nextPhotos;
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit || !backendShift || !localSignature) {
      return;
    }

    let activeQueueOperationId = syncQueueOperationId;

    setIsSubmittingReport(true);
    setSyncStatusError(null);

    try {
      const syncingDraft = await saveDailyReportDraft({
        capturedPhotos,
        correctionState: "none",
        draftId: activeDraftId,
        localSignature,
        missingProofExplanation: formState.missingProofExplanation,
        queueOperationId: activeQueueOperationId,
        reportStatus: "ready_to_submit",
        syncStatus: "syncing",
        validationDraft,
      });

      activeQueueOperationId =
        syncingDraft.queueEntry?.id ?? syncingDraft.draft.queueOperationId;
      setLastSavedAt(syncingDraft.draft.savedAt);
      setReportStatus(syncingDraft.draft.reportStatus);
      setSyncQueueOperationId(activeQueueOperationId);

      const submission = await submitDailyReport({
        localSignature,
        missingProofExplanation: formState.missingProofExplanation,
        shift: backendShift,
        validationDraft,
      });
      const submittedTimestamp =
        submission.shift.submitted_at ?? new Date().toISOString();
      const submittedSignature: LocalSignature = {
        ...localSignature,
        signatureUrl: submission.signatureUrl,
      };
      const submittedValidationDraft: DailyReportValidationDraft = {
        ...validationDraft,
        signatureUrl: submission.signatureUrl,
        signedAt: localSignature.signedAt,
      };
      const savedDraft = await saveDailyReportDraft({
        capturedPhotos,
        correctionState: "none",
        draftId: activeDraftId,
        isLocked: true,
        localSignature: submittedSignature,
        lockedAt: submittedTimestamp,
        missingProofExplanation: formState.missingProofExplanation,
        queueOperationId: activeQueueOperationId,
        reportStatus: "submitted",
        submittedAt: submittedTimestamp,
        syncStatus: "synced",
        validationDraft: submittedValidationDraft,
      });

      setBackendShift(submission.shift);
      setLastSavedAt(savedDraft.draft.savedAt);
      setLocalSignature(submittedSignature);
      setLockedAt(submittedTimestamp);
      setReportStatus("submitted");
      setSubmittedAt(submittedTimestamp);
      setSyncQueueOperationId(savedDraft.draft.queueOperationId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Tagesbericht konnte nicht eingereicht werden.";

      console.error("[mobile/report/submitDailyReport]", error);

      try {
        const pendingDraft = await saveDailyReportDraft({
          capturedPhotos,
          correctionState: "none",
          draftId: activeDraftId,
          localSignature,
          missingProofExplanation: formState.missingProofExplanation,
          queueOperationId: activeQueueOperationId,
          reportStatus: "ready_to_submit",
          syncError: message,
          syncStatus: "pending_sync",
          validationDraft,
        });

        setLastSavedAt(pendingDraft.draft.savedAt);
        setReportStatus(pendingDraft.draft.reportStatus);
        setSyncQueueOperationId(
          pendingDraft.queueEntry?.id ?? pendingDraft.draft.queueOperationId,
        );
      } catch (saveError) {
        console.error("[mobile/report/saveFailedSubmitDraft]", saveError);
      }

      setSyncStatusError(message);
    } finally {
      setIsSubmittingReport(false);
    }
  };

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
          <StatusBadge
            label={getReportStatusLabel(effectiveStatus)}
            tone={effectiveStatus === "submitted" ? "info" : validation.isValid ? "success" : "warning"}
          />
        </View>

        <View className="flex-row rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary">
          <HeaderMetric iconName="calendar-month-outline" label="Heute" value="Berichtstag" />
          <HeaderMetric iconName="clock-outline" label={mockDailyReport.timeLabel} value={mockDailyReport.totalDurationLabel} />
          <HeaderMetric iconName="routes" label={`Tour ${formState.tourNumber || "-"}`} value={mockDailyReport.routeLabel} showDivider={false} />
        </View>

        <ReportLifecycleNotice
          isLocked={isLocked}
          lastSavedAtLabel={draftSavedAtLabel}
          syncQueueOperationId={syncQueueOperationId}
          syncStatusError={syncStatusError}
          syncStatusLabel={syncStatusLabel}
          syncStatusTone={syncStatusTone}
        />
      </View>

      {isLocked ? (
        <SubmittedReportSummary
          capturedPhotos={capturedPhotos}
          formState={formState}
          lockedAt={lockedAt}
          localSignature={localSignature}
          submittedAt={submittedAt}
          uploadedPhotoTypes={uploadedPhotoTypes}
          validationDraft={validationDraft}
        />
      ) : (
        <>
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
                {validation.isValid ? "Bereit zum Einreichen" : "Bericht noch unvollständig"}
              </Text>
            </View>
            {!validation.isValid ? (
              <View className="gap-1 pl-7">
                {validation.summaryMessages.slice(0, 4).map((message) => (
                  <Text
                    className="text-[12px] font-medium leading-4 text-rfWarningForeground"
                    key={message}>
                    {message}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>

          <ReportSectionCard
            helper="Tour, Fahrzeug und Kilometerwerte für diese Schicht."
            index={1}
            title="Schichtdaten">
            <View className="flex-row gap-2.5">
              <ReportField
                editable
                error={validation.fieldErrors.tourNumber}
                helper="täglich editierbar"
                iconName="routes"
                label="Tournummer"
                onChangeText={(value) => updateFormValue("tourNumber", value)}
                required
                value={formState.tourNumber}
              />
              <ReportField
                helper="zugewiesen"
                iconName="warehouse"
                label="Depot"
                required
                value="Mannheim HBW3"
              />
            </View>
            <View className="flex-row gap-2.5">
              <ReportField
                editable
                error={validation.fieldErrors.vanPlate}
                helper="heutiges Fahrzeug"
                iconName="truck-delivery-outline"
                label="Kennzeichen"
                onChangeText={(value) => updateFormValue("vanPlate", value)}
                required
                value={formState.vanPlate}
              />
              <ReportField
                editable
                error={validation.fieldErrors.startKm}
                helper="Schichtbeginn"
                iconName="speedometer"
                keyboardType="number-pad"
                label="Start-KM"
                onChangeText={(value) => updateNumericFormValue("startKm", value)}
                required
                value={formState.startKm}
              />
            </View>
            <View className="flex-row gap-2.5">
              <ReportField
                editable
                error={validation.fieldErrors.endKm}
                helper="Schichtende"
                iconName="speedometer"
                keyboardType="number-pad"
                label="End-KM"
                onChangeText={(value) => updateNumericFormValue("endKm", value)}
                required
                value={formState.endKm}
              />
            </View>
          </ReportSectionCard>

          <ReportSectionCard
            helper="Paket- und Stoppzahlen sind täglich frei editierbar."
            index={2}
            title="Paketübersicht">
            <View className="flex-row rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary">
              {getCounterFields(formState).map((counter, index) => (
                <ReportCounterTile
                  editable
                  error={validation.fieldErrors[counter.errorKey]}
                  helper={counter.helper}
                  iconName={counter.iconName}
                  key={counter.label}
                  label={counter.label}
                  onChangeText={(value) => updateNumericFormValue(counter.stateKey, value)}
                  showDivider={index < 3}
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
              {mockDailyReport.photos.slice(0, 2).map((photo) =>
                renderPhotoCard({
                  busyPhotoType,
                  capturedPhotos,
                  handlePhotoCapture,
                  handlePhotoRemove,
                  isLocked,
                  photo,
                  uploadedPhotoTypes,
                  validation,
                }),
              )}
            </View>
            <View className="flex-row gap-2.5">
              {mockDailyReport.photos.slice(2).map((photo) =>
                renderPhotoCard({
                  busyPhotoType,
                  capturedPhotos,
                  handlePhotoCapture,
                  handlePhotoRemove,
                  isLocked,
                  photo,
                  uploadedPhotoTypes,
                  validation,
                }),
              )}
            </View>
            {validation.missingPhotoTypes.length > 0 ? (
              <View className="gap-2 rounded-rf2xl border border-rfWarningLight bg-rfWarningLightest p-3">
                <View className="flex-row items-center gap-2">
                  <RfIcon className="text-rfWarningForeground" name="alert-outline" size={20} />
                  <Text className="flex-1 text-[13px] font-extrabold leading-[18px] text-rfWarningForeground">
                    Erklärung erforderlich
                  </Text>
                </View>
                <TextInput
                  className="min-h-[92px] rounded-rfLg border border-rfWarningLight bg-rfSurface px-3 py-2 text-[14px] font-medium leading-5 text-rfTextPrimary"
                  multiline
                  onChangeText={(value) => updateFormValue("missingProofExplanation", value)}
                  placeholder="Warum fehlt ein Pflichtfoto?"
                  placeholderTextColor={rfColors.textMuted}
                  textAlignVertical="top"
                  value={formState.missingProofExplanation}
                />
                {validation.missingProofExplanationError ? (
                  <Text className="text-[12px] font-bold leading-4 text-rfWarningForeground">
                    {validation.missingProofExplanationError}
                  </Text>
                ) : null}
              </View>
            ) : null}
            {photoCaptureError ? (
              <View className="flex-row items-center gap-2 rounded-rf2xl border border-rfErrorLight bg-rfErrorLightest p-3">
                <RfIcon className="text-rfError" name="alert-circle-outline" size={20} />
                <Text className="flex-1 text-[12px] font-bold leading-4 text-rfErrorForeground">
                  {photoCaptureError}
                </Text>
              </View>
            ) : null}
            <View className="flex-row items-center gap-2 rounded-rf2xl bg-rfPrimaryLightest p-3">
              <RfIcon className="text-rfPrimary" name="shield-check-outline" size={20} />
              <Text className="flex-1 text-[12px] font-medium leading-4 text-rfPrimaryDarker">
                Fotos sind private Schichtnachweise und werden später nach 14 Tagen gelöscht.
              </Text>
            </View>
          </ReportSectionCard>

          <ReportSectionCard
            helper="Optional, außer bei Abweichungen oder fehlenden Nachweisen."
            index={4}
            title="Anmerkungen">
            <View className="gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-4">
              <TextInput
                className="min-h-[118px] text-[14px] font-medium leading-5 text-rfTextPrimary"
                maxLength={1000}
                multiline
                onChangeText={(value) => updateFormValue("courierNote", value)}
                placeholder="Anmerkungen oder Abweichungen eintragen"
                placeholderTextColor={rfColors.textMuted}
                textAlignVertical="top"
                value={formState.courierNote}
              />
              <Text className="self-end text-[11px] font-medium leading-[15px] text-rfTextMuted">
                {formState.courierNote.length} / 1000
              </Text>
            </View>
          </ReportSectionCard>

          <ReportSectionCard
            helper="Unterschrift lokal erfassen und für den späteren Upload vorbereiten."
            index={5}
            title="Unterschrift">
            <SignatureCard
              error={validation.signatureError}
              helper={mockDailyReport.signatureHelper}
              label="Unterschrift"
              onClear={() => setLocalSignature(null)}
              onConfirm={setLocalSignature}
              signature={localSignature}
            />
          </ReportSectionCard>

          <View className="gap-2">
            <Pressable
              accessibilityRole="button"
              className={`min-h-[56px] flex-row items-center justify-center gap-3 rounded-rfXl px-5 py-3 ${submitButtonClassName}`}
              disabled={!canSubmit}
              onPress={handleSubmit}>
              <RfIcon
                className={submitTextClassName}
                name={isSubmittingReport ? "cloud-sync-outline" : "send-outline"}
                size={24}
              />
              <Text className={`text-[15px] font-extrabold leading-5 ${submitTextClassName}`}>
                {isSubmittingReport ? "Bericht wird eingereicht" : "Bericht einreichen"}
              </Text>
            </Pressable>
            <Text className="px-4 text-center text-xs font-medium leading-4 text-rfTextMuted">
              {submitBlocker
                ? submitBlocker
                : validation.isValid
                ? mockDailyReport.submittedHint
                : "Fehlende Pflichtangaben blockieren das Einreichen."}
            </Text>
          </View>
        </>
      )}
    </MobileScreen>
  );
}

function HeaderMetric({
  iconName,
  label,
  showDivider = true,
  value,
}: {
  iconName: "calendar-month-outline" | "clock-outline" | "routes";
  label: string;
  showDivider?: boolean;
  value: string;
}) {
  return (
    <View className={`flex-1 gap-1 p-3.5 ${showDivider ? "border-r border-rfBorderLight" : ""}`}>
      <RfIcon className="text-rfPrimary" name={iconName} size={22} />
      <Text className="text-[13px] font-bold leading-[18px] text-rfTextPrimary">{label}</Text>
      <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">{value}</Text>
    </View>
  );
}

function ReportLifecycleNotice({
  isLocked,
  lastSavedAtLabel,
  syncQueueOperationId,
  syncStatusError,
  syncStatusLabel,
  syncStatusTone,
}: {
  isLocked: boolean;
  lastSavedAtLabel: string | null;
  syncQueueOperationId: string | null;
  syncStatusError: string | null;
  syncStatusLabel: string;
  syncStatusTone: "error" | "info" | "neutral" | "success" | "warning";
}) {
  return (
    <View
      className={`gap-2 rounded-rf2xl border p-3 ${
        isLocked
          ? "border-rfPrimaryLight bg-rfPrimaryLightest"
          : "border-rfWarningLight bg-rfWarningLightest"
      }`}>
      <View className="flex-row items-center gap-2">
        <RfIcon
          className={isLocked ? "text-rfPrimary" : "text-rfWarningForeground"}
          name={isLocked ? "lock-check-outline" : "cloud-sync-outline"}
          size={20}
        />
        <Text
          className={`flex-1 text-[13px] font-extrabold leading-[18px] ${
            isLocked ? "text-rfPrimaryDarker" : "text-rfWarningForeground"
          }`}>
          {isLocked ? "Bericht eingereicht" : "Offline-Entwurf"}
        </Text>
        <StatusBadge label={syncStatusLabel} tone={syncStatusTone} />
      </View>
      <Text
        className={`text-[12px] font-medium leading-4 ${
          isLocked ? "text-rfPrimaryDarker" : "text-rfWarningForeground"
        }`}>
        {syncStatusError ??
          (isLocked
            ? "Server hat die Einreichung bestÃ¤tigt. Dieser Bericht kann nicht mehr bearbeitet werden."
            : lastSavedAtLabel
              ? `Lokal gespeichert am ${lastSavedAtLabel}. Einreichung sperrt erst nach ServerbestÃ¤tigung.`
              : "Änderungen werden lokal gespeichert und für den späteren Sync vorgemerkt.")}
      </Text>
      {syncQueueOperationId ? (
        <Text
          className={`text-[11px] font-bold leading-[15px] ${
            isLocked ? "text-rfPrimaryDarker" : "text-rfWarningForeground"
          }`}>
          Sync-Vorgang vorbereitet
        </Text>
      ) : null}
    </View>
  );
}

function SubmittedReportSummary({
  capturedPhotos,
  formState,
  lockedAt,
  localSignature,
  submittedAt,
  uploadedPhotoTypes,
  validationDraft,
}: {
  capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>>;
  formState: ReportFormState;
  lockedAt: string | null;
  localSignature: LocalSignature | null;
  submittedAt: string | null;
  uploadedPhotoTypes: ShiftPhotoType[];
  validationDraft: DailyReportValidationDraft;
}) {
  const missingPhotoTypes = validationDraft.requiredPhotoTypes.filter(
    (photoType) => !uploadedPhotoTypes.includes(photoType),
  );

  return (
    <View className="gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-[20px] font-extrabold leading-7 text-rfTextPrimary">
            Bericht eingereicht
          </Text>
          <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
            {submittedAt ? `Eingereicht am ${formatSubmittedAtLabel(submittedAt)}` : "Heute abgeschlossen"}
          </Text>
          <Text className="text-[12px] font-medium leading-4 text-rfTextMuted">
            Dieser Bericht kann nicht mehr bearbeitet werden. Für Korrekturen wenden Sie sich an Ihren Disponenten.
          </Text>
        </View>
        <StatusBadge label="Gesperrt" tone="neutral" />
      </View>

      <View className="gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-4">
        <SummaryRow label="Tournummer" value={formState.tourNumber || "-"} />
        <SummaryRow label="Kennzeichen" value={formState.vanPlate || "-"} />
        <SummaryRow label="Depot" value="Mannheim HBW3" />
        <SummaryRow label="Start-KM" value={formatKm(validationDraft.startKm)} />
        <SummaryRow label="End-KM" value={formatKm(validationDraft.endKm)} />
      </View>

      <View className="flex-row flex-wrap gap-2.5">
        <SummaryMetric label="Zustellungen" value={formState.packagesDelivered || "0"} />
        <SummaryMetric label="Rückläufer" value={formState.packagesReturned || "0"} />
        <SummaryMetric label="Abholungen" value={formState.packagesPickedUp || "0"} />
        <SummaryMetric label="Stopps" value={formState.totalStops || "0"} />
      </View>

      <View className="gap-3">
        <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
          Nachweisfotos
        </Text>
        <View className="flex-row flex-wrap gap-2.5">
          {validationDraft.requiredPhotoTypes.map((photoType) => {
            const isUploaded = uploadedPhotoTypes.includes(photoType);
            const capturedPhoto = capturedPhotos[photoType];

            return (
              <View
                className={`min-h-[96px] flex-1 basis-[46%] gap-2 rounded-rf2xl border p-3 ${
                  isUploaded
                    ? "border-rfSuccessLight bg-rfSuccessLightest"
                    : "border-rfWarningLight bg-rfWarningLightest"
                }`}
                key={photoType}>
                <RfIcon
                  className={isUploaded ? "text-rfSuccessForeground" : "text-rfWarningForeground"}
                  name={isUploaded ? "check-circle-outline" : "alert-outline"}
                  size={22}
                />
                <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
                  {photoLabels[photoType]}
                </Text>
                <Text className="text-[11px] font-semibold leading-[15px] text-rfTextSecondary">
                  {isUploaded
                    ? capturedPhoto
                      ? getShiftPhotoCompressionLabel(capturedPhoto)
                      : "Vorhanden"
                    : "Pflichtfoto fehlt"}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {missingPhotoTypes.length > 0 ? (
        <View className="gap-1 rounded-rf2xl border border-rfWarningLight bg-rfWarningLightest p-3">
          <Text className="text-[13px] font-extrabold leading-[18px] text-rfWarningForeground">
            Fehlende Nachweise erklärt
          </Text>
          <Text className="text-[12px] font-medium leading-4 text-rfWarningForeground">
            {formState.missingProofExplanation}
          </Text>
        </View>
      ) : null}

      {formState.courierNote.trim() ? (
        <View className="gap-1 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3">
          <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
            Anmerkungen
          </Text>
          <Text className="text-[12px] font-medium leading-4 text-rfTextSecondary">
            {formState.courierNote}
          </Text>
        </View>
      ) : null}

      <SignatureCard
        disabled
        helper={localSignature ? "Bestätigt und schreibgeschützt." : "Keine Unterschrift vorhanden."}
        label="Unterschrift"
        onClear={() => undefined}
        onConfirm={() => undefined}
        signature={localSignature}
      />

      <View className="flex-row items-center gap-2 rounded-rf2xl border border-rfBorderLight bg-rfNeutralLight p-3">
        <RfIcon className="text-rfTextMuted" name="lock-outline" size={20} />
        <Text className="flex-1 text-[12px] font-bold leading-4 text-rfTextSecondary">
          Lokal gesperrt seit {lockedAt ? formatDraftSavedAtLabel(lockedAt) : "Einreichung"}.
        </Text>
      </View>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-[12px] font-bold leading-4 text-rfTextSecondary">{label}</Text>
      <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">{value}</Text>
    </View>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-h-[82px] flex-1 basis-[46%] justify-center rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3">
      <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">{value}</Text>
      <Text className="text-[12px] font-bold leading-4 text-rfTextSecondary">{label}</Text>
    </View>
  );
}

function createFormState(
  draft: DailyReportValidationDraft,
  note: string,
  missingProofExplanation: string,
): ReportFormState {
  return {
    courierNote: note,
    endKm: String(draft.endKm),
    missingProofExplanation,
    packagesDelivered: String(draft.packagesDelivered),
    packagesPickedUp: String(draft.packagesPickedUp),
    packagesReturned: String(draft.packagesReturned),
    startKm: String(draft.startKm),
    totalStops: String(draft.totalStops ?? 0),
    tourNumber: draft.tourNumber,
    vanPlate: draft.vanPlate,
  };
}

function createValidationDraftFromForm({
  backendShift,
  formState,
  localSignature,
  uploadedPhotoTypes,
}: {
  backendShift: Shift | null;
  formState: ReportFormState;
  localSignature: LocalSignature | null;
  uploadedPhotoTypes: ShiftPhotoType[];
}): DailyReportValidationDraft {
  const baseDraft = backendShift
    ? createValidationDraftFromShift(backendShift)
    : mockDailyReport.validationDraft;

  return {
    ...baseDraft,
    courierNote: formState.courierNote.trim() ? formState.courierNote : null,
    endKm: parseIntegerInput(formState.endKm),
    packagesDelivered: parseIntegerInput(formState.packagesDelivered),
    packagesPickedUp: parseIntegerInput(formState.packagesPickedUp),
    packagesReturned: parseIntegerInput(formState.packagesReturned),
    signatureUrl: localSignature?.signatureUrl ?? null,
    signedAt: localSignature?.signedAt ?? null,
    startKm: parseIntegerInput(formState.startKm),
    totalStops: parseIntegerInput(formState.totalStops),
    tourNumber: formState.tourNumber,
    uploadedPhotoTypes,
    vanPlate: formState.vanPlate,
  };
}

function createValidationDraftFromShift(shift: Shift): DailyReportValidationDraft {
  return {
    courierNote: shift.courier_note,
    courierProfileId: shift.courier_profile_id,
    depotId: shift.depot_id,
    endKm: shift.end_km,
    endTime: shift.end_time ?? shift.start_time,
    packagesDelivered: shift.packages_delivered,
    packagesPickedUp: shift.packages_picked_up,
    packagesReturned: shift.packages_returned,
    paymentModeSnapshot: shift.payment_mode_snapshot,
    requiredPhotoTypes: mockDailyReport.validationDraft.requiredPhotoTypes,
    shiftDate: shift.shift_date,
    signatureUrl: shift.signature_url,
    signedAt: shift.signed_at,
    startKm: shift.start_km,
    startTime: shift.start_time,
    totalStops: shift.total_stops,
    tourNumber: shift.tour_number ?? mockDailyReport.validationDraft.tourNumber,
    uploadedPhotoTypes: mockDailyReport.validationDraft.uploadedPhotoTypes,
    vanPlate: shift.van_plate || mockDailyReport.validationDraft.vanPlate,
  };
}

function getCounterFields(formState: ReportFormState) {
  return [
    {
      errorKey: "packagesDelivered" as const,
      helper: "zugestellt",
      iconName: "package-variant-closed" as const,
      label: "Zustellungen",
      stateKey: "packagesDelivered" as const,
      value: formState.packagesDelivered,
    },
    {
      errorKey: "packagesReturned" as const,
      helper: "Retouren",
      iconName: "backup-restore" as const,
      label: "Rückläufer",
      stateKey: "packagesReturned" as const,
      value: formState.packagesReturned,
    },
    {
      errorKey: "packagesPickedUp" as const,
      helper: "Kunden",
      iconName: "hand-coin-outline" as const,
      label: "Abholungen",
      stateKey: "packagesPickedUp" as const,
      value: formState.packagesPickedUp,
    },
    {
      errorKey: "totalStops" as const,
      helper: "gesamt",
      iconName: "map-marker-distance" as const,
      label: "Stopps",
      stateKey: "totalStops" as const,
      value: formState.totalStops,
    },
  ];
}

function renderPhotoCard({
  busyPhotoType,
  capturedPhotos,
  handlePhotoCapture,
  handlePhotoRemove,
  isLocked,
  photo,
  uploadedPhotoTypes,
  validation,
}: {
  busyPhotoType: ShiftPhotoType | null;
  capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>>;
  handlePhotoCapture: (photoType: ShiftPhotoType, source: PhotoCaptureSource) => Promise<void>;
  handlePhotoRemove: (photoType: ShiftPhotoType) => void;
  isLocked: boolean;
  photo: (typeof mockDailyReport.photos)[number];
  uploadedPhotoTypes: ShiftPhotoType[];
  validation: ReturnType<typeof validateDailyReportDraft>;
}) {
  const capturedPhoto = capturedPhotos[photo.photoType];
  const isUploaded = uploadedPhotoTypes.includes(photo.photoType);

  return (
    <PhotoUploadCard
      disabled={isLocked}
      helper={photo.helper}
      iconName={photo.iconName}
      isBusy={busyPhotoType === photo.photoType}
      key={photo.label}
      label={photo.label}
      onCapture={() => handlePhotoCapture(photo.photoType, "camera")}
      onPick={() => handlePhotoCapture(photo.photoType, "library")}
      onRemove={capturedPhoto ? () => handlePhotoRemove(photo.photoType) : undefined}
      previewUri={capturedPhoto?.localUri}
      required={photo.required}
      state={
        isUploaded
          ? "uploaded"
          : validation.missingPhotoTypes.includes(photo.photoType)
            ? "error"
            : photo.state
      }
      statusLabel={capturedPhoto ? getShiftPhotoCompressionLabel(capturedPhoto) : undefined}
    />
  );
}

function getReportStatusLabel(status: DailyReportLifecycleStatus): string {
  if (status === "submitted") {
    return "Bericht eingereicht";
  }

  if (status === "ready_to_submit") {
    return "Bereit zum Einreichen";
  }

  return "Entwurf";
}

function parseIntegerInput(value: string): number {
  return value.trim() ? Number(value) : -1;
}

function sanitizeNumericInput(value: string): string {
  return value.replace(/\D/g, "");
}

function formatKm(value: number): string {
  return `${new Intl.NumberFormat("de-DE").format(value)} km`;
}
