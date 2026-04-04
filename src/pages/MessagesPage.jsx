import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BrandLogo, Icon } from "../components/Shared.jsx";
import ConversationList from "../components/Chat/ConversationList.jsx";
import MessageThread from "../components/Chat/MessageThread.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { onUserConversations } from "../services/chat.js";

export default function MessagesPage({ user, onLogout }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const showThread = !!conversationId;

  useEffect(() => {
    if (!user?.id) return;
    const unsub = onUserConversations(user.id, (convs) => {
      setConversations(convs);
      setLoading(false);
    });
    return unsub;
  }, [user?.id]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === conversationId) || null,
    [conversations, conversationId]
  );

  const handleSelect = (id) => navigate(`/messages/${id}`);
  const handleBack = () => navigate("/messages");

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="messages-page">
      <header className="navbar">
        <div className="navbar__inner">
          <button className="btn btn--ghost profile-back-btn" onClick={() => navigate("/")}>
            <Icon n="arrow-left" /> <span className="profile-back-btn__label">{t("common.back")}</span>
          </button>
          <BrandLogo light onClick={() => navigate("/")} />
          <div className="profile-header-actions">
            <button className="btn btn--primary" onClick={onLogout}>{t("common.logout")}</button>
          </div>
        </div>
      </header>

      <div className="messages-page__body">
        <aside className={`messages-page__sidebar ${showThread ? "is-hidden-mobile" : ""}`}>
          <div className="messages-page__sidebar-header">
            <h2 className="messages-page__title">{t("messages.title")}</h2>
          </div>
          {loading ? (
            <p className="messages-page__loading">{t("messages.loadingChats")}</p>
          ) : (
            <ConversationList
              conversations={conversations}
              currentUserId={user.id}
              activeId={conversationId}
              onSelect={handleSelect}
            />
          )}
        </aside>

        <main className={`messages-page__panel ${!showThread ? "is-hidden-mobile" : ""}`}>
          <MessageThread conversation={activeConversation} currentUser={user} onBack={handleBack} />
        </main>
      </div>
    </div>
  );
}
