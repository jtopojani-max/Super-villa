import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChatDots, PaperPlaneRight } from "@phosphor-icons/react";
import { markConversationRead, onConversationMessages, sendMessage } from "../../services/chat.js";

function formatTime(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" });
}

export default function MessageThread({ conversation, currentUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const conversationId = conversation?.id;
  const otherUserId = conversation?.participants?.find((p) => p !== currentUser?.id);
  const otherName = conversation?.participantNames?.[otherUserId] || "Perdorues";
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

  const handleSend = async (e) => {
    e.preventDefault();
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
        <ChatDots size={32} aria-hidden="true" />
        <p>Zgjidhni një bisedë nga lista</p>
      </div>
    );
  }

  return (
    <div className="msg-thread">
      <div className="msg-thread__header">
        {onBack && (
          <button className="msg-thread__back" onClick={onBack} aria-label="Kthehu">
            <ArrowLeft aria-hidden="true" />
          </button>
        )}
        <div className="msg-thread__header-info">
          <span className="msg-thread__other-name">{otherName}</span>
          <span className="msg-thread__listing-title">{listingTitle}</span>
        </div>
      </div>

      <div className="msg-thread__messages">
        {messages.length === 0 && (
          <p className="msg-thread__no-msgs">Filloni bisedën duke dërguar mesazhin e parë.</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`msg-bubble ${isMine ? "msg-bubble--mine" : "msg-bubble--theirs"}`}>
              <p className="msg-bubble__text">{msg.text}</p>
              <span className="msg-bubble__time">{formatTime(msg.createdAt)}</span>
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
          onChange={(e) => setText(e.target.value)}
          placeholder="Shkruaj mesazh..."
          autoComplete="off"
        />
        <button
          type="submit"
          className="msg-thread__send-btn"
          disabled={!text.trim() || sending}
          aria-label="Dërgo"
        >
          <PaperPlaneRight aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
