import { useCallback, useEffect, useState } from "react";

const LOCALE_KEY = "konkai_locale";
export const DEFAULT_LOCALE = "en";

const dict = {
  en: {
    navSession: "Court",
    navMembers: "Players",
    navMatch: "Match",
    navShuttle: "Shuttles",
    navSummary: "Summary",

    splashLoading: "Setting up your crew…",

    headerNewCrew: "New crew · no court set yet",
    headerCourtsUnit: "courts",
    headerCourtNumbers: "court {numbers}",

    sessionTitle: "Court setup",
    sessionSubtitle: "Where you're playing, and how many courts you booked today.",
    fieldLocation: "Location",
    placeholderLocation: "e.g. Ladprao Badminton Court",
    fieldDate: "Date",
    fieldCourtNumbers: "Court numbers",
    placeholderCourtNumbers: "e.g. 3, 5",
    fieldCourtCount: "Number of courts",
    unitCourts: "courts",
    fieldCourtCost: "Total court cost (฿)",
    formatEyebrow: "Play format",
    fieldPoints: "Points per game",
    ptsShort: "{n} pts",
    fieldHours: "Total play time (hrs)",
    fieldRoundMinutes: "Minutes / game (editable)",
    clearAllBtn: "Clear all data",
    clearAllConfirm: "This clears all players, matches, and settings for this session. Continue?",

    membersTitle: "Players",
    membersSubtitle: "{count} in today's crew",
    placeholderMemberName: "Type a name, press Enter",
    addButton: "Add",
    emptyMembers: "No players yet — add the friends joining today.",
    removeAria: "Remove",

    matchTitle: "Match",
    matchSubtitle: "{courts} courts · {hours}h · ~{rounds} rounds · {points} pts",
    needFourPlayers: "You need at least 4 players for doubles — you have {count} now.",
    readyToMatch: "Ready to match — {count} players · {courts} courts",
    startMatchingBtn: "Start matching",
    reshuffleBtn: "Reshuffle",
    clearMatchesBtn: "Clear",
    roundLabel: "Round {n}",
    courtLabel: "Court {n}",
    minutesChip: "~{n} min",
    vsMark: "VS",
    restingLabel: "Resting: {names}",
    notEnoughCourt: "Not enough players for this round",

    shuttleTitle: "Shuttlecocks",
    shuttleSubtitle: "Count how many broke during play, for the final split.",
    shuttleLostLabel: "Lost today",
    fieldShuttlePrice: "Price per shuttle (฿)",
    shuttleTotalLabel: "Shuttle cost total",

    summaryTitle: "Summary",
    summarySubtitle: "Done playing? Split the bill evenly.",
    summaryEmpty: "Add players first to split the cost.",
    totalLabel: "Grand total",
    courtCostLabel: "Court cost",
    shuttleCostLabel: "Shuttles ({count})",
    perPersonLabel: "Per person · {count} people",
  },
  th: {
    navSession: "สนาม",
    navMembers: "สมาชิก",
    navMatch: "จับคู่",
    navShuttle: "ลูกขนไก่",
    navSummary: "สรุป",

    splashLoading: "กำลังเตรียมก๊วน…",

    headerNewCrew: "ก๊วนแบดใหม่ · ยังไม่ตั้งค่าสนาม",
    headerCourtsUnit: "คอร์ด",
    headerCourtNumbers: "เลข {numbers}",

    sessionTitle: "ตั้งค่าสนาม",
    sessionSubtitle: "บอกสถานที่และจำนวนคอร์ดที่จองไว้วันนี้",
    fieldLocation: "สถานที่",
    placeholderLocation: "เช่น สนามแบดลาดพร้าว",
    fieldDate: "วันที่",
    fieldCourtNumbers: "เลขคอร์ด",
    placeholderCourtNumbers: "เช่น 3, 5",
    fieldCourtCount: "จำนวนคอร์ด",
    unitCourts: "คอร์ด",
    fieldCourtCost: "ค่าคอร์ดรวม (บาท)",
    formatEyebrow: "รูปแบบการเล่น",
    fieldPoints: "คะแนนต่อเกม",
    ptsShort: "{n} แต้ม",
    fieldHours: "เวลาเล่นทั้งหมด (ชม.)",
    fieldRoundMinutes: "นาที/เกม (ปรับได้)",
    clearAllBtn: "เคลียร์ข้อมูลทั้งหมด",
    clearAllConfirm: "จะลบสมาชิก การจับคู่ และการตั้งค่าทั้งหมดของก๊วนนี้ ต้องการดำเนินการต่อหรือไม่?",

    membersTitle: "สมาชิก",
    membersSubtitle: "{count} คนในก๊วนวันนี้",
    placeholderMemberName: "พิมพ์ชื่อแล้วกด Enter",
    addButton: "เพิ่ม",
    emptyMembers: "ยังไม่มีสมาชิกในก๊วน เพิ่มชื่อเพื่อนที่จะมาตีแบดกันวันนี้",
    removeAria: "ลบ",

    matchTitle: "จับคู่",
    matchSubtitle: "{courts} คอร์ด · เล่น {hours} ชม. · ประมาณ {rounds} รอบ · {points} แต้ม",
    needFourPlayers: "ต้องมีสมาชิกอย่างน้อย 4 คนถึงจะจับคู่ตีคู่ได้ — ตอนนี้มี {count} คน",
    readyToMatch: "พร้อมจับคู่แล้ว — {count} คน · {courts} คอร์ด",
    startMatchingBtn: "จับคู่เลย",
    reshuffleBtn: "สุ่มใหม่",
    clearMatchesBtn: "เคลียร์",
    roundLabel: "รอบที่ {n}",
    courtLabel: "คอร์ด {n}",
    minutesChip: "~{n} นาที",
    vsMark: "VS",
    restingLabel: "พัก: {names}",
    notEnoughCourt: "คอร์ดไม่พอสำหรับรอบนี้",

    shuttleTitle: "ลูกขนไก่",
    shuttleSubtitle: "นับจำนวนลูกที่เสียระหว่างเล่น เพื่อคิดค่าลูกตอนสรุปยอด",
    shuttleLostLabel: "ลูกที่เสียไปวันนี้",
    fieldShuttlePrice: "ราคาต่อลูก (บาท)",
    shuttleTotalLabel: "ค่าลูกขนไก่รวม",

    summaryTitle: "สรุปค่าใช้จ่าย",
    summarySubtitle: "ตีเสร็จแล้วกดสรุปยอด หารเท่ากันทุกคน",
    summaryEmpty: "เพิ่มสมาชิกก่อนถึงจะหารค่าใช้จ่ายได้",
    totalLabel: "ยอดรวมทั้งหมด",
    courtCostLabel: "ค่าคอร์ด",
    shuttleCostLabel: "ค่าลูกขนไก่ ({count} ลูก)",
    perPersonLabel: "หารต่อคน · {count} คน",
  },
};

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`));
}

export function translate(locale, key, vars) {
  const table = dict[locale] || dict[DEFAULT_LOCALE];
  const str = table[key] ?? dict[DEFAULT_LOCALE][key] ?? key;
  return interpolate(str, vars);
}

export function formatMoney(n, locale) {
  const rounded = Math.round(n * 100) / 100;
  const localeTag = locale === "th" ? "th-TH" : "en-US";
  const formatted = Number.isInteger(rounded)
    ? rounded.toLocaleString(localeTag)
    : rounded.toLocaleString(localeTag, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return locale === "th" ? `${formatted} บาท` : `฿${formatted}`;
}

export function useLocale() {
  const [locale, setLocaleState] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCALE_KEY);
      return saved === "en" || saved === "th" ? saved : DEFAULT_LOCALE;
    } catch (e) {
      return DEFAULT_LOCALE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch (e) {
      /* ignore */
    }
  }, [locale]);

  const setLocale = useCallback((next) => setLocaleState(next), []);
  const t = useCallback((key, vars) => translate(locale, key, vars), [locale]);

  return { locale, setLocale, t };
}
