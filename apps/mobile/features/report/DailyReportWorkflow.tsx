import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import {
  isShiftLockedForCourier,
  type Shift,
  type ShiftPhotoType,
} from "@routeforge/shared";

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
import { useMobileProfileHydration } from "@/features/profile/mobileProfileHydration";
import {
  loadShiftPhotosForShift,
  submitDailyReport,
  type ShiftPhotoUploadState,
} from "@/features/report/dailyReportBackend";
import {
  createEmptyDailyReportViewModel,
  dailyReportPhotoCards,
  formatReportDateLabel,
  requiredShiftPhotoTypes,
  type DailyReportPhotoViewModel,
} from "@/features/report/dailyReportViewModel";
import {
  formatDraftSavedAtLabel,
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
import {
  HeaderMetric,
  ReviewSummaryCard,
  StartWorkflowCard,
  WorkflowDoneCard,
  WorkflowNavigation,
  WorkflowStepper,
  WorkflowTimerCard,
} from "@/features/report/DailyReportWorkflowParts";
import {
  ReportLifecycleNotice,
  SubmittedReportSummary,
} from "@/features/report/DailyReportWorkflowSummary";
import type {
  DailyReportFormState,
  DailyWorkflowStep,
} from "@/features/report/dailyReportWorkflowTypes";
import type { LocalSignature } from "@/features/report/signatureCapture";
import {
  loadCourierShiftById,
  loadTodayCourierShift,
} from "@/features/shifts/shiftBackend";
import { useLocalShiftTimer } from "@/features/shifts/useLocalShiftTimer";

const photoLabels: Record<ShiftPhotoType, string> = {
  end_km: "End-KM Foto",
  fahrtenbuch: "Fahrtenbuch",
  mentor: "Mentor Screenshot",
  start_km: "Start-KM Foto",
};

const initialDailyReportViewModel = createEmptyDailyReportViewModel({
  courierProfileId: null,
  depotId: null,
});

export function DailyReportWorkflow() {
  const { profile } = useMobileAuth();
  const hydratedProfile = useMobileProfileHydration();
  const [formState, setFormState] = useState<DailyReportFormState>(() =>
    createFormState(initialDailyReportViewModel.validationDraft, "", ""),
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
  const [isAdvancingToSignature, setIsAdvancingToSignature] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [photoCaptureError, setPhotoCaptureError] = useState<string | null>(null);
  const [photoUploadStates, setPhotoUploadStates] = useState<
    Partial<Record<ShiftPhotoType, ShiftPhotoUploadState>>
  >({});
  const [persistedPhotoTypes, setPersistedPhotoTypes] = useState<ShiftPhotoType[]>([]);
  const [reportStatus, setReportStatus] = useState<DailyReportLifecycleStatus>("draft");
  const [workflowStep, setWorkflowStep] = useState<DailyWorkflowStep>(1);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [syncQueueOperationId, setSyncQueueOperationId] = useState<string | null>(null);
  const [syncStatusError, setSyncStatusError] = useState<string | null>(null);
  const shiftTimer = useLocalShiftTimer({
    companyId: profile?.company_id ?? null,
    courierProfileId: profile?.id ?? null,
    currentDepotId: profile?.primary_depot_id ?? null,
    enabled: Boolean(profile),
    paymentMode: profile?.payment_mode ?? "hourly",
  });
  const isBackendLocked = backendShift
    ? isShiftLockedForCourier(backendShift.status)
    : false;
  const isLocked = reportStatus === "submitted" || isBackendLocked;
  const isWorkflowStarting =
    shiftTimer.backendStatus === "saving" &&
    shiftTimer.status !== "running" &&
    backendShift === null;
  const canStopBeforeSignature =
    Boolean(backendShift) &&
    backendShift?.end_time === null &&
    shiftTimer.activeShift.shiftId === backendShift?.id &&
    shiftTimer.activeShift.isRunning;
  const currentWorkflowStep: DailyWorkflowStep = isLocked
    ? 4
    : backendShift
      ? workflowStep
      : 1;
  const emptyDailyReport = useMemo(
    () =>
      createEmptyDailyReportViewModel({
        courierProfileId: profile?.id ?? null,
        depotId: profile?.primary_depot_id ?? null,
      }),
    [profile?.id, profile?.primary_depot_id],
  );
  const activeDraftId = backendShift?.id ?? emptyDailyReport.draftId;
  const reportDateLabel = backendShift
    ? formatReportDateLabel(backendShift.shift_date)
    : emptyDailyReport.dateLabel;
  const reportTimeLabel = backendShift
    ? formatReportTimeRange(backendShift)
    : "Schicht offen";
  const reportRouteLabel = backendShift
    ? backendShift.tour_number
      ? "Backend-Schicht"
      : "Tour offen"
    : "Noch keine Schicht";

  const capturedPhotoTypes = useMemo(
    () =>
      requiredShiftPhotoTypes.filter(
        (photoType) => capturedPhotos[photoType],
      ),
    [capturedPhotos],
  );
  const uploadedDuringSubmitPhotoTypes = useMemo(
    () =>
      requiredShiftPhotoTypes.filter(
        (photoType) => photoUploadStates[photoType] === "uploaded",
      ),
    [photoUploadStates],
  );
  const uploadedPhotoTypes = useMemo(
    () =>
      uniquePhotoTypes([
        ...persistedPhotoTypes,
        ...capturedPhotoTypes,
        ...uploadedDuringSubmitPhotoTypes,
      ]),
    [capturedPhotoTypes, persistedPhotoTypes, uploadedDuringSubmitPhotoTypes],
  );
  const persistedPhotoTypesForSubmit = useMemo(
    () =>
      uniquePhotoTypes([
        ...persistedPhotoTypes,
        ...uploadedDuringSubmitPhotoTypes,
      ]),
    [persistedPhotoTypes, uploadedDuringSubmitPhotoTypes],
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
        ? "Schicht zuerst beenden. Gehe zurueck zu Schritt 2 und tippe erneut auf Weiter."
        : null;
  const canSubmit =
    validation.isValid &&
    !isLocked &&
    !isBackendLocked &&
    !isSubmittingReport &&
    !shiftTimer.isBackendBusy &&
    !shiftTimer.isCapturingLocation &&
    submitBlocker === null;
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
    const companyId = profile?.company_id;

    if (!profileId || !companyId) {
      setBackendShift(null);
      setBackendShiftError("Kurierprofil konnte nicht geladen werden.");
      return;
    }

    const courierProfileId = profileId;
    const courierCompanyId = companyId;
    let isMounted = true;

    async function loadBackendShift(): Promise<void> {
      setBackendShiftError(null);

      try {
        const result = await loadTodayCourierShift(
          courierProfileId,
          courierCompanyId,
        );

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
  }, [profile?.company_id, profile?.id]);

  useEffect(() => {
    if (!backendShift || !isShiftLockedForCourier(backendShift.status)) {
      return;
    }

    const submittedTimestamp =
      backendShift.submitted_at ??
      backendShift.signed_at ??
      backendShift.approved_at ??
      new Date().toISOString();

    setBackendShiftError(null);
    setLockedAt(submittedTimestamp);
    setReportStatus("submitted");
    setSubmittedAt(submittedTimestamp);
    setSyncStatusError(null);
  }, [
    backendShift,
    backendShift?.approved_at,
    backendShift?.signed_at,
    backendShift?.status,
    backendShift?.submitted_at,
  ]);

  useEffect(() => {
    if (isLocked) {
      setWorkflowStep(4);
      return;
    }

    if (!backendShift) {
      setWorkflowStep(1);
      return;
    }

    setWorkflowStep((currentStep) =>
      currentStep === 1 || currentStep === 4 ? 2 : currentStep,
    );
  }, [backendShift, isLocked]);

  useEffect(() => {
    const shiftId = backendShift?.id;
    const companyId = backendShift?.company_id;

    if (!shiftId || !companyId) {
      setPersistedPhotoTypes([]);
      return;
    }

    const activeShiftId = shiftId;
    const activeCompanyId = companyId;
    let isMounted = true;

    async function loadPersistedPhotos(): Promise<void> {
      const result = await loadShiftPhotosForShift(
        activeShiftId,
        activeCompanyId,
      );

      if (!isMounted) {
        return;
      }

      if (result.error) {
        setPhotoCaptureError(result.error);
        setPersistedPhotoTypes([]);
        return;
      }

      setPersistedPhotoTypes(
        uniquePhotoTypes(result.photos.map((photo) => photo.photo_type)),
      );
    }

    void loadPersistedPhotos();

    return () => {
      isMounted = false;
    };
  }, [backendShift?.company_id, backendShift?.id]);

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
    setPhotoUploadStates({});
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
    setPhotoUploadStates({});
    setReportStatus(isShiftLockedForCourier(shift.status) ? "submitted" : "draft");
    setSubmittedAt(shift.submitted_at);
    setSyncQueueOperationId(null);
  }

  const updateFormValue = (key: keyof DailyReportFormState, value: string): void => {
    if (isLocked) {
      return;
    }

    setFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  };

  const updateNumericFormValue = (key: keyof DailyReportFormState, value: string): void => {
    updateFormValue(key, sanitizeNumericInput(value));
  };

  const handleStartWorkflow = async (): Promise<void> => {
    if (!profile || shiftTimer.isBackendBusy || shiftTimer.isCapturingLocation) {
      return;
    }

    await shiftTimer.startShift();

    const result = await loadTodayCourierShift(profile.id, profile.company_id);

    if (result.error) {
      setBackendShift(null);
      setBackendShiftError(result.error);
      return;
    }

    setBackendShift(result.shift);
    setBackendShiftError(
      result.shift ? null : "Schicht wurde gestartet, aber noch nicht geladen.",
    );
    setWorkflowStep(result.shift ? 2 : 1);
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
      setPhotoUploadStates((currentStates) => {
        const nextStates = { ...currentStates };

        delete nextStates[photoType];

        return nextStates;
      });
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
    setPhotoUploadStates((currentStates) => {
      const nextStates = { ...currentStates };

      delete nextStates[photoType];

      return nextStates;
    });
    setCapturedPhotos((currentPhotos) => {
      const nextPhotos = { ...currentPhotos };

      delete nextPhotos[photoType];

      return nextPhotos;
    });
  };

  const handleContinueToSignature = async (): Promise<void> => {
    if (!backendShift || isAdvancingToSignature) {
      return;
    }

    if (backendShift.end_time !== null) {
      setBackendShiftError(null);
      setWorkflowStep(3);
      return;
    }

    if (!canStopBeforeSignature) {
      setBackendShiftError(
        "Schicht laeuft nicht sauber synchron. Bitte Home neu laden und erneut pruefen.",
      );
      return;
    }

    setIsAdvancingToSignature(true);
    setBackendShiftError(null);

    try {
      await shiftTimer.stopShift();

      const stoppedShiftResult = await loadCourierShiftById({
        companyId: backendShift.company_id,
        shiftId: backendShift.id,
      });

      if (stoppedShiftResult.error || !stoppedShiftResult.shift) {
        throw new Error(
          stoppedShiftResult.error ?? "Schicht konnte nicht beendet werden.",
        );
      }

      if (stoppedShiftResult.shift.end_time === null) {
        throw new Error("Schichtende wurde vom Server noch nicht bestaetigt.");
      }

      setBackendShift(stoppedShiftResult.shift);
      setWorkflowStep(3);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Schicht konnte nicht beendet werden.";

      console.error("[mobile/report/continueToSignature]", error);
      setBackendShiftError(message);
    } finally {
      setIsAdvancingToSignature(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit || !backendShift || !localSignature) {
      return;
    }

    let activeQueueOperationId = syncQueueOperationId;
    const shiftForSubmission = backendShift;

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

      if (shiftForSubmission.end_time === null) {
        throw new Error(
          "Schicht zuerst beenden. Gehe zurueck zu Schritt 2 und tippe erneut auf Weiter.",
        );
      }

      const submission = await submitDailyReport({
        capturedPhotos,
        localSignature,
        missingProofExplanation: formState.missingProofExplanation,
        onPhotoUploadStateChange: updatePhotoUploadState,
        persistedPhotoTypes: persistedPhotoTypesForSubmit,
        shift: shiftForSubmission,
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
        endTime: shiftForSubmission.end_time ?? validationDraft.endTime,
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
      setWorkflowStep(4);
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

  function updatePhotoUploadState(
    photoType: ShiftPhotoType,
    state: ShiftPhotoUploadState,
  ): void {
    setPhotoUploadStates((currentStates) => ({
      ...currentStates,
      [photoType]: state,
    }));
  }

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
                Tagesworkflow
              </Text>
              <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
                {reportDateLabel}
              </Text>
            </View>
          </View>
          <StatusBadge
            label={getWorkflowStatusLabel(currentWorkflowStep, effectiveStatus)}
            tone={effectiveStatus === "submitted" ? "info" : validation.isValid ? "success" : "warning"}
          />
        </View>

        <WorkflowStepper currentStep={currentWorkflowStep} />

        <View className="flex-row rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary">
          <HeaderMetric iconName="calendar-month-outline" label="Heute" value="Berichtstag" />
          <HeaderMetric iconName="clock-outline" label={reportTimeLabel} value="Arbeitszeit" />
          <HeaderMetric
            iconName="routes"
            label={`Tour ${formState.tourNumber || "-"}`}
            value={reportRouteLabel}
            showDivider={false}
          />
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

      {currentWorkflowStep === 1 ? (
        <StartWorkflowCard
          backendError={backendShiftError ?? shiftTimer.backendError}
          disabled={
            !profile?.primary_depot_id ||
            shiftTimer.isBackendBusy ||
            shiftTimer.isCapturingLocation
          }
          isStarting={isWorkflowStarting || shiftTimer.isCapturingLocation}
          onStart={handleStartWorkflow}
          timerLabel={shiftTimer.timerLabel}
        />
      ) : currentWorkflowStep === 4 ? (
        <>
          <WorkflowDoneCard onOpenHistory={() => router.push("/history")} />
          <SubmittedReportSummary
            capturedPhotos={capturedPhotos}
            formState={formState}
            lockedAt={lockedAt}
            localSignature={localSignature}
            submittedAt={submittedAt}
            uploadedPhotoTypes={uploadedPhotoTypes}
            validationDraft={validationDraft}
          />
        </>
      ) : (
        <>
          <WorkflowTimerCard
            helper={
              backendShift?.end_time
                ? "Schichtzeit ist beendet. Bericht wartet auf Einreichung."
                : "Die Schicht laeuft weiter, bis du unterschreibst und sendest."
            }
            statusLabel={backendShift?.end_time ? "Beendet" : "Schicht laeuft"}
            timerLabel={shiftTimer.timerLabel}
          />

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
                {validation.isValid ? "Bereit zum Einreichen" : "Bericht noch unvollstaendig"}
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

          {currentWorkflowStep === 2 ? (
            <>
          <ReportSectionCard
            helper="Tour, Fahrzeug und Kilometerwerte fuer diese Schicht."
            index={1}
            title="Schichtdaten">
            <View className="flex-row gap-2.5">
              <ReportField
                editable
                error={validation.fieldErrors.tourNumber}
                helper="taeglich editierbar"
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
                value={hydratedProfile.depotName}
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
            helper="Paket- und Stoppzahlen sind taeglich frei editierbar."
            index={2}
            title="Paketuebersicht">
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
              {dailyReportPhotoCards.slice(0, 2).map((photo) =>
                renderPhotoCard({
                  busyPhotoType,
                  capturedPhotos,
                  handlePhotoCapture,
                  handlePhotoRemove,
                  isLocked,
                  photo,
                  photoUploadStates,
                  uploadedPhotoTypes,
                  validation,
                }),
              )}
            </View>
            <View className="flex-row gap-2.5">
              {dailyReportPhotoCards.slice(2).map((photo) =>
                renderPhotoCard({
                  busyPhotoType,
                  capturedPhotos,
                  handlePhotoCapture,
                  handlePhotoRemove,
                  isLocked,
                  photo,
                  photoUploadStates,
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
                    Erklaerung erforderlich
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
                Fotos sind private Schichtnachweise und werden spaeter nach 14 Tagen geloescht.
              </Text>
            </View>
          </ReportSectionCard>

          <ReportSectionCard
            helper="Optional, ausser bei Abweichungen oder fehlenden Nachweisen."
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
            </>
          ) : null}

          {currentWorkflowStep === 3 ? (
            <>
          <ReviewSummaryCard
            formState={formState}
            timeLabel={reportTimeLabel}
            validationDraft={validationDraft}
          />


          <ReportSectionCard
            helper="Unterschrift lokal erfassen und fuer den spaeteren Upload vorbereiten."
            index={5}
            title="Unterschrift">
            <SignatureCard
              error={validation.signatureError}
              helper={emptyDailyReport.signatureHelper}
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
                ? "Beim Einreichen werden Nachweise und Bericht an den Server gesendet."
                : "Fehlende Pflichtangaben blockieren das Einreichen."}
            </Text>
          </View>
            </>
          ) : null}

          <WorkflowNavigation
            currentStep={currentWorkflowStep}
            isNextBusy={isAdvancingToSignature}
            isNextDisabled={isAdvancingToSignature || shiftTimer.isBackendBusy}
            nextLabel={
              backendShift?.end_time
                ? "Weiter zur Unterschrift"
                : "Schicht beenden & unterschreiben"
            }
            onBack={() => setWorkflowStep(2)}
            onNext={handleContinueToSignature}
          />
        </>
      )}
    </MobileScreen>
  );
}

function createFormState(
  draft: DailyReportValidationDraft,
  note: string,
  missingProofExplanation: string,
): DailyReportFormState {
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
  formState: DailyReportFormState;
  localSignature: LocalSignature | null;
  uploadedPhotoTypes: ShiftPhotoType[];
}): DailyReportValidationDraft {
  const baseDraft = backendShift
    ? createValidationDraftFromShift(backendShift)
    : initialDailyReportViewModel.validationDraft;

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
    requiredPhotoTypes: requiredShiftPhotoTypes,
    shiftDate: shift.shift_date,
    signatureUrl: shift.signature_url,
    signedAt: shift.signed_at,
    startKm: shift.start_km,
    startTime: shift.start_time,
    totalStops: shift.total_stops,
    tourNumber: shift.tour_number ?? "",
    uploadedPhotoTypes: [],
    vanPlate: shift.van_plate || "",
  };
}

function getCounterFields(formState: DailyReportFormState) {
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
      label: "Ruecklaeufer",
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
  photoUploadStates,
  uploadedPhotoTypes,
  validation,
}: {
  busyPhotoType: ShiftPhotoType | null;
  capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>>;
  handlePhotoCapture: (photoType: ShiftPhotoType, source: PhotoCaptureSource) => Promise<void>;
  handlePhotoRemove: (photoType: ShiftPhotoType) => void;
  isLocked: boolean;
  photo: DailyReportPhotoViewModel;
  photoUploadStates: Partial<Record<ShiftPhotoType, ShiftPhotoUploadState>>;
  uploadedPhotoTypes: ShiftPhotoType[];
  validation: ReturnType<typeof validateDailyReportDraft>;
}) {
  const capturedPhoto = capturedPhotos[photo.photoType];
  const isUploaded = uploadedPhotoTypes.includes(photo.photoType);
  const uploadState = photoUploadStates[photo.photoType];

  return (
    <PhotoUploadCard
      disabled={isLocked}
      helper={photo.helper}
      iconName={photo.iconName}
      isBusy={busyPhotoType === photo.photoType || uploadState === "uploading"}
      key={photo.label}
      label={photo.label}
      onCapture={() => handlePhotoCapture(photo.photoType, "camera")}
      onPick={() => handlePhotoCapture(photo.photoType, "library")}
      onRemove={capturedPhoto ? () => handlePhotoRemove(photo.photoType) : undefined}
      previewUri={capturedPhoto?.localUri}
      required={photo.required}
      state={
        uploadState === "error"
          ? "error"
          : isUploaded
          ? "uploaded"
          : validation.missingPhotoTypes.includes(photo.photoType)
            ? "error"
            : photo.state
      }
      statusLabel={getPhotoStatusLabel({ capturedPhoto, isUploaded, uploadState })}
    />
  );
}

function getPhotoStatusLabel({
  capturedPhoto,
  isUploaded,
  uploadState,
}: {
  capturedPhoto: LocalShiftPhoto | undefined;
  isUploaded: boolean;
  uploadState: ShiftPhotoUploadState | undefined;
}): string | undefined {
  if (uploadState === "uploading") {
    return "Upload laeuft...";
  }

  if (uploadState === "uploaded") {
    return "Server bestaetigt";
  }

  if (uploadState === "error") {
    return "Upload fehlgeschlagen - erneut einreichen";
  }

  if (capturedPhoto) {
    return getShiftPhotoCompressionLabel(capturedPhoto);
  }

  if (isUploaded) {
    return "Server bestaetigt";
  }

  return undefined;
}

function uniquePhotoTypes(photoTypes: ShiftPhotoType[]): ShiftPhotoType[] {
  return requiredShiftPhotoTypes.filter((photoType) =>
    photoTypes.includes(photoType),
  );
}

function getWorkflowStatusLabel(
  step: DailyWorkflowStep,
  status: DailyReportLifecycleStatus,
): string {
  if (step === 1) {
    return "Noch nicht gestartet";
  }

  if (step === 2) {
    return "Ausfuellen";
  }

  if (step === 3) {
    return status === "ready_to_submit" ? "Bereit" : "Pruefen";
  }

  if (status === "submitted") {
    return "Bericht eingereicht";
  }

  return "Fertig";
}

function parseIntegerInput(value: string): number {
  return value.trim() ? Number(value) : -1;
}

function sanitizeNumericInput(value: string): string {
  return value.replace(/\D/g, "");
}

function formatReportTimeRange(shift: Shift): string {
  const startLabel = formatReportTime(shift.start_time);
  const endLabel = shift.end_time ? formatReportTime(shift.end_time) : "offen";

  return `${startLabel} - ${endLabel}`;
}

function formatReportTime(dateTime: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(new Date(dateTime));
}

function formatKm(value: number): string {
  return `${new Intl.NumberFormat("de-DE").format(value)} km`;
}

