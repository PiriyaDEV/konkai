import { IconShuffle } from "../icons.jsx";

export default function MatchTab({ members, session, match, onReshuffle, onClearMatches, t }) {
  const courts = session.courtCount;
  const canGenerate = members.length >= 4;
  const hasRounds = match.rounds.length > 0;

  const totalMinutes = Math.max(0, Number(session.hours) || 0) * 60;
  const totalRounds = Math.max(1, Math.round(totalMinutes / Math.max(5, Number(session.roundMinutes) || 20)));

  const memberById = Object.fromEntries(members.map((m) => [m.id, m]));

  return (
    <>
      <div className="panel-head">
        <h2>{t("matchTitle")}</h2>
        <p>{t("matchSubtitle", { courts, hours: session.hours, rounds: totalRounds, points: session.points })}</p>
      </div>

      {!canGenerate ? (
        <div className="empty">
          <IconShuffle />
          <p>{t("needFourPlayers", { count: members.length })}</p>
        </div>
      ) : !hasRounds ? (
        <>
          <div className="empty">
            <IconShuffle />
            <p>{t("readyToMatch", { count: members.length, courts })}</p>
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={onReshuffle}>
            {t("startMatchingBtn")}
          </button>
        </>
      ) : (
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={onReshuffle}>
            {t("reshuffleBtn")}
          </button>
          <button type="button" className="btn btn-clear" onClick={onClearMatches}>
            {t("clearMatchesBtn")}
          </button>
        </div>
      )}

      {match.rounds.map((round, idx) => {
          const restNames = round.sitOut.map((id) => memberById[id]?.name).filter(Boolean);
          return (
            <div className="round-block" key={idx}>
              <div className="round-title">
                <span className="eyebrow">{t("roundLabel", { n: idx + 1 })}</span>
                <span className="chip">{t("minutesChip", { n: session.roundMinutes })}</span>
              </div>
              {round.courts.length ? (
                round.courts.map((c) => (
                  <div className="court-card" key={c.courtIndex}>
                    <span className="court-tag">{t("courtLabel", { n: c.courtIndex })}</span>
                    <div className="team-vs">
                      <div className="team">
                        <span className="team-name">{c.team1[0].name}</span>
                        <span className="team-name">{c.team1[1].name}</span>
                      </div>
                      <div className="vs-mark">{t("vsMark")}</div>
                      <div className="team right">
                        <span className="team-name">{c.team2[0].name}</span>
                        <span className="team-name">{c.team2[1].name}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sitout-line">{t("notEnoughCourt")}</div>
              )}
              {restNames.length > 0 && <div className="sitout-line">{t("restingLabel", { names: restNames.join(", ") })}</div>}
            </div>
          );
        })}
    </>
  );
}
