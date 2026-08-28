import { useEffect, useMemo, useRef, useState } from "react";
import { IconPin, IconUsers, IconShuffle, IconShuttle, IconReceipt } from "./icons.jsx";
import { loadState, saveState, defaultState, uid, getGroupId, fetchRemoteState, pushRemoteState } from "./state.js";
import { useLocale } from "./i18n.js";
import { createMatchState, generateAllRounds } from "./matching.js";
import SessionTab from "./tabs/SessionTab.jsx";
import MembersTab from "./tabs/MembersTab.jsx";
import MatchTab from "./tabs/MatchTab.jsx";
import ShuttleTab from "./tabs/ShuttleTab.jsx";
import SummaryTab from "./tabs/SummaryTab.jsx";

const TABS = [
  { key: "session", labelKey: "navSession", Icon: IconPin },
  { key: "members", labelKey: "navMembers", Icon: IconUsers },
  { key: "match", labelKey: "navMatch", Icon: IconShuffle },
  { key: "shuttle", labelKey: "navShuttle", Icon: IconShuttle },
  { key: "summary", labelKey: "navSummary", Icon: IconReceipt },
];

function roundsForHours(hours, roundMinutes) {
  const totalMinutes = Math.max(0, Number(hours) || 0) * 60;
  return Math.max(1, Math.round(totalMinutes / Math.max(5, Number(roundMinutes) || 20)));
}

export default function App() {
  const groupId = useMemo(() => getGroupId(), []);
  const [state, setState] = useState(() => loadState(groupId));
  const { locale, setLocale, t } = useLocale();
  const pushTimer = useRef(null);
  const skipNextPush = useRef(false);
  const lastLocalEditAt = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Opened via the LINE bot's /group?group=<id> link: hydrate from the
  // shared backend once, then poll it so everyone in the group sees the
  // same data. Until that backend exists, fetchRemoteState just returns
  // null and this quietly does nothing — see state.js. Polling is skipped
  // right after a local edit (and skipped entirely if nothing actually
  // changed) so it never interrupts something the user is mid-typing.
  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;
    async function pull() {
      if (Date.now() - lastLocalEditAt.current < 4000) return;
      const remote = await fetchRemoteState(groupId);
      if (!remote || cancelled) return;
      if (JSON.stringify(remote) === JSON.stringify(stateRef.current)) return;
      skipNextPush.current = true;
      setState(remote);
    }
    pull();
    const interval = setInterval(pull, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [groupId]);

  useEffect(() => {
    saveState(state, groupId);
    lastLocalEditAt.current = Date.now();
    if (!groupId) return;
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => pushRemoteState(groupId, state), 800);
  }, [state, groupId]);

  useEffect(() => {
    const el = document.getElementById("splash");
    if (!el) return;
    const timer = setTimeout(() => {
      el.classList.add("splash-hide");
      setTimeout(() => el.remove(), 500);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  function setActiveTab(tab) {
    setState((s) => ({ ...s, activeTab: tab }));
  }

  function onSessionField(field, value) {
    setState((s) => ({ ...s, session: { ...s.session, [field]: value } }));
  }
  function onCourtStep(delta) {
    setState((s) => ({ ...s, session: { ...s.session, courtCount: Math.min(20, Math.max(1, s.session.courtCount + delta)) } }));
  }
  function onSetPoints(pts) {
    setState((s) => ({ ...s, session: { ...s.session, points: pts, roundMinutes: pts === 15 ? 15 : 20 } }));
  }

  function onAddMember(name) {
    setState((s) => ({ ...s, members: [...s.members, { id: uid(), name }], match: createMatchState() }));
  }
  function onRemoveMember(id) {
    setState((s) => ({ ...s, members: s.members.filter((m) => m.id !== id), match: createMatchState() }));
  }

  function onReshuffle() {
    setState((s) => {
      const totalRounds = roundsForHours(s.session.hours, s.session.roundMinutes);
      const next = generateAllRounds(s.members, s.session.courtCount, totalRounds);
      return { ...s, match: next };
    });
  }
  function onClearMatches() {
    setState((s) => ({ ...s, match: createMatchState() }));
  }

  function onShuttleCount(n) {
    setState((s) => ({ ...s, shuttleCount: n }));
  }
  function onShuttlePrice(n) {
    setState((s) => ({ ...s, shuttlePrice: n }));
  }

  function onClearAll() {
    if (!window.confirm(t("clearAllConfirm"))) return;
    setState(defaultState());
  }

  const headerLine = useMemo(() => {
    if (!state.session.location) return t("headerNewCrew");
    const courtsPart = `${state.session.courtCount} ${t("unitCourts")}`;
    const numbersPart = state.session.courtNumbers ? ` (${t("headerCourtNumbers", { numbers: state.session.courtNumbers })})` : "";
    return `${state.session.location} · ${courtsPart}${numbersPart}`;
  }, [state.session, t]);

  return (
    <div className="backdrop">
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-mark">
            <img src="/icon.svg" alt="Konkai" />
          </div>
          <div className="brand-text">
            <div className="wordmark">KONKAI</div>
            <div className="session-line">{headerLine}</div>
          </div>
          <div className="lang-toggle">
            <button type="button" className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")}>
              EN
            </button>
            <button type="button" className={locale === "th" ? "active" : ""} onClick={() => setLocale("th")}>
              TH
            </button>
          </div>
        </header>

        <main>
          {state.activeTab === "session" && (
            <SessionTab
              session={state.session}
              onField={onSessionField}
              onCourtStep={onCourtStep}
              onSetPoints={onSetPoints}
              onClearAll={onClearAll}
              t={t}
            />
          )}
          {state.activeTab === "members" && (
            <MembersTab members={state.members} onAdd={onAddMember} onRemove={onRemoveMember} t={t} />
          )}
          {state.activeTab === "match" && (
            <MatchTab
              members={state.members}
              session={state.session}
              match={state.match}
              onReshuffle={onReshuffle}
              onClearMatches={onClearMatches}
              t={t}
            />
          )}
          {state.activeTab === "shuttle" && (
            <ShuttleTab
              shuttleCount={state.shuttleCount}
              shuttlePrice={state.shuttlePrice}
              onCount={onShuttleCount}
              onPrice={onShuttlePrice}
              locale={locale}
              t={t}
            />
          )}
          {state.activeTab === "summary" && (
            <SummaryTab
              members={state.members}
              session={state.session}
              shuttleCount={state.shuttleCount}
              shuttlePrice={state.shuttlePrice}
              locale={locale}
              t={t}
            />
          )}
        </main>

        <nav className="bottomnav">
          {TABS.map(({ key, labelKey, Icon }) => (
            <button
              key={key}
              type="button"
              className={"navbtn" + (state.activeTab === key ? " active" : "")}
              onClick={() => setActiveTab(key)}
            >
              <Icon />
              <span>{t(labelKey)}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
