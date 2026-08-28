import { sanitizeNumericInput } from "../state.js";

export default function SessionTab({ session, onField, onCourtStep, onSetPoints, onClearAll, t }) {
  function handleInput(field) {
    return (e) => onField(field, e.target.value);
  }
  function handleNumericInput(field, options) {
    return (e) => onField(field, sanitizeNumericInput(e.target.value, options));
  }

  return (
    <>
      <div className="panel-head">
        <h2>{t("sessionTitle")}</h2>
        <p>{t("sessionSubtitle")}</p>
      </div>

      <div className="card">
        {/* Temporarily disabled — date picker was breaking out of the fixed
            viewport on iOS Safari; location commented out alongside it per
            request. Re-enable once the picker issue is sorted out.
        <div className="field">
          <label>{t("fieldLocation")}</label>
          <input type="text" placeholder={t("placeholderLocation")} value={session.location} onChange={handleInput("location")} />
        </div>
        <div className="field">
          <label>{t("fieldDate")}</label>
          <input
            type="date"
            value={session.date}
            onChange={handleInput("date")}
            onFocus={() => document.body.classList.add("picker-open")}
            onBlur={() => document.body.classList.remove("picker-open")}
          />
        </div>
        */}
        <div className="field">
          <label>{t("fieldCourtNumbers")}</label>
          <input type="text" placeholder={t("placeholderCourtNumbers")} value={session.courtNumbers} onChange={handleInput("courtNumbers")} />
        </div>
        <div className="field">
          <label>{t("fieldCourtCount")}</label>
          <div className="stepper">
            <button type="button" aria-label="-" onClick={() => onCourtStep(-1)}>&#8722;</button>
            <span className="value">{session.courtCount} {t("unitCourts")}</span>
            <button type="button" aria-label="+" onClick={() => onCourtStep(1)}>&#43;</button>
          </div>
        </div>
        <div className="field">
          <label>{t("fieldCourtCost")}</label>
          <input type="text" inputMode="decimal" value={session.courtCost} onChange={handleNumericInput("courtCost")} />
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">{t("formatEyebrow")}</div>
        <div className="field">
          <label>{t("fieldPoints")}</label>
          <div className="segrow">
            <button type="button" className={"segbtn" + (session.points === 15 ? " active" : "")} onClick={() => onSetPoints(15)}>
              {t("ptsShort", { n: 15 })}
            </button>
            <button type="button" className={"segbtn" + (session.points === 21 ? " active" : "")} onClick={() => onSetPoints(21)}>
              {t("ptsShort", { n: 21 })}
            </button>
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>{t("fieldHours")}</label>
            <input type="text" inputMode="decimal" value={session.hours} onChange={handleNumericInput("hours")} />
          </div>
          <div className="field">
            <label>{t("fieldRoundMinutes")}</label>
            <input
              type="text"
              inputMode="numeric"
              value={session.roundMinutes}
              onChange={handleNumericInput("roundMinutes", { decimal: false })}
            />
          </div>
        </div>
      </div>

      <button type="button" className="btn btn-clear btn-block" onClick={onClearAll}>
        {t("clearAllBtn")}
      </button>
    </>
  );
}
