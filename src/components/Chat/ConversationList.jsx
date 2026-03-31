import { ChatDots } from "@phosphor-icons/react";

function timeAgo(date) {
  if (!date) return "";
  const diff = Math.floor((Date.now() - (date instanceof Date ? date : new Date(date)).getTime()) / 1000);
  if (diff < 60) return "Tani";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} orë`;
  return `${Math.floor(diff / 86400)} ditë`;
}

export default function ConversationList({ conversations, currentUserId, activeId, onSelect }) {
  if (!conversations.length) {
    return (
      <div className="conv-list__empty">
        <ChatDots size={32} aria-hidden="true" />
        <p>Nuk keni biseda ende.</p>
      </div>
    );
  }

  return (
    <ul className="conv-list">
      {conversations.map((conv) => {
        const otherId = conv.participants?.find((p) => p !== currentUserId);
        const otherName = conv.participantNames?.[otherId] || "Perdorues";
        const unread = conv.unreadCounts?.[currentUserId] || 0;

        return (
          <li
            key={conv.id}
            className={`conv-list__item ${conv.id === activeId ? "is-active" : ""}`}
            onClick={() => onSelect(conv.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(conv.id); }}
          >
            <div className="conv-list__avatar">{otherName.charAt(0).toUpperCase()}</div>
            <div className="conv-list__info">
              <div className="conv-list__top-row">
                <span className="conv-list__name">{otherName}</span>
                <span className="conv-list__time">{timeAgo(conv.lastMessageAt)}</span>
              </div>
              <div className="conv-list__bottom-row">
                <span className="conv-list__listing">{conv.listingTitle}</span>
                {unread > 0 && <span className="conv-list__badge">{unread}</span>}
              </div>
              {conv.lastMessage && (
                <p className="conv-list__preview">
                  {conv.lastMessage.length > 45 ? conv.lastMessage.slice(0, 45) + "…" : conv.lastMessage}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
