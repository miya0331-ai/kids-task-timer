const KEY = "ktt.family";

export type StoredFamily = { id: string; code: string };

export function getFamily(): StoredFamily | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredFamily;
  } catch {
    return null;
  }
}

export function setFamily(f: StoredFamily) {
  localStorage.setItem(KEY, JSON.stringify(f));
}

export function clearFamily() {
  localStorage.removeItem(KEY);
}
