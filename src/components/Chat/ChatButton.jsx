import { useState } from "react";
import { Icon } from "../Shared.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { getOrCreateConversation } from "../../services/chat.js";

export default function ChatButton({
  listingId,
  listingTitle,
  ownerId,
  ownerName = "",
  currentUser,
  onNavigate,
  size = "lg",
}) {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(false);

  if (!currentUser || !ownerId || currentUser.id === ownerId) return null;

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const conversationId = await getOrCreateConversation(
        currentUser.id,
        ownerId,
        listingId,
        listingTitle,
        currentUser.name || t("messages.defaultUser"),
        ownerName || (lang === "en" ? "Owner" : "Pronari")
      );
      onNavigate(conversationId);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className={`btn btn--chat btn--${size}`} onClick={handleClick} disabled={loading}>
      <Icon n="message" />
      {loading ? t("messages.startingChat") : t("details.sendMessage")}
    </button>
  );
}
