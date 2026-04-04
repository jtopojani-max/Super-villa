import { Icon } from "../Shared.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { formatRelativeTime } from "../../i18n/ui.js";

export default function ConversationList({ conversations, currentUserId, activeId, onSelect }) {
  const { t } = useLanguage();

  if (!conversations.length) {
    return (
      <div className="conv-list__empty">
        <Icon n="message" size={32} />
        <p>{t("messages.noChats")}</p>
      </div>
    );
  }

  return (
    <ul className="conv-list">
      {conversations.map((conversation) => {
        const otherId = conversation.participants?.find((participant) => participant !== currentUserId);
        const otherName = conversation.participantNames?.[otherId] || t("messages.defaultUser");
        const unread = conversation.unreadCounts?.[currentUserId] || 0;

        return (
          <li
            key={conversation.id}
            className={`conv-list__item ${conversation.id === activeId ? "is-active" : ""}`}
            onClick={() => onSelect(conversation.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onSelect(conversation.id);
            }}
          >
            <div className="conv-list__avatar">{otherName.charAt(0).toUpperCase()}</div>
            <div className="conv-list__info">
              <div className="conv-list__top-row">
                <span className="conv-list__name">{otherName}</span>
                <span className="conv-list__time">{formatRelativeTime(conversation.lastMessageAt, t)}</span>
              </div>
              <div className="conv-list__bottom-row">
                <span className="conv-list__listing">{conversation.listingTitle}</span>
                {unread > 0 && <span className="conv-list__badge">{unread}</span>}
              </div>
              {conversation.lastMessage && (
                <p className="conv-list__preview">
                  {conversation.lastMessage.length > 45
                    ? `${conversation.lastMessage.slice(0, 45)}...`
                    : conversation.lastMessage}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
