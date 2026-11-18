export type EnquiryKind = "private" | "institutional";

export type EnquiryRecord = {
  reference: string;
  kind: EnquiryKind;
  submittedAt: string;
  fields: Record<string, string>;
};

const STORAGE_KEY = "ashcombe.enquiries";

function readAll(): EnquiryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EnquiryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records: EnquiryRecord[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function listEnquiries(): EnquiryRecord[] {
  return readAll().sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export function findEnquiry(reference: string): EnquiryRecord | undefined {
  return readAll().find((record) => record.reference === reference);
}

export function saveEnquiry(
  kind: EnquiryKind,
  fields: Record<string, string>,
): EnquiryRecord {
  const prefix = kind === "private" ? "APB-PE" : "APB-IE";
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  const record: EnquiryRecord = {
    reference: `${prefix}-${stamp}`,
    kind,
    submittedAt: new Date().toISOString(),
    fields,
  };
  const next = [record, ...readAll()].slice(0, 40);
  writeAll(next);
  return record;
}
