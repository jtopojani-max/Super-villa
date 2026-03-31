import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BrandLogo, Icon } from "../components/Shared.jsx";
import ConversationList from "../components/Chat/ConversationList.jsx";
import MessageThread from "../components/Chat/MessageThread.jsx";
import { onUserConversations } from "../services/chat.js";

export default function MessagesPage({ user, onLogout }) {
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
    () => conversations.find((c) => c.id === conversationId) || null,
    [conversations, conversationId],
  );

  const handleSelect = (id) => navigate(`/messages/${id}`);
  const handleBack = () => navigate("/messages");

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="messages-page">
      {/* Header */}
      <header className="navbar">
        <div className="navbar__inner">
          <button className="btn btn--ghost profile-back-btn" onClick={() => navigate("/")}>
            <Icon n="arrow-left" /> <span className="profile-back-btn__label">Kthehu</span>
          </button>
          <BrandLogo light onClick={() => navigate("/")} />
          <div className="profile-header-actions">
            <button className="btn btn--primary" onClick={onLogout}>Çkyçu</button>
          </div>
        </div>
      </header>

      <div className="messages-page__body">
        {/* Sidebar */}
        <aside className={`messages-page__sidebar ${showThread ? "is-hidden-mobile" : ""}`}>
          <div className="messages-page__sidebar-header">
            <h2 className="messages-page__title">Mesazhet e Mia</h2>
          </div>
          {loading ? (
            <p className="messages-page__loading">Duke ngarkuar bisedët...</p>
          ) : (
            <ConversationList
              conversations={conversations}
              currentUserId={user.id}
              activeId={conversationId}
              onSelect={handleSelect}
            />
          )}
        </aside>

        {/* Thread panel */}
        <main className={`messages-page__panel ${!showThread ? "is-hidden-mobile" : ""}`}>
          <MessageThread
            conversation={activeConversation}
            currentUser={user}
            onBack={handleBack}
          />
        </main>
      </div>
    </div>
  );
}
