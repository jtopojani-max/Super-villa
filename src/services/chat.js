import { db } from "../firebase.js";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const convsRef = collection(db, "conversations");

const toDate = (value) => {
  if (!value) return new Date();
  if (typeof value.toDate === "function") return value.toDate();
  return new Date(value);
};

export const getOrCreateConversation = async (
  currentUserId,
  ownerId,
  listingId,
  listingTitle,
  currentUserName,
  ownerName,
) => {
  if (!currentUserId || !ownerId || !listingId) throw new Error("Missing required params for conversation.");
  if (currentUserId === ownerId) throw new Error("Cannot start conversation with yourself.");
  const q = query(convsRef, where("participants", "array-contains", currentUserId));
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) => {
    const data = d.data();
    return data.listingId === listingId && Array.isArray(data.participants) && data.participants.includes(ownerId);
  });
  if (existing) return existing.id;

  const ref = await addDoc(convsRef, {
    participants: [currentUserId, ownerId],
    participantNames: { [currentUserId]: currentUserName, [ownerId]: ownerName },
    listingId,
    listingTitle,
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    unreadCounts: { [currentUserId]: 0, [ownerId]: 0 },
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const sendMessage = async (conversationId, senderId, text, otherUserId) => {
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
  const update = {
    lastMessage: text.slice(0, 120),
    lastMessageAt: serverTimestamp(),
  };
  if (otherUserId) update[`unreadCounts.${otherUserId}`] = increment(1);
  await updateDoc(doc(db, "conversations", conversationId), update);
};

export const onConversationMessages = (conversationId, callback) => {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) })));
  });
};

export const onUserConversations = (userId, callback) => {
  const q = query(convsRef, where("participants", "array-contains", userId), orderBy("lastMessageAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data(), lastMessageAt: toDate(d.data().lastMessageAt) })));
  });
};

export const markConversationRead = async (conversationId, userId) => {
  if (!conversationId || !userId) return;
  await updateDoc(doc(db, "conversations", conversationId), {
    [`unreadCounts.${userId}`]: 0,
  });
};

export const onUnreadCount = (userId, callback) => {
  const q = query(convsRef, where("participants", "array-contains", userId));
  return onSnapshot(q, (snap) => {
    let total = 0;
    snap.docs.forEach((d) => {
      total += (d.data().unreadCounts?.[userId]) || 0;
    });
    callback(total);
  });
};
