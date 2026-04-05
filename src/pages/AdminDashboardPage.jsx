import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { ArrowLeft, ArrowUpDown, BarChart3, ClipboardList, Menu, Sparkles, UsersRound } from "lucide-react";
import { BrandLogo, Icon } from "../components/Shared.jsx";
import AdminAnalyticsPanel from "../components/AdminAnalyticsPanel.jsx";
import PaidPlansAdminPanel from "../components/PaidPlansAdminPanel.jsx";
import ModernSidebar from "../components/ui/modern-side-bar.tsx";
import { db, functions } from "../firebase.js";
import {
  listAllPrivatePosts,
  listActivePostsSorted,
  approvePost,
  rejectPost,
  reorderPosts,
  adminDeletePost,
  updatePostPremium,
} from "../services/posts.js";
import { getListingExperience } from "../utils/experience.js";
import { FEATURE_ICONS } from "../utils/listingFeatures.js";

const ADMIN_SECTIONS = [
  {
    id: "analytics",
    label: "Statistikat",
    description: "Views dhe performanca globale",
    icon: BarChart3,
  },
  {
    id: "posts",
    label: "Moderimi",
    description: "Mirato ose refuzo shpalljet",
    icon: ClipboardList,
  },
  {
    id: "reorder",
    label: "Renditja",
    description: "Kontrollo rendin e listimeve aktive",
    icon: ArrowUpDown,
  },
  {
    id: "premium",
    label: "Planet me pagese",
    description: "Menaxho premium dhe verifikimet",
    icon: Sparkles,
  },
  {
    id: "users",
    label: "Perdoruesit",
    description: "Monitoro llogarite dhe rolet",
    icon: UsersRound,
  },
];

