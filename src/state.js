const STORAGE_KEY = "konkai_v2";

export function uid() {
  return Math.random().toString(36).slice(2, 9);
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

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* ignore quota / privacy-mode errors */
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
