const STORAGE_KEY = "konkai_v2";

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function getGroupId() {
  try {
    return new URLSearchParams(window.location.search).get("group") || null;
  } catch (e) {
    return null;
  }
}

function localKey(groupId) {
  return groupId ? `${STORAGE_KEY}_group_${groupId}` : STORAGE_KEY;
}

export function defaultState() {
  return {
    activeTab: "session",
    session: {
      location: "",
      courtNumbers: "",
      courtCount: 2,
      date: new Date().toISOString().slice(0, 10),
      courtCost: 0,
      points: 21,
      hours: 2,
      roundMinutes: 20,
    },
    members: [],
    shuttleCount: 0,
    shuttlePrice: 8,
    match: {
      rounds: [],
      gamesPlayed: {},
      sitOuts: {},
      partnerCount: {},
      opponentCount: {},
    },
  };
}

export function loadState(groupId) {
  try {
    const raw = localStorage.getItem(localKey(groupId));
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const d = defaultState();
    return {
      ...d,
      ...parsed,
      session: { ...d.session, ...(parsed.session || {}) },
      match: { ...d.match, ...(parsed.match || {}) },
    };
  } catch (e) {
    return defaultState();
  }
}

export function saveState(state, groupId) {
  try {
    localStorage.setItem(localKey(groupId), JSON.stringify(state));
  } catch (e) {
    /* ignore quota / privacy-mode errors */
  }
}

// Group-scoped sessions (opened via the LINE bot's /group?group=<id> link) are
// backed by a shared Google Sheet through this endpoint, so everyone in the
// group sees the same data. Every call is best-effort: until the backend is
// wired up (or if it's ever briefly unreachable), callers keep working off
// localStorage — see loadState/saveState above.
export async function fetchRemoteState(groupId) {
  try {
    const res = await fetch(`/api/session?group=${encodeURIComponent(groupId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  } catch (e) {
    return null;
  }
}

export async function pushRemoteState(groupId, state) {
  try {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: groupId, state }),
    });
  } catch (e) {
    /* offline or backend not ready yet — local copy already has it */
  }
}

export function fmtBaht(n) {
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return rounded.toLocaleString("th-TH");
  return rounded.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function initials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function avatarClass(index) {
  return "avatar c" + (index % 3);
}
