import { useMemo, useRef, useState } from "react";
import {
  type GestureResponderEvent,
  PanResponder,
  Pressable,
  Text,
  View,
} from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  createLocalSignature,
  hasSignatureStroke,
  type LocalSignature,
  type SignatureCanvasSize,
  type SignaturePoint,
  type SignatureStroke,
} from "@/features/report/signatureCapture";

type SignatureCardProps = {
  disabled?: boolean;
  error?: string | null;
  helper: string;
  label: string;
  onClear: () => void;
  onConfirm: (signature: LocalSignature) => void;
  signature: LocalSignature | null;
};

const SIGNATURE_CANVAS_HEIGHT = 156;

type SignatureSegment = {
  angle: number;
  left: number;
  top: number;
  width: number;
};

export function SignatureCard({
  disabled = false,
  error,
  helper,
  label,
  onClear,
  onConfirm,
  signature,
}: SignatureCardProps) {
  const [draftStrokes, setDraftStrokes] = useState<SignatureStroke[]>([]);
  const [canvasSize, setCanvasSize] = useState<SignatureCanvasSize>({
    height: SIGNATURE_CANVAS_HEIGHT,
    width: 320,
  });
  const currentStroke = useRef<SignatureStroke>([]);
  const displayedStrokes = signature?.strokes ?? draftStrokes;
  const hasDraftSignature = hasSignatureStroke(draftStrokes);
  const hasConfirmedSignature = Boolean(signature);
  const hasAnySignature = hasConfirmedSignature || hasDraftSignature;
  const hasError = Boolean(error) && !hasConfirmedSignature;
  const isReadOnly = disabled || hasConfirmedSignature;
  const containerClassName = hasError
    ? "border-rfErrorLight bg-rfErrorLightest"
    : hasConfirmedSignature
      ? "border-rfSuccessLight bg-rfSuccessLightest"
      : "border-rfBorder bg-rfSurface";
  const confirmButtonClassName =
    hasDraftSignature && !isReadOnly ? "bg-rfPrimary" : "bg-rfNeutralLight";
  const confirmTextClassName =
    hasDraftSignature && !isReadOnly ? "text-rfTextInverse" : "text-rfTextMuted";

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => !isReadOnly,
        onPanResponderGrant: (event) => {
          if (isReadOnly) {
            return;
          }

          const point = getSignaturePoint(event, canvasSize);

          currentStroke.current = [point];
          setDraftStrokes((strokes) => [...strokes, currentStroke.current]);
        },
        onPanResponderMove: (event) => {
          if (isReadOnly || currentStroke.current.length === 0) {
            return;
          }

          const point = getSignaturePoint(event, canvasSize);

          currentStroke.current = [...currentStroke.current, point];
          setDraftStrokes((strokes) => [
            ...strokes.slice(0, -1),
            currentStroke.current,
          ]);
        },
        onPanResponderRelease: () => {
          currentStroke.current = [];
        },
        onPanResponderTerminate: () => {
          currentStroke.current = [];
        },
        onStartShouldSetPanResponder: () => !isReadOnly,
      }),
    [canvasSize, isReadOnly],
  );

  const handleClear = () => {
    if (disabled) {
      return;
    }

    currentStroke.current = [];
    setDraftStrokes([]);
    onClear();
  };

  const handleConfirm = () => {
    if (!hasDraftSignature || isReadOnly) {
      return;
    }

    onConfirm(createLocalSignature(draftStrokes, canvasSize));
  };

  return (
    <View className={`gap-3 rounded-rf2xl border p-4 ${containerClassName}`}>
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
          <RfIcon className="text-rfPrimary" name="draw-pen" size={25} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
            {label}
          </Text>
          <Text className="text-[12px] font-medium leading-4 text-rfTextSecondary">
            {helper}
          </Text>
        </View>
        <StatusBadge
          label={hasConfirmedSignature ? "Bestätigt" : "Fehlt"}
          tone={hasConfirmedSignature ? "success" : "warning"}
        />
      </View>

      <View
        className="overflow-hidden rounded-rf2xl border border-rfBorderLight bg-rfSurface"
        onLayout={(event) =>
          setCanvasSize({
            height: SIGNATURE_CANVAS_HEIGHT,
            width: Math.max(event.nativeEvent.layout.width, 1),
          })
        }
        {...panResponder.panHandlers}>
        <View className="h-[156px]">
          {!hasAnySignature ? (
            <View className="absolute inset-0 items-center justify-center px-6">
              <RfIcon className="text-rfTextMuted" name="gesture-tap" size={28} />
              <Text className="mt-2 text-center text-[12px] font-semibold leading-4 text-rfTextMuted">
                Mit dem Finger im Feld unterschreiben
              </Text>
            </View>
          ) : null}
          {displayedStrokes.map((stroke, strokeIndex) =>
            getSignatureSegments(stroke).map((segment, segmentIndex) => (
              <View
                className="absolute h-[4px] rounded-full bg-rfTextPrimary"
                key={`${strokeIndex}-${segmentIndex}-${Math.round(segment.left)}-${Math.round(
                  segment.top,
                )}`}
                style={{
                  left: segment.left,
                  top: segment.top,
                  transform: [{ rotate: `${segment.angle}rad` }],
                  width: segment.width,
                }}
              />
            )),
          )}
        </View>
      </View>

      {signature ? (
        <View className="flex-row items-center gap-2 rounded-rfLg bg-rfSurface px-3 py-2">
          <RfIcon className="text-rfSuccessForeground" name="check-circle-outline" size={18} />
          <Text className="flex-1 text-[12px] font-bold leading-4 text-rfSuccessForeground">
            Signiert am {signature.signedAtLabel}
          </Text>
        </View>
      ) : null}

      {hasError ? (
        <View className="flex-row items-center gap-2 rounded-rfLg bg-rfSurface px-3 py-2">
          <RfIcon className="text-rfError" name="alert-circle-outline" size={18} />
          <Text className="flex-1 text-[12px] font-bold leading-4 text-rfErrorForeground">
            {error}
          </Text>
        </View>
      ) : null}

      <View className="flex-row gap-2">
        <Pressable
          accessibilityLabel="Unterschrift löschen"
          accessibilityRole="button"
          className="min-h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-rfLg border border-rfBorder bg-rfSurface px-4 py-2.5"
          disabled={!hasAnySignature || disabled}
          onPress={handleClear}>
          <RfIcon
            className={hasAnySignature && !disabled ? "text-rfTextPrimary" : "text-rfTextMuted"}
            name="eraser"
            size={18}
          />
          <Text
            className={`text-[12px] font-extrabold leading-4 ${
              hasAnySignature && !disabled ? "text-rfTextPrimary" : "text-rfTextMuted"
            }`}>
            Löschen
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Unterschrift bestätigen"
          accessibilityRole="button"
          className={`min-h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-rfLg px-4 py-2.5 ${confirmButtonClassName}`}
          disabled={!hasDraftSignature || isReadOnly}
          onPress={handleConfirm}>
          <RfIcon className={confirmTextClassName} name="check" size={18} />
          <Text className={`text-[12px] font-extrabold leading-4 ${confirmTextClassName}`}>
            {hasConfirmedSignature ? "Bestätigt" : "Bestätigen"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function getSignaturePoint(
  event: GestureResponderEvent,
  canvasSize: SignatureCanvasSize,
): SignaturePoint {
  const { locationX, locationY } = event.nativeEvent;

  return {
    x: clamp(locationX, 0, canvasSize.width),
    y: clamp(locationY, 0, canvasSize.height),
  };
}

function getSignatureSegments(stroke: SignatureStroke): SignatureSegment[] {
  const segments: SignatureSegment[] = [];

  for (let index = 1; index < stroke.length; index += 1) {
    const start = stroke[index - 1];
    const end = stroke[index];
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const width = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (width < 1) {
      continue;
    }

    segments.push({
      angle: Math.atan2(deltaY, deltaX),
      left: (start.x + end.x) / 2 - width / 2,
      top: (start.y + end.y) / 2 - 2,
      width,
    });
  }

  return segments;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
