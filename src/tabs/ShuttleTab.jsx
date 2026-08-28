import { formatMoney } from "../i18n.js";
import { sanitizeNumericInput } from "../state.js";

export default function ShuttleTab({ shuttleCount, shuttlePrice, onCount, onPrice, locale, t }) {
  const subtotal = shuttleCount * (Number(shuttlePrice) || 0);

  return (
    <>
      <div className="panel-head">
        <h2>{t("shuttleTitle")}</h2>
        <p>{t("shuttleSubtitle")}</p>
      </div>

      <div className="card">
        <div className="shuttle-counter">
          <div className="shuttle-count-label">{t("shuttleLostLabel")}</div>
          <div className="shuttle-count-num num">{shuttleCount}</div>
          <div className="shuttle-btns">
            <button type="button" className="shuttle-btn minus" aria-label="-" onClick={() => onCount(Math.max(0, shuttleCount - 1))}>
              &#8722;
            </button>
            <button type="button" className="shuttle-btn plus" aria-label="+" onClick={() => onCount(shuttleCount + 1)}>
              &#43;
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="field">
          <label>{t("fieldShuttlePrice")}</label>
          <input
            type="text"
            inputMode="decimal"
            value={shuttlePrice}
            onChange={(e) => onPrice(sanitizeNumericInput(e.target.value))}
          />
        </div>
        <div className="stat-tile" style={{ border: "none", background: "var(--paper-sunk)", padding: "12px 14px" }}>
          <div className="k">{t("shuttleTotalLabel")}</div>
          <div className="v num">{formatMoney(subtotal, locale)}</div>
        </div>
      </div>
    </>
  );
}
