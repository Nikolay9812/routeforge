export type SignaturePoint = {
  x: number;
  y: number;
};

export type SignatureStroke = SignaturePoint[];

export type SignatureCanvasSize = {
  height: number;
  width: number;
};

export type SignatureUploadPayload = {
  fileName: string;
  localDataUri: string;
  mimeType: "image/svg+xml";
  signedAt: string;
  storageBucket: "generated-pdfs";
  storagePathTemplate: "companies/{company_id}/reports/{shift_id}/{file_name}";
};

export type LocalSignature = {
  fileName: string;
  signedAt: string;
  signedAtLabel: string;
  signatureUrl: string;
  strokes: SignatureStroke[];
  uploadPayload: SignatureUploadPayload;
};

const SIGNATURE_BUCKET = "generated-pdfs" as const;

export function createLocalSignature(
  strokes: SignatureStroke[],
  canvasSize: SignatureCanvasSize,
): LocalSignature {
  const signedAt = new Date().toISOString();
  const fileName = createSignatureFileName(signedAt);
  const svgMarkup = createSignatureSvg(strokes, canvasSize);
  const localDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;

  return {
    fileName,
    signedAt,
    signedAtLabel: formatSignedAtLabel(signedAt),
    signatureUrl: `local-signature://${fileName}`,
    strokes,
    uploadPayload: {
      fileName,
      localDataUri,
      mimeType: "image/svg+xml",
      signedAt,
      storageBucket: SIGNATURE_BUCKET,
      storagePathTemplate: "companies/{company_id}/reports/{shift_id}/{file_name}",
    },
  };
}

export function hasSignatureStroke(strokes: SignatureStroke[]): boolean {
  return strokes.some((stroke) => stroke.length >= 2);
}

export function formatSignedAtLabel(signedAt: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(signedAt));
}

function createSignatureFileName(signedAt: string): string {
  const safeTimestamp = signedAt.replace(/[:.]/g, "-");

  return `signature-${safeTimestamp}.svg`;
}

function createSignatureSvg(
  strokes: SignatureStroke[],
  canvasSize: SignatureCanvasSize,
): string {
  const polylines = strokes
    .filter((stroke) => stroke.length >= 2)
    .map((stroke) => {
      const points = stroke
        .map((point) => `${Math.round(point.x)},${Math.round(point.y)}`)
        .join(" ");

      return `<polyline points="${points}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(
    canvasSize.width,
  )}" height="${Math.round(
    canvasSize.height,
  )}" viewBox="0 0 ${Math.round(canvasSize.width)} ${Math.round(
    canvasSize.height,
  )}">${polylines}</svg>`;
}
