export type ProfileDocumentStatus = "valid" | "missing" | "expired" | "uploaded";

export type ProfileDocumentMock = {
  id: string;
  title: string;
  kindLabel: string;
  status: ProfileDocumentStatus;
  statusLabel: string;
  dateLabel: string;
  helperText: string;
  actionLabel: string;
};

export const mockCourierProfile = {
  initials: "MK",
  fullName: "Mihail Kolev",
  roleLabel: "Kurier",
  companyName: "Ivanov Transport",
  depotName: "Mannheim HBW3",
  depotCode: "HBW3",
  statusLabel: "Aktiv",
  accessLabel: "Aktiver Zugriff",
  preferredLanguage: "Deutsch",
  email: "mihail.kolev@ivanov-transport.de",
  phone: "+49 176 4421 7782",
  address: "Meerfeldstr. 12, 68163 Mannheim",
  maskedIban: "DE89 **** **** **** 3000 00",
  paymentMode: {
    label: "Stundenbasis",
    detail: "Realzeit wird erfasst",
    capLabel: "10:00h Tageslimit",
    breakLabel: "Gesetzliche Pause wird berechnet",
  },
  mailbox: {
    unreadLabel: "2 ungelesene Eintraege",
    helperText: "Eigene digitale Post und Firmenmitteilungen.",
  },
  documents: {
    summaryLabel: "4 Pflichtdokumente",
    helperText: "Private Dokumente werden nur authentifiziert geoeffnet.",
  },
  signature: {
    label: "M. Kolev",
    updatedAtLabel: "Aktualisiert am 20.06.2026",
    helperText: "Unterschrift ist fuer spaetere Berichte vorgemerkt.",
  },
};

export const profileDocuments: ProfileDocumentMock[] = [
  {
    id: "id-card",
    title: "Ausweis",
    kindLabel: "Persoenliches Dokument",
    status: "uploaded",
    statusLabel: "Hochgeladen",
    dateLabel: "Geprueft am 18.06.2026",
    helperText: "Wartet auf finale Freigabe durch das Buero.",
    actionLabel: "Aktualisieren",
  },
  {
    id: "driver-license",
    title: "Fuehrerschein Klasse B",
    kindLabel: "Fahrberechtigung",
    status: "valid",
    statusLabel: "Gueltig",
    dateLabel: "Gueltig bis 15.06.2030",
    helperText: "Dokument ist fuer eigene Schichten freigegeben.",
    actionLabel: "Ersetzen",
  },
  {
    id: "address-registration",
    title: "Meldebescheinigung",
    kindLabel: "Adressnachweis",
    status: "missing",
    statusLabel: "Fehlt",
    dateLabel: "Noch nicht hinterlegt",
    helperText: "Bitte Nachweis hochladen, sobald verfuegbar.",
    actionLabel: "Hochladen",
  },
  {
    id: "iban-proof",
    title: "IBAN-Nachweis",
    kindLabel: "Zahlungsnachweis",
    status: "expired",
    statusLabel: "Abgelaufen",
    dateLabel: "Abgelaufen am 01.05.2026",
    helperText: "IBAN wird maskiert angezeigt und privat gespeichert.",
    actionLabel: "Erneuern",
  },
];
