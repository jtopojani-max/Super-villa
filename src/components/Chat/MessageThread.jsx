import { useEffect, useRef, useState } from "react";
import { Icon } from "../Shared.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { formatUiDate } from "../../i18n/ui.js";
import { markConversationRead, onConversationMessages, sendMessage } from "../../services/chat.js";

export default function MessageThread({ conversation, currentUser, onBack }) {
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const conversationId = conversation?.id;
  const otherUserId = conversation?.participants?.find((participant) => participant !== currentUser?.id);
  const otherName = conversation?.participantNames?.[otherUserId] || t("messages.defaultUser");
  const listingTitle = conversation?.listingTitle || "";

  useEffect(() => {
    if (!conversationId || !currentUser?.id) return;
    setMessages([]);
    const unsub = onConversationMessages(conversationId, setMessages);
    markConversationRead(conversationId, currentUser.id).catch(() => {});
    return unsub;
  }, [conversationId, currentUser?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || !currentUser?.id || !conversationId) return;
    setSending(true);
    setText("");
    try {
      await sendMessage(conversationId, currentUser.id, trimmed, otherUserId);
    } catch (error) {
      console.error("Failed to send message:", error);
      setText(trimmed);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (!conversation) {
    return (
      <div className="msg-thread msg-thread--empty">
        <Icon n="message" size={32} />
        <p>{t("messages.selectChat")}</p>
      </div>
    );
  }

  return (
    <div className="msg-thread">
      <div className="msg-thread__header">
        {onBack && (
          <button className="msg-thread__back" onClick={onBack} aria-label={t("common.back")}>
            <Icon n="arrow-left" />
          </button>
        )}
        <div className="msg-thread__header-info">
          <span className="msg-thread__other-name">{otherName}</span>
          <span className="msg-thread__listing-title">{listingTitle}</span>
        </div>
      </div>

      <div className="msg-thread__messages">
        {messages.length === 0 && (
          <p className="msg-thread__no-msgs">{t("messages.startChatHint")}</p>
        )}
        {messages.map((message) => {
          const isMine = message.senderId === currentUser.id;
          return (
            <div key={message.id} className={`msg-bubble ${isMine ? "msg-bubble--mine" : "msg-bubble--theirs"}`}>
              <p className="msg-bubble__text">{message.text}</p>
              <span className="msg-bubble__time">
                {formatUiDate(message.createdAt, lang, { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form className="msg-thread__input-row" onSubmit={handleSend}>
        <input
          ref={inputRef}
          className="msg-thread__input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t("messages.placeholder")}
          autoComplete="off"
        />
        <button
          type="submit"
          className="msg-thread__send-btn"
          disabled={!text.trim() || sending}
          aria-label={t("messages.send")}
        >
          <Icon n="paper-plane" />
        </button>
      </form>
    </div>
  );
}
