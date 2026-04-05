import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

export type ModernSidebarItem = {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  badge?: string | number | null;
};

type ModernSidebarProps = {
  activeItemId: string;
  brand: ReactNode;
  footer?: ReactNode;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  items: ModernSidebarItem[];
  meta?: ReactNode;
  onMobileClose: () => void;
  onSelect: (id: string) => void;
  onToggleCollapse: () => void;
  subtitle?: string;
  title: string;
};

export default function ModernSidebar({
  activeItemId,
  brand,
  footer,
  isCollapsed,
  isMobileOpen,
  items,
  meta,
  onMobileClose,
  onSelect,
  onToggleCollapse,
  subtitle,
  title,
}: ModernSidebarProps) {
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 900px)").matches : false
  );

  const collapsedBrandLabel = title
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
  const isCompact = isCollapsed && !isMobileViewport;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMobileClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileOpen, onMobileClose]);

  return (
    <>
      <button
        type="button"
        className={`modern-sidebar__overlay${isMobileOpen ? " is-open" : ""}`}
        aria-label="Mbyll navigimin"
        aria-hidden={!isMobileOpen}
        tabIndex={isMobileOpen ? 0 : -1}
        onClick={onMobileClose}
      />

      <aside
        className={`modern-sidebar${isCollapsed ? " is-collapsed" : ""}${isMobileOpen ? " is-mobile-open" : ""}`}
        aria-label="Navigimi i panelit te administrimit"
      >
        <div className="modern-sidebar__panel">
          <div className="modern-sidebar__header">
            <div className="modern-sidebar__header-top">
              {isCompact ? (
                <div className="modern-sidebar__brand modern-sidebar__brand--collapsed">
                  <div className="modern-sidebar__brand-mini" aria-hidden="true" title={title}>
                    <span>{collapsedBrandLabel || "AD"}</span>
                  </div>
                </div>
              ) : (
                <div className="modern-sidebar__brand modern-sidebar__brand--expanded">{brand}</div>
              )}

              <div className="modern-sidebar__header-actions">
                <button
                  type="button"
                  className="modern-sidebar__icon-btn modern-sidebar__icon-btn--mobile"
                  aria-label="Mbyll menune"
                  onClick={onMobileClose}
                >
                  <X size={16} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className="modern-sidebar__icon-btn modern-sidebar__icon-btn--desktop"
                  aria-label={isCollapsed ? "Zgjero sidebar-in" : "Ngushto sidebar-in"}
                  onClick={onToggleCollapse}
                >
                  {isCollapsed ? <PanelLeftOpen size={18} strokeWidth={2} /> : <PanelLeftClose size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>

            {!isCompact ? (
              <div className="modern-sidebar__brand-copy">
                <strong className="modern-sidebar__title">{title}</strong>
                {subtitle ? <span className="modern-sidebar__subtitle">{subtitle}</span> : null}
              </div>
            ) : null}
          </div>

          {meta && !isCompact ? <div className="modern-sidebar__meta">{meta}</div> : null}

          <nav className="modern-sidebar__nav">
            {items.map((item) => {
              const ItemIcon = item.icon;
              const isActive = activeItemId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`modern-sidebar__item${isActive ? " is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  title={isCompact ? item.label : undefined}
                  onClick={() => {
                    onSelect(item.id);
                    onMobileClose();
                  }}
                >
                  <span className="modern-sidebar__item-icon">
                    <ItemIcon size={18} strokeWidth={1.9} />
                  </span>
                  {!isCompact ? (
                    <span className="modern-sidebar__item-copy">
                      <span className="modern-sidebar__item-label">{item.label}</span>
                      {item.description ? (
                        <span className="modern-sidebar__item-description">{item.description}</span>
                      ) : null}
                    </span>
                  ) : null}
                  {!isCompact && item.badge !== null && item.badge !== undefined && item.badge !== "" ? (
                    <span className="modern-sidebar__item-badge">{item.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {footer ? <div className="modern-sidebar__footer">{footer}</div> : null}
        </div>
      </aside>
    </>
  );
}
