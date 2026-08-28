import { useState } from "react";
import { IconClose, IconUsers } from "../icons.jsx";
import { avatarClass, initials } from "../state.js";

export default function MembersTab({ members, onAdd, onRemove, t }) {
  const [draft, setDraft] = useState("");

  function submit(e) {
    e.preventDefault();
    const name = draft.trim();
    if (!name) return;
    onAdd(name);
    setDraft("");
  }

  return (
    <>
      <div className="panel-head">
        <h2>{t("membersTitle")}</h2>
        <p>{t("membersSubtitle", { count: members.length })}</p>
      </div>

      <div className="card">
        <form className="row" onSubmit={submit}>
          <input
            type="text"
            placeholder={t("placeholderMemberName")}
            maxLength={24}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="btn btn-warm" style={{ flex: "0 0 auto" }}>
            {t("addButton")}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: "6px 12px" }}>
        {members.length === 0 ? (
          <div className="empty">
            <IconUsers />
            <p>{t("emptyMembers")}</p>
          </div>
        ) : (
          members.map((m, idx) => (
            <div className="member-row" key={m.id}>
              <div className={avatarClass(idx)}>{initials(m.name)}</div>
              <div className="member-name">{m.name}</div>
              <button type="button" className="icon-btn" aria-label={t("removeAria")} onClick={() => onRemove(m.id)}>
                <IconClose />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
