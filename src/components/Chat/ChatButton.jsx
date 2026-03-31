import { useState } from "react";
import { ChatDots } from "@phosphor-icons/react";
import { getOrCreateConversation } from "../../services/chat.js";

export default function ChatButton({ listingId, listingTitle, ownerId, ownerName = "Pronari", currentUser, onNavigate, size = "lg" }) {
  const [loading, setLoading] = useState(false);

  if (!currentUser || !ownerId || currentUser.id === ownerId) return null;

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const convId = await getOrCreateConversation(
        currentUser.id,
        ownerId,
        listingId,
        listingTitle,
        currentUser.name || "Perdorues",
        ownerName,
      );
      onNavigate(convId);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className={`btn btn--chat btn--${size}`} onClick={handleClick} disabled={loading}>
      <ChatDots aria-hidden="true" />
      {loading ? "Duke hapur..." : "Dërgo Mesazh"}
    </button>
  );
}
