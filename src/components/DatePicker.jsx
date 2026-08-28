import { useState } from "react";

const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  th: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
};
const WEEKDAYS = {
  en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  th: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
};

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
}

// A small self-contained calendar dropdown, built to replace the native
// <input type="date">, whose OS-drawn picker overlay fought the app's fixed,
// overflow:hidden viewport on iOS Safari. Being plain DOM content instead of
// a native overlay, it can't hit that conflict at all — and it costs nothing
// beyond what's already in the bundle.
export default function DatePicker({ value, onChange, locale }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const sel = value ? parseISO(value) : { y: today.getFullYear(), m: today.getMonth(), d: today.getDate() };
  const [viewYear, setViewYear] = useState(sel.y);
  const [viewMonth, setViewMonth] = useState(sel.m);

  const months = MONTHS[locale] || MONTHS.en;
  const weekdays = WEEKDAYS[locale] || WEEKDAYS.en;

  const startWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array(startWeekday).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  function openPicker() {
    setViewYear(sel.y);
    setViewMonth(sel.m);
    setOpen(true);
  }
  function pick(d) {
    onChange(toISO(viewYear, viewMonth, d));
    setOpen(false);
  }
  function shiftMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  const displayText = value ? `${sel.d} ${months[sel.m]} ${sel.y}` : "";

  return (
    <div className="date-picker">
      <button type="button" className="date-picker-trigger" onClick={openPicker}>
        {displayText}
      </button>
      {open && (
        <>
          <div className="date-picker-backdrop" onClick={() => setOpen(false)} />
          <div className="date-picker-pop">
            <div className="date-picker-head">
              <button type="button" className="date-picker-nav" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                &#8249;
              </button>
              <span>{months[viewMonth]} {viewYear}</span>
              <button type="button" className="date-picker-nav" onClick={() => shiftMonth(1)} aria-label="Next month">
                &#8250;
              </button>
            </div>
            <div className="date-picker-grid date-picker-weekdays">
              {weekdays.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="date-picker-grid">
              {cells.map((d, i) =>
                d === null ? (
                  <span key={i} />
                ) : (
                  <button
                    type="button"
                    key={i}
                    className={"date-picker-day" + (value === toISO(viewYear, viewMonth, d) ? " active" : "")}
                    onClick={() => pick(d)}
                  >
                    {d}
                  </button>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
