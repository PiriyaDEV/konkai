import { IconReceipt } from "../icons.jsx";
import { formatMoney } from "../i18n.js";
import { avatarClass, initials } from "../state.js";

export default function SummaryTab({ members, session, shuttleCount, shuttlePrice, locale, t }) {
  const courtCost = Number(session.courtCost) || 0;
  const shuttleCost = shuttleCount * (Number(shuttlePrice) || 0);
  const total = courtCost + shuttleCost;
  const perPerson = members.length ? total / members.length : 0;

  if (members.length === 0) {
    return (
      <>
        <div className="panel-head">
          <h2>{t("summaryTitle")}</h2>
        </div>
        <div className="empty">
          <IconReceipt />
          <p>{t("summaryEmpty")}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="panel-head">
        <h2>{t("summaryTitle")}</h2>
        <p>{t("summarySubtitle")}</p>
      </div>

      <div className="total-hero total-hero-warm">
        <span className="k">{t("totalLabel")}</span>
        <span className="v num">{formatMoney(total, locale)}</span>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <span className="k">{t("courtCostLabel")}</span>
          <span className="v num">{formatMoney(courtCost, locale)}</span>
        </div>
        <div className="stat-tile">
          <span className="k">{t("shuttleCostLabel", { count: shuttleCount })}</span>
          <span className="v num">{formatMoney(shuttleCost, locale)}</span>
        </div>
      </div>

      <div className="per-person">
        <span className="k">{t("perPersonLabel", { count: members.length })}</span>
        <span className="v num">{formatMoney(perPerson, locale)}</span>
      </div>

      <div className="card split-list" style={{ padding: "6px 12px" }}>
        {members.map((m, idx) => (
          <div className="member-row" key={m.id}>
            <div className={avatarClass(idx)}>{initials(m.name)}</div>
            <div className="member-name">{m.name}</div>
            <div className="v num">{formatMoney(perPerson, locale)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