export default function AdminDashboardPage({ user }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [postsError, setPostsError] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  // Posts moderation
  const [statusFilter, setStatusFilter] = useState("all");
  const [idSearch, setIdSearch] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [premiumDraft, setPremiumDraft] = useState({ isPremium: false, premiumOrder: "", premiumDays: "" });
  const [premiumSaving, setPremiumSaving] = useState(false);
  // Drag-and-drop for active posts
  const [dragPosts, setDragPosts] = useState([]);
  const [loadingDrag, setLoadingDrag] = useState(false);
  const [dragIdSearch, setDragIdSearch] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderValue, setEditOrderValue] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);
  const [dragExperience, setDragExperience] = useState("villas");
  const [premiumExperience, setPremiumExperience] = useState("villas");
  const [premiumSearch, setPremiumSearch] = useState("");
  const [premiumEdits, setPremiumEdits] = useState({});
  const [premiumSavingId, setPremiumSavingId] = useState("");
  // View post detail modal
  const [viewPost, setViewPost] = useState(null);
  const [viewImageIndex, setViewImageIndex] = useState(0);
  const viewTouchRef = useRef(null);
  // Dropdown menu for post actions
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, openUp: false });
  const actionMenuRef = useRef(null);
  const actionBtnRefs = useRef({});
  const userBtnRefs = useRef({});

  const toMillis = useCallback((value) => {
    if (!value) return 0;
    if (typeof value.toDate === "function") return value.toDate().getTime();
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, []);

  // ─── Load data ────────────────────────────────────────────────────
  const loadPosts = async () => {
    setLoadingPosts(true);
    setPostsError("");
    try {
      setPosts(await listAllPrivatePosts());
    } catch (error) {
      console.error("Failed to load posts:", error);
      setPostsError("Nuk mund te ngarkohen shpalljet.");
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadDragPosts = async () => {
    setLoadingDrag(true);
    try {
      const result = await listActivePostsSorted();
      setDragPosts(result);
    } catch (error) {
      console.error("Failed to load active posts:", error?.code, error?.message, error);
      setPostsError("Gabim ne ngarkimin e posteve aktive: " + (error?.message || ""));
    } finally {
      setLoadingDrag(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsersError("Nuk mund te ngarkohen perdoruesit.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadPosts();
  }, []);

  useEffect(() => {
    if (tab === "reorder") loadDragPosts();
  }, [tab]);

  useEffect(() => {
    setIsSidebarMobileOpen(false);
    setOpenActionMenu(null);
  }, [tab]);

  useEffect(() => {
    if (!viewPost) return;

    // Premium form: keep admin controls in sync with the currently opened listing.
    setPremiumDraft({
      isPremium: Boolean(viewPost.isPremium),
      premiumOrder: viewPost.premiumOrder ? String(viewPost.premiumOrder) : "",
      premiumDays: viewPost.premiumDays ? String(viewPost.premiumDays) : "",
    });
  }, [viewPost]);

  // Close action dropdown on outside click or scroll
  useEffect(() => {
    if (!openActionMenu) return;
    const handler = (e) => {
      const btnEl = actionBtnRefs.current[openActionMenu] || userBtnRefs.current[openActionMenu];
      if (
        actionMenuRef.current && !actionMenuRef.current.contains(e.target) &&
        (!btnEl || !btnEl.contains(e.target))
      ) {
        setOpenActionMenu(null);
      }
    };
    const scrollHandler = () => setOpenActionMenu(null);
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", scrollHandler, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", scrollHandler, true);
    };
  }, [openActionMenu]);

  // Toggle action menu with portal positioning
  const toggleActionMenu = useCallback((itemId) => {
    if (openActionMenu === itemId) { setOpenActionMenu(null); return; }
    const btn = actionBtnRefs.current[itemId];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const MENU_HEIGHT = 220;
    const MENU_WIDTH = 170;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < MENU_HEIGHT;
    // Prevent menu from going off-screen left
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = 8;
    // Prevent menu from going off-screen right
    if (left + MENU_WIDTH > window.innerWidth - 8) left = window.innerWidth - MENU_WIDTH - 8;
    setMenuPos({
      top: openUp ? rect.top : rect.bottom + 4,
      left,
      openUp,
    });
    setOpenActionMenu(itemId);
  }, [openActionMenu]);

  const toggleUserMenu = useCallback((itemId) => {
    if (openActionMenu === itemId) { setOpenActionMenu(null); return; }
    const btn = userBtnRefs.current[itemId];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const MENU_HEIGHT = 120;
    const MENU_WIDTH = 160;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < MENU_HEIGHT;
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = 8;
    if (left + MENU_WIDTH > window.innerWidth - 8) left = window.innerWidth - MENU_WIDTH - 8;
    setMenuPos({ top: openUp ? rect.top : rect.bottom + 4, left, openUp });
    setOpenActionMenu(itemId);
  }, [openActionMenu]);

  // ─── Post actions ─────────────────────────────────────────────────
  const handleApprove = async (postId) => {
    setActionLoading(postId);
    try {
      await approvePost(postId);
      await loadPosts();
    } catch (error) {
      console.error("Approve failed:", error?.code, error?.message, error);
      setPostsError("Gabim: " + (error?.message || "Nuk u arrit te aprovohet posti."));
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = async (postId) => {
    setActionLoading(postId);
    try {
      await rejectPost(postId);
      await loadPosts();
    } catch (error) {
      console.error("Reject failed:", error?.code, error?.message, error);
      setPostsError("Gabim: " + (error?.message || "Nuk u arrit te refuzohet posti."));
    } finally {
      setActionLoading("");
    }
  };

  const handleAdminDelete = async (postId) => {
    const reason = window.prompt("Shkruaj arsyen e fshirjes se postit:");
    if (reason === null) return; // user cancelled
    if (!reason.trim()) {
      alert("Duhet te shkruash nje arsye per fshirjen.");
      return;
    }
    setActionLoading(postId);
    try {
      await adminDeletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Admin delete failed:", error?.code, error?.message, error);
      setPostsError("Gabim: " + (error?.message || "Nuk u arrit te fshihet posti."));
    } finally {
      setActionLoading("");
    }
  };

  const handleSavePremium = async (postId) => {
    if (premiumDraft.isPremium) {
      const premiumOrder = Number.parseInt(premiumDraft.premiumOrder, 10);
      if (!Number.isInteger(premiumOrder) || premiumOrder < 1) {
        setPostsError("Renditja premium duhet te jete nje numer pozitiv (1, 2, 3...).");
        return;
      }

      const currentPost = posts.find((p) => p.id === postId);
      if (currentPost) {
        const matchingExperiencePosts = activePremiumCandidates.filter(
          (candidate) => getListingExperience(candidate) === getListingExperience(currentPost) && candidate.id !== postId && candidate.isPremium
        );

        if (matchingExperiencePosts.some((candidate) => candidate.premiumOrder === premiumOrder)) {
          setPostsError(`Numri premium #${premiumOrder} eshte ne perdorim. Zgjidh nje numer tjeter.`);
          return;
        }
      }
    }

    setPremiumSaving(true);
    setPostsError("");

    try {
      const result = await updatePostPremium(postId, premiumDraft);
      await loadPosts();
      setViewPost((current) => (current ? { ...current, ...result } : current));
    } catch (error) {
      console.error("Premium update failed:", error?.code, error?.message, error);
      setPostsError("Gabim gjate ruajtjes se konfigurimit premium.");
    } finally {
      setPremiumSaving(false);
    }
  };

  const getPremiumRowDraft = useCallback(
    (post, draftMap = premiumEdits) => {
      const storedDraft = draftMap[post.id];
      if (storedDraft) return storedDraft;
      return {
        isPremium: Boolean(post.isPremium),
        premiumOrder: post.premiumOrder ? String(post.premiumOrder) : "",
        premiumDays: post.premiumDays ? String(post.premiumDays) : "",
      };
    },
    [premiumEdits]
  );

  const updatePremiumRowDraft = useCallback(
    (post, updater) => {
      setPremiumEdits((current) => {
        const baseDraft = current[post.id] || {
          isPremium: Boolean(post.isPremium),
          premiumOrder: post.premiumOrder ? String(post.premiumOrder) : "",
          premiumDays: post.premiumDays ? String(post.premiumDays) : "",
        };
        return {
          ...current,
          [post.id]: typeof updater === "function" ? updater(baseDraft) : updater,
        };
      });
    },
    []
  );

  const handleSaveAllPremium = async () => {
    const editedIds = Object.keys(premiumEdits);
    if (editedIds.length === 0) return;
    setPremiumSavingId("__all__");
    setPostsError("");
    let errors = [];
    for (const postId of editedIds) {
      const post = currentPremiumList.find((p) => p.id === postId);
      if (!post) continue;
      const rowDraft = getPremiumRowDraft(post);
      try {
        await updatePostPremium(post.id, rowDraft);
      } catch (error) {
        errors.push(`#${post.idNumber}: ${error?.message || "Gabim"}`);
      }
    }
    await loadPosts();
    setPremiumEdits({});
    setPremiumSavingId("");
    if (errors.length) {
      setPostsError("Disa ndryshime deshtuan: " + errors.join("; "));
    }
  };

  const handleSavePremiumRow = async (post) => {
    const rowDraft = getPremiumRowDraft(post);
    if (rowDraft.isPremium) {
      const premiumOrder = Number.parseInt(rowDraft.premiumOrder, 10);
      if (!Number.isInteger(premiumOrder) || premiumOrder < 1) {
        setPostsError("Renditja premium duhet te jete nje numer pozitiv (1, 2, 3...).");
        return;
      }

      const matchingExperiencePosts = activePremiumCandidates.filter(
        (candidate) => getListingExperience(candidate) === getListingExperience(post) && candidate.id !== post.id && candidate.isPremium
      );

      if (matchingExperiencePosts.some((candidate) => candidate.premiumOrder === premiumOrder)) {
        setPostsError(`Numri premium #${premiumOrder} eshte ne perdorim. Zgjidh nje numer tjeter.`);
        return;
      }
    }

    setPremiumSavingId(post.id);
    setPostsError("");

    try {
      const result = await updatePostPremium(post.id, rowDraft);
      await loadPosts();
      setPremiumEdits((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[post.id];
        return nextDrafts;
      });
      setViewPost((current) => (current?.id === post.id ? { ...current, ...result } : current));
    } catch (error) {
      console.error("Premium row update failed:", error?.code, error?.message, error);
      if (error?.code === "permission-denied" || /insufficient permissions/i.test(String(error?.message || ""))) {
        setPostsError("Nuk ka leje te mjaftueshme per ta ruajtur premium. Kontrollo rolin admin ne Firebase.");
      } else {
        setPostsError(error?.message || "Gabim gjate ruajtjes se premium ne panel.");
      }
    } finally {
      setPremiumSavingId("");
    }
  };


  const removeUser = async (uid) => {
    const ok = window.confirm(
      "A je i sigurt? Kjo do te çaktivizoje llogarinë Auth, do te fshije dokumentin e perdoruesit dhe do te heqe postimet e tij nga faqja publike."
    );
    if (!ok) return;
    try {
      const callDeleteUser = httpsCallable(functions, "deleteUser");
      await callDeleteUser({ targetUid: uid });
      setUsers((prev) => prev.filter((item) => item.id !== uid));
      await loadPosts(); // refresh posts since user's posts were rejected
    } catch (error) {
      console.error("Failed to delete user:", error);
      const msg = error?.message || "Gabim gjate fshirjes se perdoruesit.";
      setUsersError(msg);
    }
  };

  // ─── Edit order handlers ──────────────────────────────────────────
  const handleStartEditOrder = (postId, currentIndex) => {
    setEditingOrder(postId);
    setEditOrderValue(String(currentIndex + 1));
  };

  const handleCancelEditOrder = () => {
    setEditingOrder(null);
    setEditOrderValue("");
  };

  const handleSaveEditOrder = async (postId) => {
    const newPos = parseInt(editOrderValue, 10);
    if (!newPos || newPos <= 0 || newPos > currentDragList.length) return;
    const currentIndex = currentDragList.findIndex((p) => p.id === postId);
    if (currentIndex === -1) return;
    if (currentIndex === newPos - 1) {
      setEditingOrder(null);
      setEditOrderValue("");
      return;
    }
    setSavingOrder(true);
    try {
      const reordered = [...currentDragList];
      const [moved] = reordered.splice(currentIndex, 1);
      reordered.splice(newPos - 1, 0, moved);
      // Update sortOrder values in local state for this experience only
      const withUpdatedOrder = reordered.map((p, i) => ({ ...p, sortOrder: i + 1 }));
      // Merge back into full dragPosts list
      const otherPosts = dragPosts.filter((p) => getListingExperience(p) !== dragExperience);
      setDragPosts([...otherPosts, ...withUpdatedOrder]);
      // Save new order to Firestore (only this experience's posts)
      await reorderPosts(reordered.map((p) => p.id));
      setEditingOrder(null);
      setEditOrderValue("");
    } catch (error) {
      console.error("Failed to reorder:", error);
      setPostsError("Gabim gjate ndryshimit te renditjes.");
    } finally {
      setSavingOrder(false);
    }
  };

  // ─── Computed ─────────────────────────────────────────────────────
  const postsByUser = useMemo(() => {
    return posts.reduce((acc, post) => {
      if (!post.ownerUid) return acc;
      acc[post.ownerUid] = (acc[post.ownerUid] || 0) + 1;
      return acc;
    }, {});
  }, [posts]);

  // Split drag posts by experience, each sorted by their own sortOrder
  const dragVillas = useMemo(
    () => dragPosts.filter((p) => getListingExperience(p) === "villas"),
    [dragPosts]
  );
  const dragApartments = useMemo(
    () => dragPosts.filter((p) => getListingExperience(p) === "apartments"),
    [dragPosts]
  );
  const currentDragList = dragExperience === "apartments" ? dragApartments : dragVillas;

  const filteredDragPosts = useMemo(() => {
    let result = currentDragList.map((item, realIndex) => ({ item, realIndex }));
    if (dragIdSearch.trim()) {
      result = result.filter(({ item }) => String(item.idNumber).includes(dragIdSearch.trim()));
    }
    return result;
  }, [currentDragList, dragIdSearch]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (idSearch.trim()) {
      const search = idSearch.trim();
      result = result.filter((p) => String(p.idNumber).includes(search));
    }
    return result;
  }, [posts, statusFilter, idSearch]);

  const pendingCount = posts.filter((p) => p.status === "pending").length;
  const activeCount = posts.filter((p) => p.status === "active").length;
  const rejectedCount = posts.filter((p) => p.status === "rejected").length;

  const sortedUsers = [...users].sort((a, b) => {
    const direction = sortDir === "asc" ? 1 : -1;
    const va = a?.[sortBy] ?? "";
    const vb = b?.[sortBy] ?? "";
    if (sortBy === "createdAt") return (toMillis(va) - toMillis(vb)) * direction;
    return String(va).localeCompare(String(vb)) * direction;
  });

  const filteredUsers = sortedUsers.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [item.name, item.email, item.role].some((value) => String(value || "").toLowerCase().includes(q));
  });

  const activePremiumCandidates = useMemo(
    () => posts.filter((post) => post.status === "active"),
    [posts]
  );

  const premiumVillas = useMemo(
    () => activePremiumCandidates.filter((post) => getListingExperience(post) === "villas"),
    [activePremiumCandidates]
  );

  const premiumApartments = useMemo(
    () => activePremiumCandidates.filter((post) => getListingExperience(post) === "apartments"),
    [activePremiumCandidates]
  );

  const currentPremiumList = premiumExperience === "apartments" ? premiumApartments : premiumVillas;

  const occupiedPremiumSlots = useMemo(
    () =>
      currentPremiumList
        .filter((post) => post.isPremium && Number.isInteger(post.premiumOrder))
        .map((post) => post.premiumOrder)
        .sort((a, b) => a - b),
    [currentPremiumList]
  );

  const highestSlot = useMemo(
    () => occupiedPremiumSlots.length ? Math.max(...occupiedPremiumSlots, 10) : 10,
    [occupiedPremiumSlots]
  );

  const availablePremiumSlots = useMemo(
    () => Array.from({ length: highestSlot }, (_, index) => index + 1).filter((slot) => !occupiedPremiumSlots.includes(slot)),
    [occupiedPremiumSlots, highestSlot]
  );

  const pendingPremiumEdits = Object.keys(premiumEdits).length;

  const filteredPremiumPosts = useMemo(() => {
    const search = premiumSearch.trim().toLowerCase();

    return [...currentPremiumList]
      .filter((post) => {
        if (!search) return true;
        return [
          post.title,
          post.location,
          post.author,
          post.idNumber,
        ].some((value) => String(value || "").toLowerCase().includes(search));
      })
      .sort((a, b) => {
        const aPremium = a.isPremium ? 1 : 0;
        const bPremium = b.isPremium ? 1 : 0;
        if (aPremium !== bPremium) return bPremium - aPremium;
        const aOrder = typeof a.premiumOrder === "number" ? a.premiumOrder : Number.MAX_SAFE_INTEGER;
        const bOrder = typeof b.premiumOrder === "number" ? b.premiumOrder : Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return toMillis(b.createdAt) - toMillis(a.createdAt);
      });
  }, [currentPremiumList, premiumSearch, toMillis]);

  const premiumCount = activePremiumCandidates.filter((post) => post.isPremium).length;
  const currentSection = ADMIN_SECTIONS.find((section) => section.id === tab) || ADMIN_SECTIONS[1];
  const sidebarItems = useMemo(
    () =>
      ADMIN_SECTIONS.map((section) => ({
        ...section,
        badge:
          section.id === "posts"
            ? pendingCount || null
            : section.id === "premium"
              ? premiumCount || null
              : section.id === "users"
                ? users.length || null
                : null,
      })),
    [pendingCount, premiumCount, users.length]
  );
  const dashboardStats = useMemo(
    () => [
      {
        key: "posts",
        label: "Totali shpallje",
        value: posts.length,
        hint: "Gjithe listimet ne sistem",
        icon: "home",
      },
      {
        key: "users",
        label: "Totali perdorues",
        value: users.length,
        hint: "Llogari aktive dhe te regjistruara",
        icon: "users",
      },
      {
        key: "pending",
        label: "Ne pritje",
        value: pendingCount,
        hint: "Shpallje qe presin verifikim",
        icon: "clock",
        valueClassName: "warning",
      },
      {
        key: "active",
        label: "Aktive",
        value: activeCount,
        hint: "Listime te publikuara",
        icon: "check-circle",
        valueClassName: "gold",
      },
      {
        key: "rejected",
        label: "Refuzuara",
        value: rejectedCount,
        hint: "Listime te ndaluara nga paneli",
        icon: "ban",
        valueStyle: { color: "var(--error)" },
      },
    ],
    [activeCount, pendingCount, posts.length, rejectedCount, users.length]
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-denied">
        <Icon n="shield-halved" className="admin-denied__icon" />
        <h2 className="admin-denied__title">Qasja e ndaluar</h2>
        <p className="admin-denied__copy">Vetem adminet mund te hyjne ketu.</p>
        <button className="btn btn--primary" onClick={() => navigate("/")}>
          Kthehu
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`admin-shell${isSidebarCollapsed ? " admin-shell--collapsed" : ""}`}>
        <ModernSidebar
          activeItemId={tab}
          brand={<BrandLogo light onClick={() => navigate("/")} className="modern-sidebar__brand-logo" />}
          footer={
            <button type="button" className="modern-sidebar__footer-link" onClick={() => navigate("/")}>
              <ArrowLeft size={16} strokeWidth={2} />
              <span>Kthehu ne faqe</span>
            </button>
          }
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isSidebarMobileOpen}
          items={sidebarItems}
          meta={
            <div className="modern-sidebar__meta-card">
              <span className="modern-sidebar__meta-label">Admin aktiv</span>
              <strong>Villa Apartamente</strong>
              <small>Qasje e plote ne moderim, perdorues dhe pagesa.</small>
            </div>
          }
          onMobileClose={() => setIsSidebarMobileOpen(false)}
          onSelect={setTab}
          onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
          title="Admin Dashboard"
        />

        <div className="admin-shell__main">
          <div className="admin-body">
            <header className="admin-page-header">
              <div className="admin-page-header__bar">
                <div className="admin-page-header__intro">
                  <button
                    type="button"
                    className="admin-page-header__menu"
                    aria-label="Hap navigimin"
                    onClick={() => setIsSidebarMobileOpen(true)}
                  >
                    <Menu size={18} strokeWidth={2} />
                  </button>
                  <div className="admin-page-header__copy">
                    <p className="admin-page-header__eyebrow">Villa Apartmene Admin</p>
                    <h1 className="admin-page-header__title">{currentSection.label}</h1>
                    <p className="admin-page-header__subtitle">{currentSection.description}</p>
                  </div>
                </div>

                <div className="admin-page-header__actions">
                  <div className="admin-page-header__user">
                    <span className="admin-page-header__user-label">Administrator</span>
                    <strong>{user.name}</strong>
                  </div>
                  <button className="btn btn--ghost admin-page-header__back" onClick={() => navigate("/")}>
                    <ArrowLeft size={16} strokeWidth={2} />
                    <span>Kthehu</span>
                  </button>
                </div>
              </div>

              <div className="admin-stat-grid">
                {dashboardStats.map((item) => (
                  <div key={item.key} className="admin-stat-card admin-stat-card--dashboard">
                    <div className="admin-stat-card__head">
                      <p className="admin-stat-card__label">{item.label}</p>
                      <span className="admin-stat-card__icon">
                        <Icon n={item.icon} />
                      </span>
                    </div>
                    <p className={`admin-stat-card__val${item.valueClassName ? ` ${item.valueClassName}` : ""}`} style={item.valueStyle}>
                      {item.value}
                    </p>
                    <p className="admin-stat-card__hint">{item.hint}</p>
                  </div>
                ))}
              </div>

              <div className="admin-tabs admin-tabs--surface">
                {ADMIN_SECTIONS.map((section) => {
                  const SectionIcon = section.icon;

                  return (
                    <button
                      key={section.id}
                      className={`admin-tab ${tab === section.id ? "active" : ""}`}
                      onClick={() => setTab(section.id)}
                    >
                      <SectionIcon size={16} strokeWidth={1.9} />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </header>

            <div className="admin-content">
              {/* ─── POSTS MODERATION TAB ─────────────────────────────────── */}
              {tab === "analytics" && <AdminAnalyticsPanel />}

              {tab === "posts" && (
          <div className="admin-table admin-table--moderation">
            <div className="admin-toolbar admin-toolbar--moderation">
              <div className="admin-toolbar__filters admin-toolbar__filters--moderation">
                <select
                  className="auth-input admin-toolbar__select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Te gjitha ({posts.length})</option>
                  <option value="pending">Ne pritje ({pendingCount})</option>
                  <option value="active">Aktive ({activeCount})</option>
                  <option value="rejected">Refuzuara ({rejectedCount})</option>
                </select>
                <input
                  className="auth-input admin-toolbar__field"
                  placeholder="Kerko me ID numerin..."
                  value={idSearch}
                  onChange={(e) => setIdSearch(e.target.value)}
                  style={{ maxWidth: 200 }}
                />
              </div>
              <button className="btn btn--ghost" onClick={loadPosts}>
                <Icon n="arrows-rotate" /> Rifresko
              </button>
            </div>

            <div className="admin-table__viewport admin-table__viewport--moderation">
              <div className="admin-table-row admin-table-head moderation-row">
                <span>ID</span>
                <span>Titulli</span>
                <span>Lokacioni</span>
                <span>Cmimi</span>
                <span>Autori</span>
                <span>Statusi</span>
                <span>Veprimet</span>
              </div>

              {postsError && (
                <div className="admin-empty">
                  <p style={{ color: "var(--error)" }}>{postsError}</p>
                </div>
              )}
              {loadingPosts ? (
                <div className="admin-empty">
                  <p>Duke ngarkuar shpalljet...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="admin-empty">
                  <Icon n="house-circle-xmark" style={{ fontSize: "2rem", opacity: 0.25, display: "block", marginBottom: 12 }} />
                  <p>Nuk ka shpallje me kete filter.</p>
                </div>
              ) : (
                filteredPosts.map((item) => (
                  <div className="admin-table-row moderation-row" key={item.id}>
                    <span className="moderation-id">#{item.idNumber}</span>
                    <span className="moderation-main">
                      <span className="moderation-title">{item.title}</span>
                      {item.isPremium && (
                        <span className="admin-premium-chip">
                          Premium{item.premiumOrder ? ` #${item.premiumOrder}` : ""}
                        </span>
                      )}
                    </span>
                    <div className="moderation-details">
                      <span className="moderation-location">{item.location}</span>
                      <span className="moderation-price">€ {item.price}</span>
                      <span className="moderation-author">{item.author}</span>
                      <span className="moderation-status">
                        <span className={`status-badge status-badge--${item.status || "pending"}`}>
                          {item.statusBadge || "Wait to confirm"}
                        </span>
                      </span>
                    </div>
                    <div className="admin-table__action-group moderation-actions">
                      <button
                        ref={(el) => { actionBtnRefs.current[item.id] = el; }}
                        type="button"
                        className="admin-action-trigger"
                        onClick={() => toggleActionMenu(item.id)}
                        title="Veprimet"
                      >
                        <Icon n="settings" />
                      </button>
                      {openActionMenu === item.id && createPortal(
                        <div ref={actionMenuRef} className="admin-floating-menu" style={{
                          position: "fixed",
                          left: menuPos.left,
                          top: menuPos.openUp ? "auto" : menuPos.top,
                          bottom: menuPos.openUp ? (window.innerHeight - menuPos.top) : "auto",
                        }}>
                          <button
                            type="button"
                            className="admin-floating-menu__item"
                            onClick={() => { setViewPost(item); setViewImageIndex(0); setOpenActionMenu(null); }}
                          >
                            <Icon n="eye" /> Shiko
                          </button>
                          {item.status === "pending" && (
                            <>
                              <button
                                type="button"
                                className="admin-floating-menu__item admin-floating-menu__item--success"
                                disabled={actionLoading === item.id}
                                onClick={() => { handleApprove(item.id); setOpenActionMenu(null); }}
                              >
                                <Icon n="check" /> Aprovo
                              </button>
                              <button
                                type="button"
                                className="admin-floating-menu__item admin-floating-menu__item--danger"
                                disabled={actionLoading === item.id}
                                onClick={() => { handleReject(item.id); setOpenActionMenu(null); }}
                              >
                                <Icon n="xmark" /> Refuzo
                              </button>
                            </>
                          )}
                          {item.status === "active" && (
                            <button
                              type="button"
                              className="admin-floating-menu__item admin-floating-menu__item--danger"
                              disabled={actionLoading === item.id}
                              onClick={() => { handleReject(item.id); setOpenActionMenu(null); }}
                            >
                              <Icon n="ban" /> Çaktivizo
                            </button>
                          )}
                          {item.status === "rejected" && (
                            <button
                              type="button"
                              className="admin-floating-menu__item admin-floating-menu__item--success"
                              disabled={actionLoading === item.id}
                              onClick={() => { handleApprove(item.id); setOpenActionMenu(null); }}
                            >
                              <Icon n="check" /> Aprovo
                            </button>
                          )}
                          <div className="admin-floating-menu__divider" />
                          <button
                            type="button"
                            className="admin-floating-menu__item admin-floating-menu__item--danger"
                            disabled={actionLoading === item.id}
                            onClick={() => { handleAdminDelete(item.id); setOpenActionMenu(null); }}
                          >
                            <Icon n="trash" /> Fshi
                          </button>
                        </div>,
                        document.body
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── REORDER TAB ──────────────────────────────────────────── */}
              {tab === "reorder" && (
          <div className="admin-table admin-table--reorder">
            <div className="admin-toolbar admin-toolbar--reorder" style={{ flexWrap: "wrap", gap: 10 }}>
              <div className="admin-segmented admin-segmented--experience">
                <button
                  className={`btn admin-segmented__option ${dragExperience === "villas" ? "btn--primary" : "btn--ghost"}`}
                  style={{ borderRadius: "8px 0 0 8px", padding: "7px 18px", fontSize: ".85rem", color: dragExperience === "villas" ? undefined : "#000" }}
                  onClick={() => { setDragExperience("villas"); setEditingOrder(null); }}
                >
                  <Icon n="house" /> Villa ({dragVillas.length})
                </button>
                <button
                  className={`btn admin-segmented__option ${dragExperience === "apartments" ? "btn--primary" : "btn--ghost"}`}
                  style={{ borderRadius: "0 8px 8px 0", padding: "7px 18px", fontSize: ".85rem", color: dragExperience === "apartments" ? undefined : "#000" }}
                  onClick={() => { setDragExperience("apartments"); setEditingOrder(null); }}
                >
                  <Icon n="building" /> Apartamente ({dragApartments.length})
                </button>
              </div>
              <div className="admin-toolbar__filters admin-toolbar__filters--reorder">
                <input
                  className="auth-input admin-toolbar__field"
                  placeholder="Kerko me ID numerin..."
                  value={dragIdSearch}
                  onChange={(e) => setDragIdSearch(e.target.value)}
                  style={{ maxWidth: 200 }}
                />
              </div>
            </div>

            <div className="admin-table__viewport admin-table__viewport--reorder">
              {loadingDrag ? (
                <div className="admin-empty">
                  <p>Duke ngarkuar postet aktive...</p>
                </div>
              ) : currentDragList.length === 0 ? (
                <div className="admin-empty">
                  <Icon n="list" style={{ fontSize: "2rem", opacity: 0.25, display: "block", marginBottom: 12 }} />
                  <p>Nuk ka {dragExperience === "apartments" ? "apartamente" : "villa"} aktive per renditje.</p>
                </div>
              ) : (
                filteredDragPosts
                  .map(({ item, realIndex }) => (
                  <div
                    className="admin-table-row drag-row"
                    key={item.id}
                  >
                    <span className="drag-order">{realIndex + 1}</span>
                    <span className="drag-id">#{item.idNumber}</span>
                    <span className="drag-title">{item.title}</span>
                    <span className="drag-author">{item.author}</span>
                    <span className="drag-actions">
                      {editingOrder === item.id ? (
                        <span className="drag-id-edit">
                          <input
                            type="number"
                            className="drag-id-input"
                            value={editOrderValue}
                            onChange={(e) => setEditOrderValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEditOrder(item.id);
                              if (e.key === "Escape") handleCancelEditOrder();
                            }}
                            autoFocus
                            min="1"
                            max={currentDragList.length}
                            placeholder="Pozita"
                          />
                          <button
                            className="btn btn--success drag-id-btn"
                            onClick={() => handleSaveEditOrder(item.id)}
                            disabled={savingOrder}
                            title="Ruaj"
                          >
                            <Icon n="check" />
                          </button>
                          <button
                            className="btn btn--ghost drag-id-btn"
                            onClick={handleCancelEditOrder}
                            title="Anulo"
                            style={{ color: '#14213D', borderColor: '#14213D' }}
                          >
                            <Icon n="xmark" />
                          </button>
                        </span>
                      ) : (
                        <button
                          className="btn btn--ghost drag-edit-btn"
                          onClick={() => handleStartEditOrder(item.id, realIndex)}
                          title="Ndrysho renditjen"
                        >
                          <Icon n="pen" />
                        </button>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── USERS TAB ────────────────────────────────────────────── */}
              {tab === "premium" && <PaidPlansAdminPanel />}

        {/* Premium management tab */}
              {tab === "premium-manager" && (
          <div className="admin-table">
            <div className="admin-toolbar" style={{ flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", gap: 0 }}>
                <button
                  className={`btn ${premiumExperience === "villas" ? "btn--primary" : "btn--ghost"}`}
                  style={{ borderRadius: "8px 0 0 8px", padding: "7px 18px", fontSize: ".85rem", color: premiumExperience === "villas" ? undefined : "#000" }}
                  onClick={() => setPremiumExperience("villas")}
                >
                  <Icon n="house" /> Villa ({premiumVillas.filter((post) => post.isPremium).length}/{premiumVillas.length})
                </button>
                <button
                  className={`btn ${premiumExperience === "apartments" ? "btn--primary" : "btn--ghost"}`}
                  style={{ borderRadius: "0 8px 8px 0", padding: "7px 18px", fontSize: ".85rem", color: premiumExperience === "apartments" ? undefined : "#000" }}
                  onClick={() => setPremiumExperience("apartments")}
                >
                  <Icon n="building" /> Apartamente ({premiumApartments.filter((post) => post.isPremium).length}/{premiumApartments.length})
                </button>
              </div>

              <div className="admin-toolbar__filters">
                <input
                  className="auth-input admin-toolbar__field"
                  placeholder="Kerko me ID, titull ose lokacion..."
                  value={premiumSearch}
                  onChange={(e) => setPremiumSearch(e.target.value)}
                  style={{ maxWidth: 280 }}
                />
              </div>

              <button className="btn btn--ghost" onClick={loadPosts}>
                <Icon n="arrows-rotate" /> Rifresko
              </button>

              {pendingPremiumEdits > 0 && (
                <button
                  className="btn btn--success"
                  disabled={premiumSavingId === "__all__"}
                  onClick={handleSaveAllPremium}
                  style={{ marginLeft: "auto" }}
                >
                  <Icon n="save" /> {premiumSavingId === "__all__" ? "Duke ruajtur..." : `Ruaj te gjitha (${pendingPremiumEdits})`}
                </button>
              )}
            </div>

            <div className="admin-premium-summary">
              <p>
                Vetem listimet aktive mund te behen premium. Numri <strong>1</strong> shfaqet i pari ne seksionin premium te faqes.
              </p>
              <p>
                Pozicionet e zena: <strong>{occupiedPremiumSlots.length ? occupiedPremiumSlots.join(", ") : "asnje"}</strong>. Pozicionet e lira:{" "}
                <strong>{availablePremiumSlots.length ? availablePremiumSlots.join(", ") : "asnje"}</strong>.
              </p>
            </div>

            <div className="admin-table-row admin-table-head premium-row">
              <span>ID</span>
              <span>Titulli</span>
              <span>Lokacioni</span>
              <span>Premium</span>
              <span>Numri</span>
              <span>Ditët</span>
              <span>Skadon më</span>
              <span>Ruaj</span>
            </div>

            {postsError && (
              <div className="admin-empty">
                <p style={{ color: "var(--error)" }}>{postsError}</p>
              </div>
            )}

            {loadingPosts ? (
              <div className="admin-empty">
                <p>Duke ngarkuar listimet aktive...</p>
              </div>
            ) : currentPremiumList.length === 0 ? (
              <div className="admin-empty">
                <Icon n="sparkles" style={{ fontSize: "2rem", opacity: 0.25, display: "block", marginBottom: 12 }} />
                <p>Nuk ka {premiumExperience === "apartments" ? "apartamente" : "villa"} aktive per premium.</p>
              </div>
            ) : filteredPremiumPosts.length === 0 ? (
              <div className="admin-empty">
                <Icon n="magnifying-glass" style={{ fontSize: "2rem", opacity: 0.25, display: "block", marginBottom: 12 }} />
                <p>Nuk u gjet asnje listim me kete kerkim.</p>
              </div>
            ) : (
              filteredPremiumPosts.map((item) => {
                const rowDraft = getPremiumRowDraft(item);
                const isSaving = premiumSavingId === item.id || premiumSavingId === "__all__";
                const expiresAt = item.premiumExpiresAt ? new Date(item.premiumExpiresAt) : null;
                const isExpired = expiresAt && expiresAt < new Date();
                const expiresLabel = expiresAt
                  ? expiresAt.toLocaleDateString("sq-AL", { day: "numeric", month: "short", year: "numeric" })
                  : null;

                return (
                  <div className={`admin-table-row premium-row${isExpired ? " premium-row--expired" : ""}`} key={item.id}>
                    <span className="moderation-id">#{item.idNumber}</span>

                    <span className="premium-row__title">
                      <strong
                        className="premium-row__title-link"
                        onClick={() => { setViewPost(item); setViewImageIndex(0); }}
                        title="Shiko detajet e listimit"
                      >
                        {item.title}
                      </strong>
                      <span
                        className="premium-row__author-link"
                        onClick={() => { setTab("users"); setQuery(item.author || item.createdByEmail || ""); }}
                        title="Shiko perdoruesin"
                      >
                        <Icon n="user" /> {item.author || "Pa autor"}
                      </span>
                      {rowDraft.isPremium && (
                        <span className="admin-premium-chip">
                          Premium{rowDraft.premiumOrder ? ` #${rowDraft.premiumOrder}` : ""}
                        </span>
                      )}
                    </span>

                    <span className="premium-row__location">{item.location || "-"}</span>

                    <label className="premium-row__switch">
                      <input
                        type="checkbox"
                        checked={rowDraft.isPremium}
                        disabled={isSaving}
                        onChange={(event) =>
                          {
                            setPostsError("");
                            updatePremiumRowDraft(item, (current) => ({
                              ...current,
                              isPremium: event.target.checked,
                              premiumOrder: event.target.checked ? current.premiumOrder : "",
                              premiumDays: event.target.checked ? current.premiumDays : "",
                            }));
                          }
                        }
                      />
                      <span className="switch-slider" />
                      <span className="switch-label">{rowDraft.isPremium ? "ON" : "OFF"}</span>
                    </label>

                    {rowDraft.isPremium && (
                      <>
                        <span className="premium-row__order">
                          <input
                            type="number"
                            min="1"
                            className="premium-row__input"
                            value={rowDraft.premiumOrder}
                            disabled={isSaving}
                            onChange={(event) =>
                              {
                                setPostsError("");
                                updatePremiumRowDraft(item, (current) => ({
                                  ...current,
                                  premiumOrder: event.target.value,
                                }));
                              }
                            }
                            placeholder="1"
                          />
                        </span>

                        <span className="premium-row__days">
                          <select
                            className="premium-row__select"
                            value={rowDraft.premiumDays === "" || rowDraft.premiumDays === null ? "" : String(rowDraft.premiumDays)}
                            disabled={isSaving}
                            onChange={(event) =>
                              {
                                setPostsError("");
                                updatePremiumRowDraft(item, (current) => ({
                                  ...current,
                                  premiumDays: event.target.value,
                                }));
                              }
                            }
                          >
                            <option value="">Pa limit</option>
                            <option value="7">7 ditë</option>
                            <option value="14">14 ditë</option>
                            <option value="30">30 ditë</option>
                            <option value="60">60 ditë</option>
                            <option value="90">90 ditë</option>
                            <option value="custom">Custom...</option>
                          </select>
                          {rowDraft.premiumDays === "custom" && (
                            <input
                              type="number"
                              min="1"
                              className="premium-row__input premium-row__input--custom"
                              placeholder="Ditë"
                              onChange={(event) =>
                                {
                                  setPostsError("");
                                  updatePremiumRowDraft(item, (current) => ({
                                    ...current,
                                    premiumDays: event.target.value && Number(event.target.value) > 0 ? event.target.value : "custom",
                                  }));
                                }
                              }
                            />
                          )}
                        </span>
                      </>
                    )}

                    {!rowDraft.isPremium && (
                      <>
                        <span className="premium-row__order premium-row__hidden" />
                        <span className="premium-row__days premium-row__hidden" />
                      </>
                    )}

                    <span className="premium-row__expires">
                      {item.isPremium && expiresLabel ? (
                        <span className={isExpired ? "premium-expired-badge" : "premium-active-badge"}>
                          {isExpired ? "Skaduar" : expiresLabel}
                        </span>
                      ) : item.isPremium ? (
                        <span className="premium-active-badge">Pa limit</span>
                      ) : (
                        "-"
                      )}
                    </span>

                    <span className="premium-row__actions">
                      <button
                        className="btn btn--primary"
                        disabled={isSaving}
                        onClick={() => handleSavePremiumRow(item)}
                      >
                        <Icon n="save" /> {isSaving ? "..." : "Ruaj"}
                      </button>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

              {tab === "users" && (
          <div className="admin-table">
            <div className="admin-toolbar">
              <input
                className="auth-input admin-toolbar__field"
                placeholder="Kerko perdorues..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="admin-toolbar__label">Renditja:</span>
              <select className="auth-input admin-toolbar__select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="createdAt">Data</option>
                <option value="name">Emri</option>
                <option value="email">Email</option>
                <option value="role">Roli</option>
                <option value="emailVerified">Email i verifikuar</option>
              </select>
              <button className="btn btn--ghost" onClick={() => setSortDir((value) => (value === "asc" ? "desc" : "asc"))}>
                {sortDir === "asc" ? "Rrites" : "Zbrites"}
              </button>
              <button className="btn btn--ghost" onClick={loadUsers}>
                Rifresko
              </button>
            </div>
            <div className="admin-table-row admin-table-head users-row">
              <span>Emri</span>
              <span>Email</span>
              <span>Roli</span>
              <span>Shpallje</span>
              <span>Telefoni</span>
              <span>Verifikim</span>
              <span>Krijuar</span>
              <span>Veprimet</span>
            </div>
            {usersError && (
              <div className="admin-empty">
                <p>{usersError}</p>
              </div>
            )}
            {loadingUsers ? (
              <div className="admin-empty">
                <p>Duke ngarkuar perdoruesit...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="admin-empty">
                <Icon n="users-slash" style={{ fontSize: "2rem", opacity: 0.25, display: "block", marginBottom: 12 }} />
                <p>Nuk ka perdorues.</p>
              </div>
            ) : (
              filteredUsers.map((item) => (
                <div className="admin-table-row users-row" key={item.id}>
                  <span style={{ fontWeight: 500, fontSize: ".88rem" }}>{item.name || "-"}</span>
                  <span style={{ fontSize: ".82rem", color: "var(--text-muted)" }}>{item.email || "-"}</span>
                  <span className={`badge badge--${item.role || "user"}`}>{item.role || "user"}</span>
                  <span style={{ fontSize: ".88rem", color: "var(--text-muted)" }}>{postsByUser[item.id] || 0}</span>
                  <span style={{ fontSize: ".82rem", color: "var(--text-muted)" }}>{item.phone || "-"}</span>
                  <span style={{ fontSize: ".82rem", color: "var(--text-muted)" }}>{item.emailVerified ? "Po" : "Jo"}</span>
                  <span style={{ fontSize: ".82rem", color: "var(--text-muted)" }}>
                    {item.createdAt ? new Date(toMillis(item.createdAt)).toLocaleDateString() : "-"}
                  </span>
                  <div className="admin-table__action-group">
                    <button
                      ref={(el) => { userBtnRefs.current[item.id] = el; }}
                      type="button"
                      className="admin-action-trigger"
                      onClick={() => toggleUserMenu(item.id)}
                      title="Veprimet"
                    >
                      <Icon n="settings" />
                    </button>
                    {openActionMenu === item.id && createPortal(
                      <div ref={actionMenuRef} className="admin-floating-menu" style={{
                        position: "fixed",
                        left: menuPos.left,
                        top: menuPos.openUp ? "auto" : menuPos.top,
                        bottom: menuPos.openUp ? (window.innerHeight - menuPos.top) : "auto",
                      }}>
                        <button
                          type="button"
                          className="admin-floating-menu__item admin-floating-menu__item--danger"
                          disabled={item.id === user.id}
                          onClick={() => { removeUser(item.id); setOpenActionMenu(null); }}
                          title={item.id === user.id ? "Nuk mund ta fshish veten" : "Fshi perdorues"}
                        >
                          <Icon n="trash" /> Fshi
                        </button>
                      </div>,
                      document.body
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── VIEW POST DETAIL MODAL ─────────────────────────────────── */}
      {viewPost && (() => {
        const p = viewPost;
        const images = Array.isArray(p.images) && p.images.length ? p.images : p.image ? [p.image] : [];
        const safeIdx = images.length ? Math.min(viewImageIndex, images.length - 1) : 0;
        const mainImg = images[safeIdx] || "";
        const hasMultiple = images.length > 1;
        const guests = p.guests ?? (p.beds ? p.beds * 2 : null);
        const createdDate = p.createdAt ? new Date(p.createdAt).toLocaleString("sq-AL") : "-";
        const approvedDate = p.approvedAt ? new Date(p.approvedAt).toLocaleString("sq-AL") : "-";

        const showPrev = () => setViewImageIndex((c) => (c <= 0 ? images.length - 1 : c - 1));
        const showNext = () => setViewImageIndex((c) => (c >= images.length - 1 ? 0 : c + 1));

        return (
          <div className="modal-overlay admin-view-overlay" onClick={() => setViewPost(null)}>
            <div className="modal-card admin-view-card" onClick={(e) => e.stopPropagation()}>
              {/* Header with close button */}
              <div className="modal-card__header">
                <button className="modal-card__close" onClick={() => setViewPost(null)} aria-label="Mbyll">
                  <Icon n="xmark" />
                </button>
              </div>
              {/* Image gallery */}
              <div className="modal-card__img-wrap">
                {mainImg ? (
                  <div
                    className="property-gallery__stage"
                    onTouchStart={(e) => {
                      const t = e.touches[0];
                      viewTouchRef.current = t ? { x: t.clientX, y: t.clientY } : null;
                    }}
                    onTouchEnd={(e) => {
                      if (!hasMultiple || !viewTouchRef.current) return;
                      const t = e.changedTouches[0];
                      if (!t) return;
                      const dx = t.clientX - viewTouchRef.current.x;
                      const dy = t.clientY - viewTouchRef.current.y;
                      viewTouchRef.current = null;
                      if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
                      if (dx < 0) showNext(); else showPrev();
                    }}
                  >
                    <img className="modal-card__img property-gallery__image" src={mainImg} alt={`${p.title} foto ${safeIdx + 1}`} />
                  </div>
                ) : (
                  <div className="modal-card__img-placeholder"><Icon n="home" /></div>
                )}
                {hasMultiple && (
                  <>
                    <button type="button" className="property-gallery__arrow property-gallery__arrow--prev" onClick={showPrev}><Icon n="chevron-left" /></button>
                    <button type="button" className="property-gallery__arrow property-gallery__arrow--next" onClick={showNext}><Icon n="chevron-right" /></button>
                    <div className="property-gallery__hud">
                      <span className="property-gallery__counter">{safeIdx + 1} / {images.length}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Body */}
              <div className="modal-card__body">
                {/* Status + ID badge row */}
                <div className="admin-view__badge-row">
                  <span className={`status-badge status-badge--${p.status || "pending"}`}>
                    {p.statusBadge || "Wait to confirm"}
                  </span>
                  <span className="moderation-id">#{p.idNumber}</span>
                  <span style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>{p.category}</span>
                  {p.isPremium && (
                    <span className="admin-premium-chip">
                      Premium{p.premiumOrder ? ` #${p.premiumOrder}` : ""}
                    </span>
                  )}
                </div>

                {/* Title + Price */}
                <div className="villa-details__title-row">
                  <h2 className="villa-details__title" style={{ fontSize: "1.3rem" }}>{p.title}</h2>
                  <span className="prop-card__price-pill">€ {p.price} / natë</span>
                </div>

                {/* Location */}
                <p className="villa-details__location">
                  <Icon n="location-dot" /> {p.location}
                </p>

                {/* Quick stats */}
                <div className="modal-meta villa-details__meta">
                  {(p.rooms > 0) && <span className="modal-meta-item"><Icon n="door-open" /> {p.rooms} dhoma</span>}
                  {(p.beds > 0) && <span className="modal-meta-item"><Icon n="bed" /> {p.beds} shtreter</span>}
                  {(p.baths > 0) && <span className="modal-meta-item"><Icon n="bath" /> {p.baths} banjo</span>}
                  {(p.area > 0) && <span className="modal-meta-item"><Icon n="ruler-combined" /> {p.area}m²</span>}
                  {guests > 0 && <span className="modal-meta-item"><Icon n="users" /> {guests} persona</span>}
                </div>

                {/* Description */}
                {p.description && (
                  <div className="admin-view__section">
                    <p className="admin-view__section-label">Pershkrimi</p>
                    <p className="villa-details__description">{p.description}</p>
                  </div>
                )}

                <div className="admin-view__section">
                  <p className="admin-view__section-label">Premium</p>
                  <div className="admin-premium-panel">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span
                        className={`paid-plan-status-badge paid-plan-status-badge--${
                          p.premiumStatus === "active"
                            ? "approved"
                            : p.premiumStatus === "pending"
                            ? "pending"
                            : p.premiumStatus === "rejected"
                            ? "rejected"
                            : "expired"
                        }`}
                      >
                        {p.premiumStatus === "active"
                          ? "Premium aktiv"
                          : p.premiumStatus === "pending"
                          ? "Premium ne pritje"
                          : p.premiumStatus === "rejected"
                          ? "Premium refuzuar"
                          : p.premiumStatus === "expired"
                          ? "Premium skaduar"
                          : "Pa plan premium"}
                      </span>
                      {p.premiumOrder ? (
                        <span className="admin-premium-chip">Pozicioni #{p.premiumOrder}</span>
                      ) : null}
                    </div>

                    {p.premiumRequestId && (
                      <p className="admin-premium-note">
                        Request ID: <strong>{p.premiumRequestId}</strong>
                      </p>
                    )}

                    {p.premiumExpiresAt && p.premiumStatus === "active" && (
                      <p className="admin-premium-note" style={{ marginTop: 8 }}>
                        <Icon n="calendar" /> Skadon me: <strong>
                          {new Date(p.premiumExpiresAt).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" })}
                        </strong>
                      </p>
                    )}

                    {p.premiumRejectedReason && (
                      <p className="admin-premium-note">
                        Arsye refuzimi: <strong>{p.premiumRejectedReason}</strong>
                      </p>
                    )}

                    {p.showLegacyPremiumControls && premiumDraft.isPremium && (
                      <div className="admin-premium-panel__controls">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Pozicioni premium</label>
                          <input
                            type="number"
                            min="1"
                            value={premiumDraft.premiumOrder}
                            disabled={premiumSaving}
                            onChange={(event) =>
                              setPremiumDraft((current) => ({ ...current, premiumOrder: event.target.value }))
                            }
                            placeholder="1"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Kohëzgjatja</label>
                          <select
                            value={premiumDraft.premiumDays === "" || premiumDraft.premiumDays === null ? "" : String(premiumDraft.premiumDays)}
                            disabled={premiumSaving}
                            onChange={(event) =>
                              setPremiumDraft((current) => ({ ...current, premiumDays: event.target.value }))
                            }
                          >
                            <option value="">Pa limit</option>
                            <option value="7">7 ditë</option>
                            <option value="14">14 ditë</option>
                            <option value="30">30 ditë</option>
                            <option value="60">60 ditë</option>
                            <option value="90">90 ditë</option>
                          </select>
                        </div>

                        <button
                          className="btn btn--primary"
                          type="button"
                          disabled={premiumSaving}
                          onClick={() => handleSavePremium(p.id)}
                        >
                          <Icon n="save" /> {premiumSaving ? "Duke ruajtur..." : "Ruaj premium"}
                        </button>
                      </div>
                    )}

                    {p.showLegacyPremiumControls && p.premiumExpiresAt && premiumDraft.isPremium && (
                      <p className="admin-premium-note" style={{ marginTop: 8 }}>
                        <Icon n="calendar" /> Skadon më: <strong>
                          {new Date(p.premiumExpiresAt).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" })}
                        </strong>
                        {new Date(p.premiumExpiresAt) < new Date() && (
                          <span className="premium-expired-badge" style={{ marginLeft: 8 }}>Skaduar</span>
                        )}
                      </p>
                    )}

                    <p className="admin-premium-note">
                      Menaxhimi i planeve me pagese behet vetem nga seksioni "Planet me pagese". Deshmia e pageses ruhet per verifikim dhe nuk aktivizon me premium automatikisht.
                    </p>
                  </div>
                </div>

                {/* Features */}
                {Array.isArray(p.features) && p.features.length > 0 && (
                  <div className="admin-view__section">
                    <p className="admin-view__section-label">Vecorite</p>
                    <div className="property-features">
                      {p.features.map((f) => (
                        <span key={f} className="property-feature">
                          <Icon n={FEATURE_ICONS[f] || "check"} /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact & Author info */}
                <div className="admin-view__section">
                  <p className="admin-view__section-label">Informacione</p>
                  <div className="admin-view__info-grid">
                    <div className="admin-view__info-item">
                      <Icon n="user" /> <strong>Autori:</strong> {p.author || "-"}
                    </div>
                    <div className="admin-view__info-item">
                      <Icon n="envelope" /> <strong>Email:</strong> {p.createdByEmail || p.createdBy || "-"}
                    </div>
                    {p.companyName && (
                      <div className="admin-view__info-item">
                        <Icon n="building" /> <strong>Kompania:</strong> {p.companyName}
                      </div>
                    )}
                    {p.whatsapp && (
                      <div className="admin-view__info-item">
                        <Icon n="phone" /> <strong>WhatsApp:</strong> {p.whatsapp}
                      </div>
                    )}
                    <div className="admin-view__info-item">
                      <Icon n="calendar" /> <strong>Krijuar:</strong> {createdDate}
                    </div>
                    {p.status === "active" && (
                      <div className="admin-view__info-item">
                        <Icon n="calendar-check" /> <strong>Aprovuar:</strong> {approvedDate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons inside modal */}
                <div className="admin-view__actions">
                  {p.status === "pending" && (
                    <>
                      <button
                        className="btn btn--success"
                        style={{ padding: "6px 10px", fontSize: ".85rem", lineHeight: 1 }}
                        disabled={actionLoading === p.id}
                        onClick={async () => { await handleApprove(p.id); setViewPost(null); }}
                        title="Aprovo"
                      >
                        <Icon n="check" />
                      </button>
                      <button
                        className="btn btn--danger"
                        style={{ padding: "6px 10px", fontSize: ".85rem", lineHeight: 1 }}
                        disabled={actionLoading === p.id}
                        onClick={async () => { await handleReject(p.id); setViewPost(null); }}
                        title="Refuzo"
                      >
                        <Icon n="xmark" />
                      </button>
                    </>
                  )}
                  {p.status === "active" && (
                    <button
                      className="btn btn--danger"
                      style={{ padding: "6px 10px", fontSize: ".85rem", lineHeight: 1 }}
                      disabled={actionLoading === p.id}
                      onClick={async () => { await handleReject(p.id); setViewPost(null); }}
                      title="Çaktivizo"
                    >
                      <Icon n="ban" />
                    </button>
                  )}
                  {p.status === "rejected" && (
                    <button
                      className="btn btn--success"
                      style={{ padding: "6px 10px", fontSize: ".85rem", lineHeight: 1 }}
                      disabled={actionLoading === p.id}
                      onClick={async () => { await handleApprove(p.id); setViewPost(null); }}
                      title="Aprovo"
                    >
                      <Icon n="check" />
                    </button>
                  )}
                  <button className="btn btn--ghost" style={{ padding: "6px 10px", fontSize: ".85rem", lineHeight: 1 }} onClick={() => setViewPost(null)} title="Mbyll">
                    <Icon n="xmark" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
